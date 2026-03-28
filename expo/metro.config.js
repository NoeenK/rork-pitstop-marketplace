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

// Custom resolver to handle platform-specific modules
const defaultResolver = config.resolver || {};

config.resolver = {
  ...defaultResolver,
  blockList: nestedPatterns,
  sourceExts: [...(defaultResolver.sourceExts || []), 'tsx', 'ts', 'jsx', 'js', 'web.tsx', 'web.ts'],
  // Custom resolver to handle react-native-maps on web
  resolveRequest: (context, moduleName, platform) => {
    // Block react-native-maps on web completely - return empty module
    if (platform === 'web' && moduleName === 'react-native-maps') {
      const emptyModulePath = path.join(__dirname, 'lib', 'empty-module-stub.js');
      return {
        type: 'sourceFile',
        filePath: emptyModulePath,
      };
    }
    
    // Use default resolution for everything else
    // Call the default resolver if it exists
    const defaultResolve = defaultResolver.resolveRequest || context.resolveRequest;
    if (defaultResolve) {
      return defaultResolve(context, moduleName, platform);
    }
    
    // Final fallback
    throw new Error(`Cannot resolve module ${moduleName}`);
  },
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

