import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin"
import federation from "./module-federation.config"

const port = 3006

export default defineConfig({
  plugins: [pluginReact(), pluginModuleFederation(federation)],
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
