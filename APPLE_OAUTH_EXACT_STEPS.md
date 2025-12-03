# 🍎 Apple OAuth - Exact Steps for Supabase

## ✅ Your Apple Credentials

- **Service ID:** `com.noeen.pitstop.service`
- **App ID:** `com.noeen.pitstop`
- **Key ID:** `6PSJ336YD7`
- **Configuration:** `T236AF88HR.com.noeen.pitstop`

---

## 🚀 Step 1: Get Your Team ID

1. Go to: https://developer.apple.com/account
2. Look at the **top right corner** of the page
3. You'll see your **Team ID** (it's a 10-character string like `T236AF88HR`)
4. **Copy it** - you'll need it!

---

## 🔑 Step 2: Get Your .p8 Key File

1. Go to: https://developer.apple.com/account/resources/authkeys/list
2. Find the key with **Key ID: 6PSJ336YD7**
3. **If you already downloaded it:**
   - Open the `.p8` file in a text editor
   - Copy the ENTIRE contents (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
4. **If you haven't downloaded it:**
   - Click on the key
   - Click **"Download"** button
   - **⚠️ IMPORTANT:** You can only download this once! Save it safely.
   - Open the downloaded `.p8` file
   - Copy the ENTIRE contents

---

## 📍 Step 3: Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard/project/levfwegihveainqdnwkv/auth/providers
2. Scroll down to find **"Apple"** provider
3. Click the **toggle switch** to turn it **ON** (it should turn blue/green)

---

## ✏️ Step 4: Fill in the Fields

You'll see these fields in Supabase. Fill them like this:

### Field 1: **Services ID (for Apple OAuth)**
```
com.noeen.pitstop.service
```
**Paste:** `com.noeen.pitstop.service`

---

### Field 2: **Secret Key**
```
-----BEGIN PRIVATE KEY-----
[your entire .p8 key content here]
-----END PRIVATE KEY-----
```
**Paste:** The ENTIRE contents of your `.p8` file (including the BEGIN and END lines)

---

### Field 3: **Key ID (for Apple OAuth)**
```
6PSJ336YD7
```
**Paste:** `6PSJ336YD7`

---

### Field 4: **Team ID (for Apple OAuth)**
```
T236AF88HR
```
**Paste:** Your Team ID (from Step 1 - it's probably `T236AF88HR` based on your config)

---

## 💾 Step 5: Save

1. Click the **"Save"** button at the bottom
2. Wait 1-2 minutes for changes to take effect

---

## ✅ Step 6: Test

1. Restart your app
2. Try Apple Sign In
3. It should work now! 🎉

---

## 📸 Visual Guide

The Supabase form should look like this:

```
┌─────────────────────────────────────────┐
│ Apple Provider                          │
│ [Toggle: ON]                            │
├─────────────────────────────────────────┤
│ Services ID (for Apple OAuth):          │
│ [com.noeen.pitstop.service        ]     │
│                                         │
│ Secret Key:                             │
│ [-----BEGIN PRIVATE KEY-----            │
│  [your .p8 key content]                 │
│  -----END PRIVATE KEY-----        ]     │
│                                         │
│ Key ID (for Apple OAuth):               │
│ [6PSJ336YD7                       ]     │
│                                         │
│ Team ID (for Apple OAuth):              │
│ [T236AF88HR                       ]     │
│                                         │
│              [Save]                     │
└─────────────────────────────────────────┘
```

---

## 🔗 Direct Links

- **Supabase Apple Provider:** https://supabase.com/dashboard/project/levfwegihveainqdnwkv/auth/providers
- **Apple Developer Keys:** https://developer.apple.com/account/resources/authkeys/list
- **Apple Developer Account:** https://developer.apple.com/account

---

## ⚠️ Important Notes

1. **Service ID** = `com.noeen.pitstop.service` (NOT the App ID)
2. **Secret Key** = Entire .p8 file content (all lines)
3. **Key ID** = `6PSJ336YD7`
4. **Team ID** = Your 10-character Team ID (check top right of Apple Developer portal)

---

## 🆘 If You Don't Have the .p8 File

If you can't find or download the .p8 file:

1. Go to: https://developer.apple.com/account/resources/authkeys/list
2. Check if key `6PSJ336YD7` exists
3. If it exists but you can't download it, you'll need to:
   - Create a NEW key
   - Download it immediately
   - Update the Key ID in Supabase to the new key's ID

---

**That's it! Once you save, Apple Sign In should work!** 🎉

