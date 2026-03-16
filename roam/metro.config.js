const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Enable conditional exports so @google/genai resolves correctly
config.resolver.unstable_enablePackageExports = true
config.resolver.unstable_conditionNames = ['browser', 'import', 'default']

// Add .mjs to source extensions for livekit-client
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'mjs']

// Add .glb to asset extensions for 3D models
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'glb']

module.exports = config
