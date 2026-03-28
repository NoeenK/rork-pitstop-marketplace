# Google Maps & Image Upload Setup Guide

## ✅ Implementation Complete

This guide covers the setup for:
1. **Google Maps Integration** with real-time location tracking
2. **Image Upload** functionality in chat messages

---

## 📍 Part 1: Google Maps Setup

### Step 1: API Key Configuration
The Google Maps API key has been configured in `app.json`:
- **API Key**: `AIzaSyDfyzkoduMBgz3QNVYshaTGnPFz2gSgezo`
- The key is automatically used by `react-native-maps`

### Step 2: Install Dependencies
The `react-native-maps` package is already in `package.json`. If you need to reinstall:

```bash
npm install react-native-maps
```

### Step 3: Real-Time Location Features
The `LocationContext` now includes:
- ✅ Real-time location tracking (updates every 5 seconds or 10 meters)
- ✅ High accuracy GPS positioning
- ✅ Automatic city/country detection
- ✅ Background location support (configured in `app.json`)

### Step 4: Using Google Maps Component
A new `GoogleMapView` component is available at `components/GoogleMapView.tsx`:

```tsx
import GoogleMapView from '@/components/GoogleMapView';

<GoogleMapView
  latitude={latitude}
  longitude={longitude}
  onLocationChange={(lat, lng) => {
    // Handle location changes
  }}
  showUserLocation={true}
/>
```

---

## 📸 Part 2: Image Upload Setup

### Step 1: Database Migration
Run the SQL migration to add image support:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run `ADD_MESSAGE_IMAGE_SUPPORT.sql`
   - Adds `image_url` column to `messages` table
   - Updates constraints to allow messages with images only

### Step 2: Storage Bucket Setup
Create the storage bucket for chat images:

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Name: `chat-images`
4. **Public bucket**: ✅ **Yes** (so images can be viewed)
5. Click **"Create bucket"**

### Step 3: Storage Policies
Run the SQL to set up storage policies:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run `SETUP_CHAT_IMAGES_STORAGE.sql`
   - Allows public viewing of chat images
   - Allows authenticated users to upload images

### Step 4: Features Available
The chat system now supports:
- ✅ **Image selection** from photo library
- ✅ **Camera capture** for instant photos
- ✅ **Image preview** before sending
- ✅ **Automatic upload** to Supabase Storage
- ✅ **Image display** in chat bubbles
- ✅ **Mixed messages** (text + image, or image only)

---

## 🎯 How It Works

### Google Maps & Location
1. App requests location permissions on startup
2. Gets initial location using device GPS
3. Starts real-time tracking (updates every 5 seconds)
4. Automatically reverse geocodes to get city/country
5. All location features use the real-time coordinates

### Image Upload in Chat
1. User taps **Paperclip** (library) or **Camera** icon
2. Selects/takes a photo
3. Image preview appears above input
4. User can remove or send the image
5. On send, image uploads to `chat-images` bucket
6. Public URL is saved to message `image_url`
7. Image displays in chat bubble

---

## 📱 Testing

### Test Google Maps:
1. Open app and grant location permissions
2. Check that location updates in real-time
3. Use `GoogleMapView` component to see map
4. Verify city/country updates as you move

### Test Image Upload:
1. Open any chat conversation
2. Tap **Paperclip** or **Camera** icon
3. Select/take a photo
4. Verify preview appears
5. Send the image
6. Verify image appears in chat bubble
7. Test sending image + text together
8. Test sending image only (no text)

---

## 🔧 Troubleshooting

### Google Maps Issues:
- **Map not showing**: Check API key in `app.json`
- **Location not updating**: Check location permissions
- **Web not working**: Google Maps on web requires additional setup

### Image Upload Issues:
- **"Bucket not found"**: Create `chat-images` bucket in Supabase Dashboard
- **Upload fails**: Check storage policies in Supabase
- **Image not displaying**: Verify bucket is public
- **Permission denied**: Run `SETUP_CHAT_IMAGES_STORAGE.sql`

---

## 📝 Files Modified

### New Files:
- `components/GoogleMapView.tsx` - Google Maps component
- `ADD_MESSAGE_IMAGE_SUPPORT.sql` - Database migration
- `SETUP_CHAT_IMAGES_STORAGE.sql` - Storage policies
- `GOOGLE_MAPS_AND_IMAGE_UPLOAD_SETUP.md` - This guide

### Updated Files:
- `app.json` - Added Google Maps API key
- `types/index.ts` - Added `imageUrl` to Message interface
- `contexts/LocationContext.tsx` - Added real-time tracking
- `contexts/ChatContext.tsx` - Added image upload support
- `components/chat/MessageInput.tsx` - Added image picker
- `components/chat/ChatBubble.tsx` - Added image display
- `app/chat/[id].tsx` - Added image send handler

---

## ✅ Next Steps

1. **Run database migration**: `ADD_MESSAGE_IMAGE_SUPPORT.sql`
2. **Create storage bucket**: `chat-images` in Supabase Dashboard
3. **Run storage policies**: `SETUP_CHAT_IMAGES_STORAGE.sql`
4. **Test location tracking**: Verify real-time updates
5. **Test image upload**: Send images in chat

Everything is ready! 🎉

