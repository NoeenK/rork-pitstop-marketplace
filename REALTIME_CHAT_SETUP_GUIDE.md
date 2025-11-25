# Real-Time WhatsApp-Style Chat Setup Guide

## Overview
Your app now has a complete real-time chat system with:
- ✅ Direct user-to-user messaging (not just listing-based)
- ✅ Online/offline status tracking
- ✅ Real-time message delivery using Supabase Realtime
- ✅ Read receipts
- ✅ WhatsApp-style UI with floating action button
- ✅ Contacts screen to start new chats
- ✅ Unread message badges

## Setup Instructions

### Step 1: Run the Database Migration

Go to your Supabase SQL Editor and run the SQL file:
```
ADD_DIRECT_USER_CHATS.sql
```

This will:
- Make `listing_id` optional in chat_threads (allows direct messages)
- Create `user_status` table for online/offline tracking
- Create `typing_indicators` table (for future typing status)
- Enable Realtime for these tables
- Update constraints and policies

### Step 2: Test the Chat System

1. **Start a Direct Chat:**
   - Go to the Chats tab
   - Click the floating "+" button (bottom right)
   - Select a user from the contacts list
   - This creates a direct chat thread

2. **Send Messages:**
   - Type in the message input
   - Press send or hit enter
   - Messages appear instantly with real-time updates

3. **Check Online Status:**
   - User status appears in the chat header
   - Shows "Online", "Offline", or "Type.." (when typing)
   - Status updates in real-time

4. **View Conversations:**
   - Chats list shows all conversations
   - Unread badges for new messages
   - Last message preview
   - Timestamps (Now, 5m, 2h, Yesterday, etc.)

## Features Breakdown

### 1. **Real-Time Messaging**
- Messages sync instantly via Supabase Realtime
- No need to refresh - updates happen automatically
- Optimistic UI updates (messages appear immediately)

### 2. **Online Status Tracking**
- User status is tracked in `user_status` table
- Status updates when:
  - User opens the app (sets online)
  - User closes the app (sets offline)
  - Browser/tab closes (beforeunload event)

### 3. **Direct User Chats**
- Chat with any user directly (not just through listings)
- Threads created with `listing_id = null`
- Unique constraint ensures only one direct chat per user pair

### 4. **WhatsApp-Style UI**
- Floating action button for new chats
- Clean chat bubbles (left for received, right for sent)
- Avatar support
- Unread message badges
- Search and filter functionality
- Tab filters (All, Contacts, Unknown, New)

### 5. **Read Receipts**
- Single check mark (sent)
- Double check mark in blue (read)
- Automatic marking as read when chat is opened

## API You Have Available

### ChatContext Functions
```typescript
// Get threads/messages
const { threads, messages } = useChat();

// Create direct chat
await createDirectThread(user1Id, user2Id);

// Create listing-based chat
await createThread(listingId, buyerId, sellerId);

// Send message
await sendMessage(threadId, text, senderId);

// Check online status
const isOnline = isUserOnline(userId);

// Mark thread as read
await markThreadAsRead(threadId);
```

### Navigation
```typescript
// Open contacts screen
router.push('/contacts');

// Open chat
router.push(`/chat/${threadId}`);
```

## Database Schema

### chat_threads
```sql
- id (UUID)
- listing_id (UUID, nullable) -- null = direct chat
- buyer_id (UUID)
- seller_id (UUID)
- last_message_at (timestamp)
- unread_count (integer)
```

### messages
```sql
- id (UUID)
- thread_id (UUID)
- sender_id (UUID)
- text (text)
- read_at (timestamp, nullable)
- created_at (timestamp)
```

### user_status
```sql
- user_id (UUID)
- is_online (boolean)
- last_seen (timestamp)
- updated_at (timestamp)
```

## How Real-Time Works

1. **Supabase Realtime Channels:**
   - Each user subscribes to their threads
   - Listens for new messages in their conversations
   - Listens for user status changes

2. **Optimistic Updates:**
   - Messages appear immediately in UI
   - Database confirms in background
   - UI reverts if error occurs

3. **Automatic Cleanup:**
   - Channels unsubscribe when user leaves
   - Status set to offline on app close
   - Proper cleanup in useEffect returns

## Future Enhancements

You can add:
- Typing indicators (table already created)
- Voice messages
- Image attachments
- Message reactions
- Delete messages
- Edit messages
- Push notifications for new messages
- Group chats
- Message search

## Troubleshooting

### Messages not appearing in real-time?
- Check Supabase Realtime is enabled in project settings
- Verify the SQL migration ran successfully
- Check browser console for subscription errors

### Online status not updating?
- Verify `user_status` table exists
- Check Realtime is enabled for `user_status` table
- Look for status update errors in console

### Can't create direct chats?
- Ensure SQL migration ran (removes NOT NULL constraint)
- Check unique constraint is properly set
- Verify user has permission to create threads

## You're All Set! 🎉

Your app now has a professional real-time chat system just like WhatsApp. Users can:
- Start direct conversations with anyone
- Send and receive messages instantly
- See who's online
- Track unread messages
- Enjoy a smooth, native-feeling chat experience

No external APIs needed - everything runs on Supabase!
