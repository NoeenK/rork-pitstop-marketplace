# Fix Node.js PATH Issue & Install Dependencies

## The Problem:
Node.js is installed but not in your PATH, so `npm` command doesn't work.

## ✅ Solution: Fix PATH and Install Dependencies

### Step 1: Fix PATH Permanently (One-Time Setup)

**Option A: Using System Settings (Recommended)**
1. Press `Windows Key + X`
2. Click "System"
3. Click "Advanced system settings" (on the right)
4. Click "Environment Variables" button
5. Under "System variables", find and select "Path"
6. Click "Edit"
7. Click "New"
8. Add: `C:\Program Files\nodejs`
9. Click "OK" on all windows
10. **Restart VS Code completely**

**Option B: Quick Fix (Temporary - Just for this session)**
Run this in your VS Code terminal:
```powershell
$env:PATH += ";C:\Program Files\nodejs"
```

### Step 2: Install Dependencies

After fixing PATH, run:
```powershell
cd C:\Users\USER\Desktop\rork-pitstop-marketplace-main\rork-pitstop-marketplace-main
npm install
```

**OR** if PATH fix didn't work, use full path:
```powershell
cd C:\Users\USER\Desktop\rork-pitstop-marketplace-main\rork-pitstop-marketplace-main
& "C:\Program Files\nodejs\npm.cmd" install
```

### Step 3: Fix PowerShell Execution Policy (If Needed)

If you get "execution policy" error, run this in PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 4: Restart VS Code

1. Close VS Code completely
2. Reopen the project
3. Wait 1-2 minutes for TypeScript to index
4. All 7 errors should disappear! ✅

## Quick One-Liner (If PATH is fixed):

```powershell
cd C:\Users\USER\Desktop\rork-pitstop-marketplace-main\rork-pitstop-marketplace-main; npm install
```

## Verify Installation:

After running `npm install`, check:
```powershell
Test-Path "node_modules"
```

If it returns `True`, dependencies are installed!

## Summary:

1. ✅ Add Node.js to PATH (permanently)
2. ✅ Restart VS Code
3. ✅ Run `npm install`
4. ✅ Restart VS Code again
5. ✅ TypeScript errors will be gone!

