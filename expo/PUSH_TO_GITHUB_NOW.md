# 🚀 Push to GitHub - Complete Steps

## Step 1: Configure Git (Required First Time)

Run these commands with YOUR information:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**Replace:**
- `"Your Name"` with your actual name
- `"your.email@example.com"` with your GitHub email

## Step 2: Commit Your Changes

```bash
git commit -m "Complete refactor: Remove all demo data, implement real Supabase integration, rebuild messaging UI"
```

## Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `rork-pitstop-marketplace` (or any name)
3. **Don't** check "Initialize with README"
4. Click **"Create repository"**

## Step 4: Connect and Push

After creating the repo, GitHub shows you commands. Use these:

```bash
# Add your GitHub repository (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

**Or if you already have a repo URL, just:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 5: Authentication

If GitHub asks for login:
- **Use Personal Access Token** (not password)
- Create one at: https://github.com/settings/tokens
- Select scope: `repo` (full control)

## ✅ Done!

Your code is now on GitHub! 🎉

---

## Quick Copy-Paste Commands

```bash
# 1. Set your git identity (do this once)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 2. Commit
git commit -m "Complete refactor: Remove all demo data, implement real Supabase integration, rebuild messaging UI"

# 3. Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 4. Push
git push -u origin main
```

