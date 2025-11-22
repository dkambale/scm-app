const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Uncomment below if you want to use NativeWind
// const { withNativeWind } = require('nativewind/metro');
// module.exports = withNativeWind(config, { input: './global.css' });

module.exports = config;
