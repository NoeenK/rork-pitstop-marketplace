# Fix Installation Error - Integrity Check Failed

## The Error:
```
error: Integrity check failed for tarball: lightningcss-win32-x64-msvc
error: IntegrityCheckFailed extracting tarball from lightningcss-win32-x64-msvc
```

This is a corrupted package cache issue. Here are solutions:

## Solution 1: Clear Cache and Retry (Recommended)

**Run these commands one by one:**

```powershell
# Add Bun to PATH
$env:PATH += ";C:\Users\USER\.bun\bin"

# Clear Bun cache
bun pm cache rm

# Retry installation
bun install
```

## Solution 2: Use npm with Legacy Peer Deps

If Bun keeps failing, use npm instead:

```powershell
# Add Node.js to PATH
$env:PATH += ";C:\Program Files\nodejs"

# Install with legacy peer deps (bypasses React version conflict)
& "C:\Program Files\nodejs\npm.cmd" install --legacy-peer-deps
```

This will work even with the React 19 vs React 18 conflict.

## Solution 3: Manual Cache Clean

If cache clear doesn't work:

```powershell
# Add Bun to PATH
$env:PATH += ";C:\Users\USER\.bun\bin"

# Remove node_modules if it exists
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Remove lock file
Remove-Item bun.lockb -ErrorAction SilentlyContinue

# Clear cache
bun pm cache rm

# Fresh install
bun install
```

## Solution 4: Skip Problematic Package (Last Resort)

If nothing works, you can try:

```powershell
$env:PATH += ";C:\Users\USER\.bun\bin"
bun install --ignore-scripts
```

Then manually install the problematic package later if needed.

## Recommended: Try Solution 2 (npm with --legacy-peer-deps)

This is the most reliable:

```powershell
$env:PATH += ";C:\Program Files\nodejs"
& "C:\Program Files\nodejs\npm.cmd" install --legacy-peer-deps
```

This will:
- ✅ Install all dependencies
- ✅ Bypass React version conflicts
- ✅ Work around integrity check issues
- ✅ Create node_modules folder
- ✅ Fix TypeScript errors

## After Successful Installation:

1. **Verify:**
   ```powershell
   Test-Path "node_modules"
   ```
   Should return `True`

2. **Restart VS Code:**
   - Close completely
   - Reopen project
   - Wait 1-2 minutes
   - Errors will disappear! ✅

