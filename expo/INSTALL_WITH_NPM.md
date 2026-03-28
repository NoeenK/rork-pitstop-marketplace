# Install Dependencies with npm (Since Bun Not Available)

## The Project Uses Bun, But npm Works Too!

Even though the project scripts use `bunx`, you can install dependencies with `npm` - they're compatible!

## Step 2: Install Dependencies

### Option 1: Using npm (Recommended - You Have Node.js)

**In VS Code Terminal, run:**

```powershell
# Make sure you're in the project directory
cd C:\Users\USER\Desktop\rork-pitstop-marketplace-main\rork-pitstop-marketplace-main

# Add Node.js to PATH for this session
$env:PATH += ";C:\Program Files\nodejs"

# Install dependencies
npm install
```

**This will:**
- Install all packages from `package.json`
- Create `node_modules` folder
- Fix all TypeScript errors!

### Option 2: Install Bun (If You Prefer)

If you want to use Bun (faster, what project prefers):

1. **Install Bun:**
   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

2. **Then install:**
   ```powershell
   cd C:\Users\USER\Desktop\rork-pitstop-marketplace-main\rork-pitstop-marketplace-main
   bun install
   ```

## After Installation:

1. **Verify it worked:**
   ```powershell
   Test-Path "node_modules"
   ```
   Should return `True`

2. **Restart VS Code:**
   - Close VS Code completely
   - Reopen the project
   - Wait 1-2 minutes for TypeScript to index
   - All 7 errors should disappear! ✅

## Note About Scripts:

The `package.json` scripts use `bunx`, but you can:
- **Use npm to install** (works fine!)
- **Run scripts with npm** instead:
  ```powershell
  npm run start-web
  # Instead of: bun run start-web
  ```

Both work the same way!

## Summary:

✅ **npm install** will fix all TypeScript errors
✅ Works with the same package.json
✅ No need to install Bun if you don't want to
✅ After install + VS Code restart = errors gone!

