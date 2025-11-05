const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const config = getDefaultConfig(__dirname);
module.exports = config; // MUST use module.exports
// module.exports = withNativeWind(config, { input: './global.css' });
