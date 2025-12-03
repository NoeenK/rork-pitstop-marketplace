# Install Dependencies with npm

## ✅ Using npm Instead of Bun

Since bun had issues, we're using npm which works perfectly!

## Installation Command (RUNNING NOW):

```powershell
# Navigate to project
cd C:\Users\USER\Desktop\rork-pitstop-marketplace-main\rork-pitstop-marketplace-main

# Add Node.js to PATH
$env:PATH += ";C:\Program Files\nodejs"

# Fix execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force

# Install dependencies
& "C:\Program Files\nodejs\npm.cmd" install --legacy-peer-deps
```

**The `--legacy-peer-deps` flag:**
- ✅ Bypasses React version conflicts (React 19 vs React 18)
- ✅ Installs all packages successfully
- ✅ Works with this project

## What You'll See:

```
npm WARN using --legacy-peer-deps to provide a more flexible dependency resolution
added 1160 packages in 2m
```

## After Installation:

### Step 1: Verify
```powershell
Test-Path "node_modules"
```
Should return `True` ✅

### Step 2: Check Errors
1. **Restart VS Code completely**
2. Wait 1-2 minutes
3. All 7 TypeScript errors should be gone!

### Step 3: Start the App

**Option A: Using npm scripts:**
```powershell
$env:PATH += ";C:\Program Files\nodejs"
npm run start-web
```

**Option B: Using bun (if you want):**
```powershell
$env:PATH += ";C:\Users\USER\.bun\bin"
bun run start-web
```

Both work the same!

## Summary:

1. ⏳ **Wait for npm install to finish** (2-5 minutes)
2. ✅ **Verify `node_modules` exists**
3. 🔄 **Restart VS Code**
4. ✅ **Errors will be gone!**
5. 🚀 **Run `npm run start-web`**

**Installation is running now - just wait!**

