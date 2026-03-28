import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { Message } from "@/types";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import { supabaseClient } from "@/lib/supabase";

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const { getThreadById, getMessagesByThreadId, sendMessage, markThreadAsRead, isUserOnline } = useChat();
  const { user } = useAuth();
  const [inputText, setInputText] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isTyping] = useState<boolean>(false);
  const scrollViewRef = useRef<any>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);
  const messageIdsRef = useRef<Set<string>>(new Set());
  const channelRef = useRef<any>(null);
  const isInitialLoadRef = useRef<boolean>(true);
  
  const thread = getThreadById(id || "");
  const otherUser = useMemo(() => {
    if (!thread || !user) return undefined;
    return thread.buyerId === user.id ? thread.seller : thread.buyer;
  }, [thread, user]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!id) return;
      
      setIsLoadingMessages(true);
      messageIdsRef.current.clear();
      isInitialLoadRef.current = true;
      try {
        const loadedMessages = await getMessagesByThreadId(id);
        loadedMessages.forEach(msg => messageIdsRef.current.add(msg.id));
        setMessages(loadedMessages);
        
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
          isInitialLoadRef.current = false;
        }, 100);
      } catch (error) {
        console.error("[ChatScreen] Failed to load messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();

    if (id) {
      markThreadAsRead(id);
    }
  }, [id, markThreadAsRead, getMessagesByThreadId]);

  useEffect(() => {
    if (!id || !user) return;

    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channel = supabaseClient
      .channel(`thread_messages_${id}_${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${id}`,
        },
        async (payload: any) => {
          const newMsg = payload.new;
          
          if (messageIdsRef.current.has(newMsg.id)) {
            console.log("[ChatScreen] Skipping duplicate message:", newMsg.id);
            return;
          }
          
          console.log("[ChatScreen] New message received:", newMsg.id);
          
          const newMessage: Message = {
            id: newMsg.id,
            threadId: newMsg.thread_id,
            senderId: newMsg.sender_id,
            text: newMsg.text,
            imageUrl: newMsg.image_url || undefined,
            createdAt: new Date(newMsg.created_at),
          };
          
          messageIdsRef.current.add(newMessage.id);
          
          setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) {
              console.log("[ChatScreen] Message already in state:", newMessage.id);
              return prev;
            }
            const updated = [...prev, newMessage];
            
            if (!isInitialLoadRef.current) {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }
            
            return updated;
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log("[ChatScreen] Unsubscribing from channel");
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [id, user]);



  if (!thread) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <View style={styles.errorText}>Chat not found</View>
          </View>
        </View>
      </View>
    );
  }

  const handleSend = async () => {
    if (!inputText.trim() || !user || isSending) {
      return;
    }

    const text = inputText.trim();
    setInputText("");
    setIsSending(true);
    console.log("[ChatScreen] Sending message:", text);

    try {
      const sentMessage = await sendMessage(id || "", text, user.id);

      if (sentMessage) {
        messageIdsRef.current.add(sentMessage.id);
        setMessages(prev => {
          if (prev.some(msg => msg.id === sentMessage.id)) {
            console.log("[ChatScreen] Message already exists locally:", sentMessage.id);
            return prev;
          }

          const updatedMessages = [...prev, sentMessage];

          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 60);

          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("[ChatScreen] Failed to send message:", error);
      Alert.alert("Message not sent", "We couldn't send your message. Please try again.");
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendImage = async (imageUrl: string) => {
    if (!user || isSending) {
      return;
    }

    setIsSending(true);
    console.log("[ChatScreen] Sending image:", imageUrl);

    try {
      const sentMessage = await sendMessage(id || "", "", user.id, imageUrl);

      if (sentMessage) {
        messageIdsRef.current.add(sentMessage.id);
        setMessages(prev => {
          if (prev.some(msg => msg.id === sentMessage.id)) {
            console.log("[ChatScreen] Message already exists locally:", sentMessage.id);
            return prev;
          }

          const updatedMessages = [...prev, sentMessage];

          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 60);

          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("[ChatScreen] Failed to send image:", error);
      Alert.alert("Image not sent", "We couldn't send your image. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const otherUserId = thread?.buyerId === user?.id ? thread?.sellerId : thread?.buyerId;
  const userOnline = otherUserId ? isUserOnline(otherUserId) : false;

  const getStatus = (): "Online" | "Type.." | "Offline" => {
    if (isTyping) return "Type..";
    return userOnline ? "Online" : "Offline";
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <ChatHeader
        displayName={otherUser?.displayName || "Chat"}
        status={getStatus()}
        avatarUrl={otherUser?.avatarUrl}
        onBack={() => router.back()}
        onCall={() => {
          // TODO: Implement call functionality
          console.log("Call pressed");
        }}
        onVideoCall={() => {
          // TODO: Implement video call functionality
          console.log("Video call pressed");
        }}
      />

      <MessageList
        messages={messages}
        currentUserId={user?.id || ""}
        otherUser={otherUser}
        isLoading={isLoadingMessages}
        scrollViewRef={scrollViewRef}
      />

      <MessageInput
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        onSendImage={handleSendImage}
        placeholder="Enter Text"
        disabled={isSending}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContent: {
    padding: 20,
  },
  errorText: {
    fontSize: 17,
    color: "#8E8E93",
    textAlign: "center",
  },
});
