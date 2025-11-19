# Supabase Usage Examples

This guide shows you how to use the Supabase integration in your PITSTOP app components.

## Authentication Examples

### Sign Up

```typescript
import { useAuth } from '@/contexts/AuthContext';

function SignUpScreen() {
  const { signUp } = useAuth();
  
  const handleSignUp = async () => {
    try {
      await signUp({
        email: 'user@example.com',
        password: 'securePassword123',
        fullName: 'John Doe',
        username: 'johndoe',
        teamNumber: 1234,
        teamName: 'Robotics Team',
      });
      
      console.log('Sign up successful! Check email for verification.');
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };
}
```

### Sign In

```typescript
import { useAuth } from '@/contexts/AuthContext';

function SignInScreen() {
  const { signIn, isLoading } = useAuth();
  
  const handleSignIn = async () => {
    try {
      await signIn('user@example.com', 'securePassword123');
      console.log('Signed in successfully!');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };
}
```

### Check Auth State

```typescript
import { useAuth } from '@/contexts/AuthContext';

function ProfileScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  
  if (!isAuthenticated) {
    return <Text>Please sign in</Text>;
  }
  
  return (
    <View>
      <Text>Welcome, {user?.displayName}!</Text>
      <Text>Email: {user?.email}</Text>
      <Text>Team: {user?.teamNumber}</Text>
    </View>
  );
}
```

### Sign Out

```typescript
import { useAuth } from '@/contexts/AuthContext';

function SettingsScreen() {
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('Signed out successfully!');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };
}
```

### Update Profile

```typescript
import { useAuth } from '@/contexts/AuthContext';

function EditProfileScreen() {
  const { updateProfile } = useAuth();
  
  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        displayName: 'Jane Doe',
        city: 'Toronto',
        country: 'Canada',
      });
      console.log('Profile updated!');
    } catch (error) {
      console.error('Update failed:', error);
    }
  };
}
```

## Chat Examples

### Load Chat Threads

```typescript
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';

function ChatsListScreen() {
  const { threads, isLoading } = useChat();
  const { user } = useAuth();
  
  if (isLoading) {
    return <Text>Loading chats...</Text>;
  }
  
  return (
    <FlatList
      data={threads}
      renderItem={({ item }) => (
        <View>
          <Text>Listing: {item.listingId}</Text>
          <Text>
            {item.buyerId === user?.id ? 'Buying from' : 'Selling to'}: 
            {item.buyerId === user?.id ? item.sellerId : item.buyerId}
          </Text>
          <Text>Last message: {item.lastMessageAt.toLocaleString()}</Text>
          {item.unreadCount > 0 && (
            <Text>{item.unreadCount} unread</Text>
          )}
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  );
}
```

### Send Message

```typescript
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

function ChatScreen({ threadId }: { threadId: string }) {
  const { sendMessage, getMessagesByThreadId } = useChat();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessagesByThreadId(threadId);
      setMessages(msgs);
    };
    loadMessages();
  }, [threadId]);
  
  const handleSend = async () => {
    if (!text.trim() || !user) return;
    
    try {
      await sendMessage(threadId, text, user.id);
      setText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  return (
    <View>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={{
            alignSelf: item.senderId === user?.id ? 'flex-end' : 'flex-start'
          }}>
            <Text>{item.text}</Text>
            <Text>{item.createdAt.toLocaleTimeString()}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
}
```

### Create Chat Thread

```typescript
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

function ListingDetailScreen({ listing }: { listing: Listing }) {
  const { createThread } = useChat();
  const { user } = useAuth();
  const router = useRouter();
  
  const handleContactSeller = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    try {
      const thread = await createThread(
        listing.id,
        user.id,
        listing.sellerId
      );
      
      router.push(`/chat/${thread.id}`);
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };
  
  return (
    <View>
      <Text>{listing.title}</Text>
      <Button title="Contact Seller" onPress={handleContactSeller} />
    </View>
  );
}
```

### Mark Thread as Read

```typescript
import { useChat } from '@/contexts/ChatContext';
import { useEffect } from 'react';

function ChatScreen({ threadId }: { threadId: string }) {
  const { markThreadAsRead } = useChat();
  
  useEffect(() => {
    markThreadAsRead(threadId);
  }, [threadId]);
  
  // ... rest of component
}
```

## Offer Examples

### Create Offer

```typescript
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';

function MakeOfferScreen({ listing }: { listing: Listing }) {
  const { createOffer } = useChat();
  const { user } = useAuth();
  const [price, setPrice] = useState('');
  
  const handleMakeOffer = async () => {
    if (!user) return;
    
    try {
      await createOffer({
        listingId: listing.id,
        buyerId: user.id,
        offeredPriceCents: parseFloat(price) * 100,
        note: 'Is this price acceptable?',
      });
      
      console.log('Offer sent!');
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  };
}
```

### Accept/Decline Offer

```typescript
import { useChat } from '@/contexts/ChatContext';

function OffersScreen({ offers }: { offers: Offer[] }) {
  const { updateOfferStatus } = useChat();
  
  const handleAccept = async (offerId: string) => {
    try {
      await updateOfferStatus(offerId, 'accepted');
      console.log('Offer accepted!');
    } catch (error) {
      console.error('Failed to accept offer:', error);
    }
  };
  
  const handleDecline = async (offerId: string) => {
    try {
      await updateOfferStatus(offerId, 'declined');
      console.log('Offer declined');
    } catch (error) {
      console.error('Failed to decline offer:', error);
    }
  };
  
  return (
    <FlatList
      data={offers}
      renderItem={({ item }) => (
        <View>
          <Text>Offer: ${(item.offeredPriceCents! / 100).toFixed(2)}</Text>
          <Text>Note: {item.note}</Text>
          {item.status === 'pending' && (
            <View>
              <Button title="Accept" onPress={() => handleAccept(item.id)} />
              <Button title="Decline" onPress={() => handleDecline(item.id)} />
            </View>
          )}
          {item.status !== 'pending' && (
            <Text>Status: {item.status}</Text>
          )}
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  );
}
```

## Direct Supabase Queries (Advanced)

For features not yet covered by contexts, you can query Supabase directly:

```typescript
import { supabaseClient } from '@/lib/supabase';

// Create a listing
async function createListing(listing: Partial<Listing>) {
  const { data, error } = await supabaseClient
    .from('listings')
    .insert({
      seller_id: listing.sellerId,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      condition: listing.condition,
      price_cents: listing.priceCents,
      city: listing.city,
      country: listing.country,
      images: listing.images,
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Get all listings
async function getListings() {
  const { data, error } = await supabaseClient
    .from('listings')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

// Search listings
async function searchListings(query: string) {
  const { data, error } = await supabaseClient
    .from('listings')
    .select('*')
    .ilike('title', `%${query}%`)
    .eq('is_active', true);
    
  if (error) throw error;
  return data;
}

// Save a listing
async function saveListing(userId: string, listingId: string) {
  const { error } = await supabaseClient
    .from('saved_listings')
    .insert({
      user_id: userId,
      listing_id: listingId,
    });
    
  if (error) throw error;
}

// Get saved listings
async function getSavedListings(userId: string) {
  const { data, error } = await supabaseClient
    .from('saved_listings')
    .select('listing_id, listings(*)')
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
}
```

## Error Handling

Always wrap Supabase calls in try-catch:

```typescript
try {
  await signIn(email, password);
} catch (error: any) {
  if (error.message?.includes('Invalid login credentials')) {
    Alert.alert('Error', 'Invalid email or password');
  } else if (error.message?.includes('Email not confirmed')) {
    Alert.alert('Error', 'Please verify your email');
  } else {
    Alert.alert('Error', 'Sign in failed. Please try again.');
  }
  console.error('Auth error:', error);
}
```

## Best Practices

1. **Always check auth state before operations**
   ```typescript
   if (!user) {
     router.push('/login');
     return;
   }
   ```

2. **Show loading states**
   ```typescript
   if (isLoading) return <ActivityIndicator />;
   ```

3. **Handle errors gracefully**
   ```typescript
   catch (error) {
     Alert.alert('Error', 'Something went wrong');
     console.error(error);
   }
   ```

4. **Clean up subscriptions**
   ```typescript
   useEffect(() => {
     const channel = supabaseClient.channel('...');
     // ... setup
     return () => channel.unsubscribe();
   }, []);
   ```

5. **Use TypeScript types**
   ```typescript
   const [user, setUser] = useState<User | null>(null);
   ```
