import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Platform } from "react-native";
import { ChatThread, Message, Offer } from "@/types";
import { supabaseClient } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

export const [ChatProvider, useChat] = createContextHook(() => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;

    const loadThreads = async () => {
      console.log("[ChatContext] Loading threads for user:", user.id);
      const { data, error } = await supabaseClient
        .from('chat_threads')
        .select(`
          *,
          listing:listings(*),
          buyer:profiles!buyer_id(*),
          seller:profiles!seller_id(*)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error("[ChatContext] Error loading threads:", error);
        setThreads([]);
        setMessages({});
        return;
      }

      if (data && data.length > 0) {
        const threadIds = data.map(t => t.id);
        
        const { data: lastMessages } = await supabaseClient
          .from('messages')
          .select('*')
          .in('thread_id', threadIds)
          .order('created_at', { ascending: false });

        const lastMessageMap: Record<string, Message> = {};
        lastMessages?.forEach(msg => {
          if (!lastMessageMap[msg.thread_id]) {
            lastMessageMap[msg.thread_id] = {
              id: msg.id,
              threadId: msg.thread_id,
              senderId: msg.sender_id,
              text: msg.text,
              createdAt: new Date(msg.created_at),
              readAt: msg.read_at ? new Date(msg.read_at) : undefined,
            };
          }
        });

        const formattedThreads: ChatThread[] = data.map((thread: any) => ({
          id: thread.id,
          listingId: thread.listing_id,
          listing: thread.listing ? {
            id: thread.listing.id,
            sellerId: thread.listing.seller_id,
            title: thread.listing.title,
            description: thread.listing.description,
            category: thread.listing.category,
            condition: thread.listing.condition,
            priceCents: thread.listing.price_cents,
            isSwapOnly: thread.listing.is_swap_only,
            city: thread.listing.city,
            country: thread.listing.country,
            images: thread.listing.images || [],
            seasonTag: thread.listing.season_tag,
            roboticsCategory: 'FRC',
            isActive: thread.listing.is_active,
            createdAt: new Date(thread.listing.created_at),
            viewCount: thread.listing.view_count,
            likeCount: thread.listing.like_count,
            shareCount: thread.listing.share_count,
            chatCount: thread.listing.chat_count,
            isSold: thread.listing.is_sold,
            priceHistory: [],
          } : undefined,
          buyerId: thread.buyer_id,
          buyer: thread.buyer ? {
            id: thread.buyer.id,
            email: thread.buyer.email,
            displayName: thread.buyer.display_name || 'User',
            username: thread.buyer.username,
            phoneNumber: thread.buyer.phone_number,
            teamNumber: thread.buyer.team_number,
            schoolName: thread.buyer.school_name,
            city: thread.buyer.city,
            country: thread.buyer.country,
            isVerified: thread.buyer.is_verified,
            avatarUrl: thread.buyer.avatar_url,
            createdAt: new Date(thread.buyer.created_at),
            tradesCompleted: thread.buyer.trades_completed,
            rating: thread.buyer.rating,
            reviewCount: thread.buyer.review_count,
            responseRate: thread.buyer.response_rate,
            avgResponseTime: thread.buyer.avg_response_time,
            blockedUsers: thread.buyer.blocked_users || [],
          } : undefined,
          sellerId: thread.seller_id,
          seller: thread.seller ? {
            id: thread.seller.id,
            email: thread.seller.email,
            displayName: thread.seller.display_name || 'User',
            username: thread.seller.username,
            phoneNumber: thread.seller.phone_number,
            teamNumber: thread.seller.team_number,
            schoolName: thread.seller.school_name,
            city: thread.seller.city,
            country: thread.seller.country,
            isVerified: thread.seller.is_verified,
            avatarUrl: thread.seller.avatar_url,
            createdAt: new Date(thread.seller.created_at),
            tradesCompleted: thread.seller.trades_completed,
            rating: thread.seller.rating,
            reviewCount: thread.seller.review_count,
            responseRate: thread.seller.response_rate,
            avgResponseTime: thread.seller.avg_response_time,
            blockedUsers: thread.seller.blocked_users || [],
          } : undefined,
          lastMessage: lastMessageMap[thread.id],
          lastMessageAt: new Date(thread.last_message_at),
          unreadCount: thread.unread_count || 0,
        }));
        setThreads(formattedThreads);
        console.log("[ChatContext] Loaded threads:", formattedThreads.length);
      } else {
        console.log("[ChatContext] No threads found");
        setThreads([]);
        setMessages({});
      }
    };

    loadThreads();

    const updateUserStatus = async (isOnline: boolean) => {
      if (!user?.id) return;
      
      try {
        await supabaseClient
          .from('user_status')
          .upsert({
            user_id: user.id,
            is_online: isOnline,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
      } catch (error) {
        console.error("[ChatContext] Failed to update user status:", error);
      }
    };

    updateUserStatus(true);

    const statusChannel = supabaseClient
      .channel('user_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_status',
        },
        (payload) => {
          const status = payload.new as any;
          if (status) {
            setOnlineUsers(prev => ({
              ...prev,
              [status.user_id]: status.is_online,
            }));
          }
        }
      )
      .subscribe();

    const beforeUnloadHandler = () => {
      updateUserStatus(false);
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('beforeunload', beforeUnloadHandler);
    }

    const threadChannel = supabaseClient
      .channel(`user_threads_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_threads',
          filter: `buyer_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("[ChatContext] Thread change (buyer):", payload);
          loadThreads();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_threads',
          filter: `seller_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("[ChatContext] Thread change (seller):", payload);
          loadThreads();
        }
      )
      .subscribe();

    const lastLoadTime = { current: 0 };
    
    const messageChannel = supabaseClient
      .channel(`user_messages_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMsg = payload.new as any;
          console.log("[ChatContext] New message received for thread:", newMsg.thread_id);
          
          setThreads(prev => {
            const existingThreadIndex = prev.findIndex(t => t.id === newMsg.thread_id);
            
            if (existingThreadIndex === -1) {
              const now = Date.now();
              if (now - lastLoadTime.current > 2000) {
                lastLoadTime.current = now;
                setTimeout(() => loadThreads(), 500);
              }
              return prev;
            }
            
            const updatedThreads = [...prev];
            const thread = updatedThreads[existingThreadIndex];
            updatedThreads.splice(existingThreadIndex, 1);
            updatedThreads.unshift({
              ...thread,
              lastMessageAt: new Date(newMsg.created_at),
              lastMessage: {
                id: newMsg.id,
                threadId: newMsg.thread_id,
                senderId: newMsg.sender_id,
                text: newMsg.text,
                createdAt: new Date(newMsg.created_at),
                readAt: undefined,
              },
              unreadCount: newMsg.sender_id !== user.id ? (thread.unreadCount || 0) + 1 : thread.unreadCount || 0,
            });
            
            return updatedThreads;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log("[ChatContext] Message updated (read receipt):", payload);
          const updatedMsg = payload.new as any;
          
          setMessages(prev => {
            const threadMessages = prev[updatedMsg.thread_id] || [];
            const updatedMessages = threadMessages.map(msg =>
              msg.id === updatedMsg.id
                ? {
                    ...msg,
                    readAt: updatedMsg.read_at ? new Date(updatedMsg.read_at) : undefined,
                  }
                : msg
            );
            return {
              ...prev,
              [updatedMsg.thread_id]: updatedMessages,
            };
          });
        }
      )
      .subscribe();

    return () => {
      updateUserStatus(false);
      threadChannel.unsubscribe();
      messageChannel.unsubscribe();
      statusChannel.unsubscribe();
      
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', beforeUnloadHandler);
      }
    };
  }, [user]);

  const getThreadById = useCallback((id: string) => {
    return threads.find(thread => thread.id === id);
  }, [threads]);

  const getMessagesByThreadId = useCallback(async (threadId: string) => {
    console.log("[ChatContext] Loading messages for thread:", threadId);
    const { data, error } = await supabaseClient
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("[ChatContext] Error loading messages:", error);
      return [];
    }

    if (data && data.length > 0) {
      const formattedMessages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        threadId: msg.thread_id,
        senderId: msg.sender_id,
        text: msg.text,
        createdAt: new Date(msg.created_at),
        readAt: msg.read_at ? new Date(msg.read_at) : undefined,
      }));
      
      setMessages(prev => ({
        ...prev,
        [threadId]: formattedMessages,
      }));

      console.log("[ChatContext] Loaded messages:", formattedMessages.length);
      
      return formattedMessages;
    }

    return [];
  }, []);

  const sendMessage = useCallback(async (threadId: string, text: string, senderId: string) => {
    const normalizedText = text.trim();

    if (!normalizedText) {
      throw new Error("Message cannot be empty");
    }

    setIsLoading(true);

    try {
      console.log("[ChatContext] Sending message directly to Supabase:", { 
        threadId, 
        senderId, 
        textLength: normalizedText.length,
      });

      const thread = threads.find(t => t.id === threadId);
      if (!thread) {
        console.error("[ChatContext] Thread not found:", threadId);
        throw new Error("Thread not found");
      }

      if (senderId !== thread.buyerId && senderId !== thread.sellerId) {
        console.error("[ChatContext] Permission denied:", {
          senderId,
          buyerId: thread.buyerId,
          sellerId: thread.sellerId,
        });
        throw new Error("You don't have permission to send messages in this thread");
      }

      const { data: sessionData } = await supabaseClient.auth.getSession();
      if (!sessionData?.session) {
        console.error("[ChatContext] No active session found");
        throw new Error("You need to be logged in to send messages");
      }
      
      console.log("[ChatContext] Session active, user ID:", sessionData.session.user.id);
      console.log("[ChatContext] Inserting message...");
      
      const { data: message, error: insertError } = await supabaseClient
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: senderId,
          user_id: sessionData.session.user.id, // Required: references auth.users(id)
          text: normalizedText,
          created_at: new Date().toISOString(),
        })
        .select('id, thread_id, sender_id, text, created_at, read_at')
        .single();

      if (insertError) {
        console.error("[ChatContext] Supabase insert error:", {
          error: insertError,
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        });
        
        if (insertError.code === '42501') {
          throw new Error("Permission denied. Please make sure you're logged in and part of this chat.");
        }
        
        if (insertError.message.includes('violates row-level security policy')) {
          throw new Error("You don't have permission to send messages in this thread.");
        }
        
        throw new Error(`Failed to send message: ${insertError.message}`);
      }

      if (!message) {
        console.error("[ChatContext] No message returned from insert");
        throw new Error("Failed to send message. Please try again.");
      }

      const updatedUnreadCount = (thread.unreadCount ?? 0) + 1;

      const { error: threadUpdateError } = await supabaseClient
        .from('chat_threads')
        .update({
          last_message_at: message.created_at,
          unread_count: updatedUnreadCount,
        })
        .eq('id', threadId);

      if (threadUpdateError) {
        console.error("[ChatContext] Failed to update thread metadata:", threadUpdateError);
      }

      const newMessage: Message = {
        id: message.id,
        threadId: message.thread_id,
        senderId: message.sender_id,
        text: message.text,
        createdAt: new Date(message.created_at),
        readAt: message.read_at ? new Date(message.read_at) : undefined,
      };

      setMessages(prev => ({
        ...prev,
        [threadId]: [...(prev[threadId] || []), newMessage],
      }));

      console.log("[ChatContext] Message sent successfully:", newMessage.id);
      return newMessage;
    } catch (error: any) {
      console.error("[ChatContext] Error sending message:", error);
      throw new Error(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [threads]);

  const createThread = useCallback(async (listingId: string, buyerId: string, sellerId: string) => {
    try {
      setIsLoading(true);
      console.log("[ChatContext] Creating thread for listing:", listingId);

      const { data: existing } = await supabaseClient
        .from('chat_threads')
        .select('*')
        .eq('listing_id', listingId)
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .single();

      if (existing) {
        console.log("[ChatContext] Thread already exists:", existing.id);
        const existingThread: ChatThread = {
          id: existing.id,
          listingId: existing.listing_id,
          buyerId: existing.buyer_id,
          sellerId: existing.seller_id,
          lastMessageAt: new Date(existing.last_message_at),
          unreadCount: existing.unread_count || 0,
        };
        return existingThread;
      }

      const { data, error } = await supabaseClient
        .from('chat_threads')
        .insert({
          listing_id: listingId,
          buyer_id: buyerId,
          seller_id: sellerId,
          last_message_at: new Date().toISOString(),
          unread_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.error("[ChatContext] Error creating thread:", error);
        throw error;
      }

      const newThread: ChatThread = {
        id: data.id,
        listingId: data.listing_id,
        buyerId: data.buyer_id,
        sellerId: data.seller_id,
        lastMessageAt: new Date(data.last_message_at),
        unreadCount: data.unread_count || 0,
      };

      setThreads(prev => [newThread, ...prev]);
      console.log("[ChatContext] Thread created:", newThread.id);
      return newThread;
    } catch (error) {
      console.error("[ChatContext] Failed to create thread:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDirectThread = useCallback(async (user1Id: string, user2Id: string) => {
    try {
      setIsLoading(true);
      console.log("[ChatContext] Creating direct thread between:", user1Id, user2Id);

      const [buyerId, sellerId] = [user1Id, user2Id].sort();

      const { data: existing } = await supabaseClient
        .from('chat_threads')
        .select('*')
        .is('listing_id', null)
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .single();

      if (existing) {
        console.log("[ChatContext] Direct thread already exists:", existing.id);
        const existingThread: ChatThread = {
          id: existing.id,
          listingId: undefined,
          buyerId: existing.buyer_id,
          sellerId: existing.seller_id,
          lastMessageAt: new Date(existing.last_message_at),
          unreadCount: existing.unread_count || 0,
        };
        return existingThread;
      }

      const { data, error } = await supabaseClient
        .from('chat_threads')
        .insert({
          listing_id: null,
          buyer_id: buyerId,
          seller_id: sellerId,
          last_message_at: new Date().toISOString(),
          unread_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.error("[ChatContext] Error creating direct thread:", error);
        throw error;
      }

      const newThread: ChatThread = {
        id: data.id,
        listingId: undefined,
        buyerId: data.buyer_id,
        sellerId: data.seller_id,
        lastMessageAt: new Date(data.last_message_at),
        unreadCount: data.unread_count || 0,
      };

      setThreads(prev => [newThread, ...prev]);
      console.log("[ChatContext] Direct thread created:", newThread.id);
      return newThread;
    } catch (error) {
      console.error("[ChatContext] Failed to create direct thread:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createOffer = useCallback(async (offer: Omit<Offer, "id" | "createdAt" | "status">) => {
    try {
      setIsLoading(true);
      console.log("[ChatContext] Creating offer for listing:", offer.listingId);

      const { data, error } = await supabaseClient
        .from('offers')
        .insert({
          listing_id: offer.listingId,
          buyer_id: offer.buyerId,
          offered_price_cents: offer.offeredPriceCents,
          proposed_swap_listing_id: offer.proposedSwapListingId,
          note: offer.note,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("[ChatContext] Error creating offer:", error);
        throw error;
      }

      const newOffer: Offer = {
        id: data.id,
        listingId: data.listing_id,
        buyerId: data.buyer_id,
        offeredPriceCents: data.offered_price_cents,
        proposedSwapListingId: data.proposed_swap_listing_id,
        note: data.note,
        status: data.status,
        createdAt: new Date(data.created_at),
      };

      setOffers(prev => [newOffer, ...prev]);
      console.log("[ChatContext] Offer created:", newOffer.id);
      return newOffer;
    } catch (error) {
      console.error("[ChatContext] Failed to create offer:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateOfferStatus = useCallback(async (offerId: string, status: Offer["status"]) => {
    try {
      setIsLoading(true);
      console.log("[ChatContext] Updating offer status:", offerId, status);

      const { error } = await supabaseClient
        .from('offers')
        .update({ status })
        .eq('id', offerId);

      if (error) {
        console.error("[ChatContext] Error updating offer:", error);
        throw error;
      }

      setOffers(prev =>
        prev.map(offer =>
          offer.id === offerId ? { ...offer, status } : offer
        )
      );

      console.log("[ChatContext] Offer status updated");
    } catch (error) {
      console.error("[ChatContext] Failed to update offer status:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markThreadAsRead = useCallback(async (threadId: string) => {
    if (!user) return;
    
    try {
      console.log("[ChatContext] Marking thread as read:", threadId);

      await supabaseClient.rpc('mark_messages_as_read', {
        p_thread_id: threadId,
        p_user_id: user.id,
      });

      setMessages(prev => {
        const threadMessages = prev[threadId] || [];
        const updatedMessages = threadMessages.map(msg =>
          msg.senderId !== user.id && !msg.readAt
            ? { ...msg, readAt: new Date() }
            : msg
        );
        return { ...prev, [threadId]: updatedMessages };
      });

      await supabaseClient
        .from('chat_threads')
        .update({ unread_count: 0 })
        .eq('id', threadId);

      setThreads(prev =>
        prev.map(thread =>
          thread.id === threadId ? { ...thread, unreadCount: 0 } : thread
        )
      );

      console.log("[ChatContext] Thread marked as read");
    } catch (error) {
      console.error("[ChatContext] Failed to mark thread as read:", error);
    }
  }, [user]);

  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers[userId] || false;
  }, [onlineUsers]);

  return useMemo(() => ({
    threads,
    messages,
    offers,
    isLoading,
    onlineUsers,
    getThreadById,
    getMessagesByThreadId,
    sendMessage,
    createThread,
    createDirectThread,
    createOffer,
    updateOfferStatus,
    markThreadAsRead,
    isUserOnline,
  }), [threads, messages, offers, isLoading, onlineUsers, getThreadById, getMessagesByThreadId, sendMessage, createThread, createDirectThread, createOffer, updateOfferStatus, markThreadAsRead, isUserOnline]);
});
