# PITSTOP Marketplace - Complete App Structure Analysis

## 📱 Application Overview

**PITSTOP** is a React Native marketplace application built with:
- **Framework**: Expo Router (v6) with React Native (v0.81.5)
- **Backend**: Hono.js server with tRPC
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Context API + Zustand
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Package Manager**: Bun

---

## 🏗️ Architecture Overview

### Frontend (Mobile App)
- **Platform**: iOS, Android, Web
- **Navigation**: Expo Router (file-based routing)
- **UI Framework**: React Native with NativeWind
- **State**: Multiple Context Providers + Zustand

### Backend (API Server)
- **Framework**: Hono.js
- **API Layer**: tRPC (type-safe APIs)
- **Authentication**: JWT tokens + Supabase Auth
- **OAuth**: Google OAuth integration

### Database
- **Provider**: Supabase
- **Features**: Real-time subscriptions, Row Level Security (RLS)

---

## 📂 Project Structure

```
rork-pitstop-marketplace-main/
├── app/                          # Expo Router pages (file-based routing)
│   ├── _layout.tsx              # Root layout with all providers
│   ├── index.tsx                 # Entry point
│   ├── splash.tsx                # Splash screen
│   ├── welcome.tsx               # Welcome screen
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── _layout.tsx          # Tab bar layout
│   │   ├── (home)/              # Home/Explore tab
│   │   ├── activity.tsx          # Wishlist tab
│   │   ├── sell.tsx             # Sell tab (redirects to new listing)
│   │   ├── chats.tsx            # Messages tab
│   │   └── profile.tsx          # Profile tab
│   ├── onboarding/              # Onboarding flow
│   │   ├── intro.tsx
│   │   ├── login.tsx
│   │   ├── signup-email.tsx
│   │   ├── verify-email.tsx
│   │   ├── welcome.tsx
│   │   └── consent.tsx
│   ├── auth/                    # Authentication callbacks
│   │   ├── callback.tsx
│   │   └── google-callback.tsx
│   ├── listing/                 # Listing pages
│   │   ├── [id].tsx             # Listing detail
│   │   └── new.tsx              # Create new listing
│   ├── chat/                    # Chat pages
│   │   └── [id].tsx             # Individual chat
│   ├── user/                    # User profiles
│   │   └── [id].tsx
│   ├── category/                # Category pages
│   │   └── [type].tsx
│   ├── reviews/                 # Review pages
│   │   └── [id].tsx
│   ├── profile/                 # Profile sub-pages
│   │   ├── settings.tsx
│   │   ├── listings.tsx
│   │   ├── inquiry-history.tsx
│   │   ├── recently-viewed.tsx
│   │   ├── saved.tsx
│   │   ├── search-alerts.tsx
│   │   ├── customize-feed.tsx
│   │   ├── manage-neighbourhood.tsx
│   │   ├── my-rewards.tsx
│   │   ├── karrot-harvest.tsx
│   │   ├── karrot-vision.tsx
│   │   ├── invite-friends.tsx
│   │   └── scanned-items.tsx
│   ├── settings/                # Settings pages
│   │   ├── appearance.tsx
│   │   ├── balance.tsx
│   │   ├── forum.tsx
│   │   ├── help.tsx
│   │   ├── language.tsx
│   │   ├── notifications.tsx
│   │   ├── privacy.tsx
│   │   └── verification.tsx
│   ├── search.tsx               # Search page
│   ├── filters.tsx              # Filter modal
│   ├── saved.tsx                # Saved listings
│   ├── orders.tsx               # User orders
│   ├── sales.tsx                # User sales
│   └── +not-found.tsx           # 404 page
│
├── backend/                     # Backend server code
│   ├── hono.ts                  # Hono server setup + OAuth routes
│   └── trpc/                    # tRPC router
│       ├── app-router.ts        # Main tRPC router
│       ├── create-context.ts    # tRPC context creator
│       └── routes/              # tRPC route handlers
│           └── example/
│               └── hi/
│                   └── route.ts
│   └── lib/                     # Backend utilities
│       ├── jwt.ts               # JWT token creation/verification
│       └── supabase-admin.ts    # Supabase admin client
│
├── components/                  # Reusable React components
│   ├── Button.tsx
│   ├── CategoryTab.tsx
│   ├── EmptyState.tsx
│   ├── FilterChip.tsx
│   ├── HorizontalListingCard.tsx
│   ├── ListingCard.tsx
│   ├── ScreenWrapper.tsx
│   ├── SearchBar.tsx
│   └── SectionHeader.tsx
│
├── contexts/                    # React Context providers
│   ├── ActivityContext.tsx      # User activity tracking
│   ├── AuthContext.tsx          # Authentication state
│   ├── ChatContext.tsx          # Chat/messaging state
│   ├── FeedPreferencesContext.tsx
│   ├── InquiryContext.tsx       # Product inquiries
│   ├── ListingsContext.tsx      # Marketplace listings
│   ├── LocationContext.tsx      # User location
│   ├── RecentlyViewedContext.tsx
│   ├── ReviewsContext.tsx       # Product reviews
│   ├── RewardsContext.tsx       # Rewards system
│   ├── SavedListingsContext.tsx
│   ├── SearchAlertsContext.tsx
│   └── ThemeContext.tsx         # Dark/light theme
│
├── lib/                         # Frontend utilities
│   ├── session.ts               # Session token management
│   ├── supabase.ts              # Supabase client
│   ├── trpc.ts                  # tRPC client setup
│   ├── tba.ts                   # (To be analyzed)
│   └── verification.ts          # User verification
│
├── types/                       # TypeScript type definitions
│   └── index.ts
│
├── constants/                   # App constants
│   └── colors.ts                # Color palette
│
├── mocks/                       # Mock data for development
│   ├── chats.ts
│   └── listings.ts
│
├── assets/                      # Static assets
│   └── images/
│       ├── icon.png
│       ├── splash-icon.png
│       ├── adaptive-icon.png
│       └── favicon.png
│
├── package.json                 # Dependencies & scripts
├── app.json                     # Expo configuration
├── tsconfig.json                # TypeScript configuration
└── bun.lock                     # Bun lockfile
```

---

## 🔧 Technology Stack

### Core Dependencies

#### Frontend Framework
- **expo**: ^54.0.20 - Expo SDK
- **expo-router**: ~6.0.13 - File-based routing
- **react**: 19.1.0 - React library
- **react-native**: 0.81.5 - React Native framework
- **react-dom**: 19.1.0 - React DOM for web

#### UI & Styling
- **nativewind**: ^4.1.23 - Tailwind CSS for React Native
- **lucide-react-native**: ^0.475.0 - Icon library
- **expo-image**: ~3.0.10 - Optimized image component
- **expo-linear-gradient**: ~15.0.7 - Gradient components
- **expo-blur**: ~15.0.7 - Blur effects
- **expo-glass-effect**: ~0.1.6 - Glass morphism effects

#### Navigation & Gestures
- **react-native-gesture-handler**: ~2.28.0 - Gesture handling
- **react-native-screens**: ~4.16.0 - Native screen components
- **react-native-safe-area-context**: ~5.6.0 - Safe area handling

#### State Management & Data Fetching
- **@tanstack/react-query**: ^5.90.7 - Server state management
- **zustand**: ^5.0.2 - Lightweight state management
- **@nkzw/create-context-hook**: ^1.1.0 - Context utilities

#### Backend Communication
- **@trpc/client**: ^11.7.1 - tRPC client
- **@trpc/react-query**: ^11.7.1 - React Query integration
- **@trpc/server**: ^11.7.1 - tRPC server
- **@hono/trpc-server**: ^0.4.0 - Hono + tRPC integration
- **hono**: ^4.10.4 - Web framework

#### Database & Authentication
- **@supabase/supabase-js**: ^2.79.0 - Supabase client
- **@react-native-async-storage/async-storage**: 2.2.0 - Local storage

#### Authentication
- **expo-auth-session**: ~7.0.8 - OAuth session management
- **expo-apple-authentication**: ~8.0.7 - Apple Sign In
- **expo-web-browser**: ~15.0.9 - Web browser integration

#### Media & Device Features
- **expo-camera**: ~17.0.9 - Camera access
- **expo-image-picker**: ~17.0.8 - Image picker
- **expo-location**: ~19.0.7 - Location services
- **expo-notifications**: ~0.32.12 - Push notifications
- **expo-haptics**: ~15.0.7 - Haptic feedback

#### Utilities
- **zod**: ^4.1.12 - Schema validation
- **superjson**: ^2.2.5 - JSON serialization
- **@ungap/structured-clone**: ^1.3.0 - Structured cloning
- **@stardazed/streams-text-encoding**: ^1.0.2 - Text encoding

#### AI Features
- **@ai-sdk/react**: ^2.0.89 - AI SDK for React

### Dev Dependencies
- **@babel/core**: ^7.25.2 - Babel compiler
- **@expo/ngrok**: ^4.1.0 - Ngrok tunneling
- **@types/react**: ~19.1.10 - React TypeScript types
- **eslint**: 9.31.0 - Linter
- **eslint-config-expo**: 9.2.0 - Expo ESLint config
- **typescript**: ~5.9.2 - TypeScript compiler

---

## 🔐 Authentication Flow

### Supported Methods
1. **Email/Password** - Traditional email signup/login
2. **Google OAuth** - OAuth 2.0 with Google
3. **Apple Sign In** - Native Apple authentication

### Flow Architecture
1. User initiates auth → OAuth redirect to backend
2. Backend handles OAuth callback → Creates/updates Supabase user
3. Backend generates JWT session token
4. Token returned to app via deep link
5. App stores token in AsyncStorage
6. Token sent with all tRPC requests via Authorization header

---

## 📡 API Architecture

### tRPC Setup
- **Type-safe APIs** - End-to-end type safety
- **React Query Integration** - Automatic caching & refetching
- **SuperJSON** - Enhanced JSON serialization (Dates, etc.)

### Backend Routes
- `/api/trpc/*` - tRPC endpoints
- `/api/auth/google/start` - Initiate Google OAuth
- `/api/auth/google/callback` - Google OAuth callback
- `/api/auth/session` - Verify session token
- `/` - Health check

---

## 🎨 UI/UX Features

### Theme System
- **Dark/Light Mode** - Automatic theme switching
- **ThemeContext** - Centralized theme management
- **Dynamic Colors** - Context-aware color system

### Navigation
- **Tab Navigation** - 5 main tabs (Explore, Wishlist, Sell, Messages, Profile)
- **Stack Navigation** - Modal and card presentations
- **Deep Linking** - Custom URL scheme: `pitstop://`

### User Experience
- **Haptic Feedback** - Touch feedback
- **Image Optimization** - Expo Image for performance
- **Glass Effects** - Modern UI effects
- **Gradient Backgrounds** - Visual appeal

---

## 📊 Data Management

### Context Providers (State Management)
1. **AuthContext** - User authentication state
2. **ListingsContext** - Marketplace listings
3. **ChatContext** - Messaging/chat state
4. **ActivityContext** - User activity tracking
5. **SavedListingsContext** - Saved/favorited items
6. **ReviewsContext** - Product reviews
7. **LocationContext** - User location & geolocation
8. **RecentlyViewedContext** - Browsing history
9. **SearchAlertsContext** - Search notifications
10. **FeedPreferencesContext** - Feed customization
11. **RewardsContext** - Rewards/points system
12. **InquiryContext** - Product inquiries
13. **ThemeContext** - App theme

### Data Fetching
- **React Query** - Server state caching
- **tRPC** - Type-safe API calls
- **Supabase Realtime** - Real-time subscriptions (likely)

---

## 🗄️ Database Schema (Supabase)

### Key Tables (Inferred)
- **profiles** - User profiles
  - id, email, display_name, avatar_url, full_name
- **listings** - Marketplace items
- **chats/messages** - Messaging system
- **reviews** - Product reviews
- **saved_listings** - User favorites
- **orders** - Purchase orders
- **inquiries** - Product inquiries

---

## 🚀 Key Features

### Marketplace Features
- ✅ Browse listings by category
- ✅ Search & filter listings
- ✅ Create new listings
- ✅ Save/favorite listings
- ✅ View listing details
- ✅ User profiles
- ✅ Reviews & ratings

### Social Features
- ✅ Real-time chat/messaging
- ✅ Activity feed
- ✅ User profiles
- ✅ Follow/neighborhood system

### User Features
- ✅ Authentication (Email, Google, Apple)
- ✅ Profile customization
- ✅ Settings & preferences
- ✅ Rewards system
- ✅ Search alerts
- ✅ Recently viewed items
- ✅ Inquiry history

### Advanced Features
- ✅ Location-based services
- ✅ Push notifications
- ✅ Camera integration
- ✅ Image picker
- ✅ Dark/Light theme
- ✅ AI integration (AI SDK)

---

## 🔧 Configuration Files

### app.json
- App name: "PITSTOP"
- Bundle ID: `com.noeen.pitstop`
- Custom URL scheme: `pitstop://`
- Permissions: Camera, Location, Notifications, etc.
- Plugins: Router, Fonts, Image Picker, Location, Notifications, Camera, Apple Auth

### tsconfig.json
- Strict mode enabled
- Path aliases: `@/*` → `./*`
- React Native JSX
- ES2020 target

---

## 📝 Environment Variables Required

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Backend API
EXPO_PUBLIC_RORK_API_BASE_URL=

# Google OAuth (Backend)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# App Redirect
APP_SCHEME_REDIRECT=pitstop://auth/google-callback
```

---

## 🎯 Next Steps for Development

1. **Install Dependencies** - Run `bun install`
2. **Setup Environment Variables** - Configure `.env` files
3. **Setup Supabase** - Configure database schema
4. **Run Backend** - Start Hono server
5. **Run Frontend** - Start Expo dev server
6. **Test Authentication** - Verify OAuth flows
7. **Test Features** - Verify all app features

---

## 📦 Installation Command

```bash
cd rork-pitstop-marketplace-main
bun install
```

---

*Generated: Complete app structure analysis for PITSTOP Marketplace*

