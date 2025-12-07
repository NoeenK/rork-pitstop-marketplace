// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Set project root explicitly
const projectRoot = __dirname;

// Ignore nested directories that cause ENOENT errors
config.projectRoot = projectRoot;
config.watchFolders = [projectRoot];

// Block nested duplicate directories from being watched
const nestedDirs = [
  path.join(projectRoot, 'rork-pitstop-marketplace-main'),
  path.join(projectRoot, 'rork-pitstop-marketplace', 'rork-pitstop-marketplace-main'),
];

config.resolver = {
  ...config.resolver,
  blockList: nestedDirs.map(dir => new RegExp(dir.replace(/\\/g, '\\\\') + '.*')),
  sourceExts: [...(config.resolver?.sourceExts || []), 'tsx', 'ts', 'jsx', 'js'],
};

module.exports = config;

