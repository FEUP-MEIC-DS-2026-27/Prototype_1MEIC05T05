import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin'

const shared = {
  react: { singleton: true, strictVersion: true, requiredVersion: '18.3.1' },
  'react-dom': {
    singleton: true,
    strictVersion: true,
    requiredVersion: '18.3.1',
  },
  'react-router-dom': {
    singleton: true,
    strictVersion: true,
    requiredVersion: '7.9.6',
  },
}

export default createModuleFederationConfig({
  name: 'researcher_profile',
  filename: 'remoteEntry.js',
  manifest: true,
  exposes: { './ResearcherProfile': './src/App.tsx' },
  shareStrategy: 'loaded-first',
  shared,
  dts: false,
})
