const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// CSV ファイルをバイナリアセットとしてバンドルに含める
config.resolver.assetExts.push('csv');

module.exports = config;
