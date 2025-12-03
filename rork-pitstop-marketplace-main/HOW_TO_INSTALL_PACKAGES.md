# How to Install Packages - Step by Step

## ❌ Current Problem:
`npm` is not installed on your system. You need to install a package manager first.

## ✅ Solution Options:

### Option 1: Install Bun (Recommended - Fastest & What This Project Uses)

**Step 1: Install Bun**
1. Open PowerShell as **Administrator** (Right-click PowerShell → "Run as Administrator")
2. Run this command:
   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```
3. Wait for installation to complete
4. Close and reopen your terminal/VS Code

**Step 2: Verify Bun is installed**
```bash
bun --version
```

**Step 3: Install dependencies**
```bash
cd C:\Users\USER\Desktop\rork-pitstop-marketplace-main\rork-pitstop-marketplace-main
bun install
```

**Step 4: Restart VS Code**
- Close VS Code completely
- Reopen the project
- TypeScript errors will disappear!

---

### Option 2: Install Node.js (Includes npm)

**Step 1: Download Node.js**
1. Go to: https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer
4. Follow the installation wizard (accept all defaults)
5. **Restart your computer** (important!)

**Step 2: Verify installation**
Open a NEW terminal and run:
```bash
node --version
npm --version
```

Both should show version numbers.

**Step 3: Install dependencies**
```bash
cd C:\Users\USER\Desktop\rork-pitstop-marketplace-main\rork-pitstop-marketplace-main
npm install
```

**Step 4: Restart VS Code**
- Close VS Code completely
- Reopen the project
- TypeScript errors will disappear!

---

## 🎯 Which Should You Choose?

- **Bun**: Faster, newer, what this project prefers (see package.json scripts)
- **Node.js/npm**: More common, widely used, stable

**I recommend Bun** because:
- The project already uses `bun` in package.json scripts
- It's faster
- Easier to install

---

## ⚠️ Important Notes:

1. **After installing**, you MUST:
   - Close VS Code completely
   - Reopen the project
   - Wait 1-2 minutes for TypeScript to index

2. **If errors persist after installation:**
   - Press `Ctrl+Shift+P` in VS Code
   - Type: `TypeScript: Restart TS Server`
   - Press Enter

3. **Verify installation worked:**
   - Check if `node_modules` folder exists in your project
   - If it exists, dependencies are installed!

---

## 📝 Quick Checklist:

- [ ] Install Bun OR Node.js
- [ ] Restart computer (if Node.js) OR close/reopen terminal (if Bun)
- [ ] Run `bun install` OR `npm install`
- [ ] Wait for installation to complete
- [ ] Close VS Code completely
- [ ] Reopen VS Code
- [ ] Wait 1-2 minutes
- [ ] TypeScript errors should be gone! ✅

---

## 🆘 Still Having Issues?

If you're still getting errors after installing:
1. Make sure you restarted VS Code
2. Check that `node_modules` folder exists
3. Try: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
4. Check the terminal for any installation errors

