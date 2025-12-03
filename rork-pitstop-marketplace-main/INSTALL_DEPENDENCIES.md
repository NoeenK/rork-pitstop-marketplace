# Install Dependencies to Fix TypeScript Errors

## The Problem:
The TypeScript errors you're seeing are because **dependencies aren't installed**. The `node_modules` folder doesn't exist.

## Solution: Install Dependencies

You need to install a package manager first, then install dependencies.

### Option 1: Install Bun (Recommended - Fastest)

1. **Install Bun:**
   - Go to: https://bun.sh
   - Download and install Bun for Windows
   - Or run in PowerShell (as Administrator):
     ```powershell
     powershell -c "irm bun.sh/install.ps1 | iex"
     ```

2. **Install dependencies:**
   ```bash
   cd rork-pitstop-marketplace-main
   bun install
   ```

### Option 2: Install Node.js & npm

1. **Install Node.js:**
   - Go to: https://nodejs.org
   - Download and install Node.js (LTS version)
   - This includes npm automatically

2. **Install dependencies:**
   ```bash
   cd rork-pitstop-marketplace-main
   npm install
   ```

### Option 3: Install Yarn

1. **Install Yarn:**
   - Go to: https://yarnpkg.com/getting-started/install
   - Follow Windows installation instructions

2. **Install dependencies:**
   ```bash
   cd rork-pitstop-marketplace-main
   yarn install
   ```

## After Installing Dependencies:

1. **Restart VS Code** completely
2. **Wait for TypeScript to re-index** (may take 1-2 minutes)
3. **Errors should disappear!**

## Quick Check:

After installing, verify:
```bash
# Check if node_modules exists
dir node_modules
```

If you see a `node_modules` folder, dependencies are installed!

## Why This Happens:

- TypeScript needs the actual installed packages to find type definitions
- Without `node_modules`, TypeScript can't resolve module imports
- Once installed, all 7 errors will disappear

## Summary:

**The errors are real** - you need to install dependencies. Once you run `bun install`, `npm install`, or `yarn install`, the TypeScript errors will go away!

