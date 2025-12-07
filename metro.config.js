// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Set project root explicitly
const projectRoot = __dirname;

// Configure Metro to only watch the current project root
config.projectRoot = projectRoot;
config.watchFolders = [projectRoot];

// Create blocklist patterns for nested directories
const nestedPatterns = [
  /rork-pitstop-marketplace-main[\/\\]rork-pitstop-marketplace-main/,
  /rork-pitstop-marketplace[\/\\]rork-pitstop-marketplace-main/,
  /rork-pitstop-marketplace[\/\\]rork-pitstop-marketplace/,
];

config.resolver = {
  ...config.resolver,
  blockList: nestedPatterns,
  sourceExts: [...(config.resolver?.sourceExts || []), 'tsx', 'ts', 'jsx', 'js'],
};

// Configure watcher to ignore nested directories
config.watcher = {
  ...config.watcher,
  additionalExts: config.resolver.sourceExts,
  healthCheck: {
    enabled: true,
  },
};

module.exports = config;

