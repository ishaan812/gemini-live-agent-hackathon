const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Enable conditional exports so @google/genai resolves correctly
config.resolver.unstable_enablePackageExports = true
config.resolver.unstable_conditionNames = ['browser', 'import', 'default']

module.exports = config
