# Installation Guide - PITSTOP Marketplace

## Prerequisites

This project uses **Bun** as the package manager. You need to install Bun first.

---

## Step 1: Install Bun

### Windows (PowerShell)
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Alternative: Using npm (if you have Node.js)
```bash
npm install -g bun
```

### Verify Installation
```bash
bun --version
```

---

## Step 2: Navigate to Project Directory

```bash
cd rork-pitstop-marketplace-main
```

---

## Step 3: Install Dependencies

```bash
bun install
```

This will install all dependencies listed in `package.json`:
- 48 production dependencies
- 5 development dependencies

---

## Step 4: Setup Environment Variables

Create a `.env` file in the project root with:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API
EXPO_PUBLIC_RORK_API_BASE_URL=your_api_base_url

# Google OAuth (for backend)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri

# App Scheme
APP_SCHEME_REDIRECT=pitstop://auth/google-callback
```

---

## Step 5: Verify Installation

Check that all dependencies are installed:

```bash
bun run --help
```

You should see available scripts:
- `bun run start` - Start Expo dev server
- `bun run start-web` - Start web version
- `bun run lint` - Run linter

---

## Alternative: Using npm/yarn (if Bun is not available)

If you cannot install Bun, you can use npm or yarn:

```bash
npm install
# or
yarn install
```

However, the scripts in `package.json` use `bunx`, so you'll need to update them:
- Replace `bunx rork start` with `npx expo start`
- Replace `bunx rork start -p nwfospp9b67jshk0avfzy --web --tunnel` with `npx expo start --web --tunnel`

---

## Troubleshooting

### Bun not found
- Make sure Bun is installed and in your PATH
- Restart your terminal after installation
- On Windows, you may need to restart your computer

### Installation errors
- Clear cache: `bun install --force`
- Delete `node_modules` and `bun.lock` and reinstall
- Check your internet connection

### Permission errors
- Run terminal as administrator (Windows)
- Check file permissions

---

## Next Steps

After installation:
1. Setup Supabase database (see SQL setup files)
2. Configure environment variables
3. Start the backend server
4. Run `bun run start` to start the Expo app

---

*For detailed app structure, see `APP_STRUCTURE_ANALYSIS.md`*

