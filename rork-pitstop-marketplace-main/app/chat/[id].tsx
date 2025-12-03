import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { Message } from "@/types";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getThreadById, getMessagesByThreadId, sendMessage, markThreadAsRead } = useChat();
  const { user } = useAuth();
  const [inputText, setInputText] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const scrollViewRef = useRef<any>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);
  const thread = getThreadById(id || "");

  useEffect(() => {
    const loadMessages = async () => {
      if (!id) return;
      
      setIsLoadingMessages(true);
      try {
        const loadedMessages = await getMessagesByThreadId(id);
        setMessages(loadedMessages);
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

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!id || !user) return;

    const { supabaseClient } = require("@/lib/supabase");
    const channel = supabaseClient
      .channel(`thread_messages_${id}`)
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
          const newMessage: Message = {
            id: newMsg.id,
            threadId: newMsg.thread_id,
            senderId: newMsg.sender_id,
            text: newMsg.text,
            createdAt: new Date(newMsg.created_at),
          };
          
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });

          // Scroll to bottom when new message arrives
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [id, user]);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length]);

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

  const otherUser = thread.buyerId === user?.id ? thread.seller : thread.buyer;

  const handleSend = async () => {
    if (!inputText.trim() || !user || isSending) return;

    const text = inputText.trim();
    setInputText("");
    setIsSending(true);

    try {
      await sendMessage(id || "", text, user.id);
      // Optimistically add message to UI
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        threadId: id || "",
        senderId: user.id,
        text,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, optimisticMessage]);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("[ChatScreen] Failed to send message:", error);
      // Revert optimistic update on error
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  };

  // Determine status for header
  const getStatus = (): "Online" | "Type.." | "Offline" => {
    if (isTyping) return "Type..";
    // TODO: Implement actual online status check from Supabase presence
    return "Online";
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
        otherUser={{
          displayName: otherUser?.displayName,
          avatarUrl: otherUser?.avatarUrl,
        }}
        isLoading={isLoadingMessages}
        scrollViewRef={scrollViewRef}
      />

      <MessageInput
            value={inputText}
            onChangeText={setInputText}
        onSend={handleSend}
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
