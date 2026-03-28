// Wrapper script to start Metro bundler directly, bypassing Expo CLI dependency validation
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Set environment variables to skip dependency validation
process.env.EXPO_NO_DOCTOR = '1';
// Don't set CI=true as it disables watch mode
// process.env.CI = 'true';
process.env.EXPO_NO_GIT_STATUS = '1';

console.log('🚀 Starting Metro Bundler (bypassing dependency validation)...\n');

// Start Expo without invalid flags - just use basic expo start
const expoProcess = spawn('bunx', ['expo', 'start'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname,
  env: {
    ...process.env,
    EXPO_NO_DOCTOR: '1',
    // CI: 'true', // Don't set CI as it disables watch mode
    EXPO_NO_GIT_STATUS: '1',
    EXPO_SKIP_DOCTOR: '1',
  },
});

let metroStarted = false;

// Monitor stdout/stderr for Metro starting
expoProcess.stdout?.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Metro') || output.includes('Bundler') || output.includes('8081')) {
    metroStarted = true;
  }
});

expoProcess.stderr?.on('data', (data) => {
  const output = data.toString();
  // Ignore fetch errors - they're non-fatal
  if (output.includes('fetch failed') || output.includes('TypeError: fetch failed')) {
    console.log('⚠️  Network check failed (non-fatal), continuing...\n');
    return;
  }
  // Ignore ENOENT errors for nested directories
  if (output.includes('ENOENT') && output.includes('rork-pitstop-marketplace-main')) {
    return; // Silently ignore
  }
});

// Handle process errors
expoProcess.on('error', (error) => {
  if (!error.message.includes('fetch')) {
    console.error('Error starting Expo:', error.message);
  }
});

// Don't exit on non-zero codes - Metro might still be running
expoProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    // Even if Expo CLI exits with error, Metro might still be running
    // Wait a moment and check if port 8081 is still listening
    setTimeout(() => {
      const net = require('net');
      const testSocket = new net.Socket();
      testSocket.setTimeout(1000);
      testSocket.on('connect', () => {
        console.log('\n✅ Metro bundler is still running!');
        console.log('📱 Your app should be accessible at http://localhost:8081\n');
        testSocket.destroy();
      });
      testSocket.on('timeout', () => {
        testSocket.destroy();
      });
      testSocket.on('error', () => {
        // Port not available, process really exited
      });
      testSocket.connect(8081, 'localhost');
    }, 2000);
  }
});

// Keep the process alive
process.on('SIGINT', () => {
  expoProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  expoProcess.kill();
  process.exit(0);
});
