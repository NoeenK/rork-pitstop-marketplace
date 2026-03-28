# Step 2: Install Dependencies

## ✅ You're Here: Step 2 - Install Dependencies

Since the project uses Bun but you have Node.js/npm, here's what to do:

## Quick Install (Using npm):

**Run this in VS Code terminal:**

```powershell
# Navigate to project folder
cd C:\Users\USER\Desktop\rork-pitstop-marketplace-main\rork-pitstop-marketplace-main

# Add Node.js to PATH (if not already done)
$env:PATH += ";C:\Program Files\nodejs"

# Install all dependencies
npm install
```

**Wait for it to complete** (may take 2-5 minutes)

## Verify Installation:

After `npm install` finishes, check:
```powershell
Test-Path "node_modules"
```

If it returns `True`, you're good! ✅

## Then:

1. **Close VS Code completely**
2. **Reopen VS Code**
3. **Wait 1-2 minutes** for TypeScript to index
4. **All 7 TypeScript errors will disappear!** 🎉

## Alternative: Install Bun (Optional)

If you want to use Bun (faster, what project prefers):

```powershell
# Install Bun
powershell -c "irm bun.sh/install.ps1 | iex"

# Then install dependencies
cd C:\Users\USER\Desktop\rork-pitstop-marketplace-main\rork-pitstop-marketplace-main
bun install
```

## Note:

- **npm works perfectly** with this project
- You can use `npm run start-web` instead of `bun run start-web`
- Both package managers work the same way!

## Summary:

Run `npm install` → Wait → Restart VS Code → Errors fixed! ✅

