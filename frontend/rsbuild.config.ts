import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin"
import federation from "./module-federation.config"

const port = 3006

const strictShared = new Set(["react", "react-dom", "react-router-dom"])

type AfterEmitCompiler = {
  hooks: {
    afterEmit: {
      tap: (
        name: string,
        callback: (compilation: { outputOptions: { path?: string } }) => void
      ) => void
    }
  }
}

// Rspack's manifest writer keeps `singleton: null` and omits `strictVersion`
// even when the federation share config sets both. Record the contract on the
// emitted manifest, and write the same booleans into remoteEntry.js.
// `rsbuild dev` serves from memory and writes nothing to dist/, so a missing
// file is skipped instead of failing the dev server.
function recordStrictSharedSingletons(compiler: AfterEmitCompiler) {
  compiler.hooks.afterEmit.tap(
    "RecordStrictSharedSingletons",
    (compilation) => {
      const outputPath = compilation.outputOptions.path
      if (!outputPath) return

      for (const fileName of ["mf-manifest.json", "mf-stats.json"]) {
        const filePath = join(outputPath, fileName)
        if (!existsSync(filePath)) continue
        const document = JSON.parse(readFileSync(filePath, "utf8")) as {
          shared?: Array<{
            name?: string
            singleton?: boolean | null
            strictVersion?: boolean | null
          }>
        }
        for (const shared of document.shared ?? []) {
          if (!shared.name || !strictShared.has(shared.name)) continue
          shared.singleton = true
          shared.strictVersion = true
        }
        writeFileSync(filePath, `${JSON.stringify(document, null, 2)}\n`)
      }

      const remoteEntryPath = join(outputPath, "remoteEntry.js")
      if (!existsSync(remoteEntryPath)) return
      const remoteEntry = readFileSync(remoteEntryPath, "utf8")
      writeFileSync(
        remoteEntryPath,
        remoteEntry
          .replaceAll("singleton:1", "singleton:true")
          .replaceAll("strictVersion:1", "strictVersion:true")
      )
    }
  )
}

export default defineConfig({
  plugins: [pluginReact(), pluginModuleFederation(federation)],
  tools: {
    rspack: (config) => {
      config.plugins ??= []
      config.plugins.push({
        name: "RecordStrictSharedSingletons",
        apply: recordStrictSharedSingletons,
      })
      return config
    },
  },
  html: { title: "Researcher profile", template: "./template.html" },
  source: {
    entry: { index: "./src/index.tsx" },
  },
  server: {
    host: "0.0.0.0",
    port,
    strictPort: true,
    cors: { origin: /^http:\/\/(localhost|127\.0\.0\.1):300[0-6]$/ },
  },
  dev: { assetPrefix: "http://localhost:3006/" },
  output: { assetPrefix: "auto" },
})