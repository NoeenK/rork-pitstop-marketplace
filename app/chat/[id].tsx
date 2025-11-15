import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Animated } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Send, Smile, Phone, Video } from "lucide-react-native";
import { useState, useRef, useEffect } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Message } from "@/types";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getThreadById, getMessagesByThreadId, sendMessage, markThreadAsRead } = useChat();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);
  const thread = getThreadById(id || "");
  const styles = createStyles(colors, isDark);
  const dynamicStyles = createDynamicStyles(insets);

  useEffect(() => {
    const loadMessages = async () => {
      if (!id) return;
      
      setIsLoadingMessages(true);
      try {
        const loadedMessages = await getMessagesByThreadId(id);
        setMessages(loadedMessages);
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
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
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, [messages.length]);

  if (!thread) {
    return (
      <View style={[styles.container, { justifyContent: "center" as const, alignItems: "center" as const }]}>
        <Text style={styles.errorText}>Chat not found</Text>
      </View>
    );
  }

  const otherUser = thread.buyerId === user?.id ? thread.seller : thread.buyer;

  const handleSend = async () => {
    if (!inputText.trim() || !user || isSending) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const text = inputText.trim();
    setInputText("");
    setIsSending(true);

    try {
      await sendMessage(id || "", text, user.id);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } finally {
      setIsSending(false);
    }
  };



  const formatTime = (date: Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const isToday = messageDate.toDateString() === now.toDateString();
    
    if (isToday) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    }
    
    return messageDate.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric"
    });
  };

  const formatMessageDate = (date: Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const isToday = messageDate.toDateString() === now.toDateString();
    
    if (isToday) {
      return "Today " + messageDate.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric" 
      });
    }
    
    return messageDate.toLocaleDateString("en-US", { 
      month: "long", 
      day: "numeric", 
      year: "numeric" 
    });
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
      
      <View style={dynamicStyles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.headerAvatarContainer}>
              {otherUser?.avatarUrl ? (
                <Image
                  source={{ uri: otherUser.avatarUrl }}
                  style={styles.headerAvatar}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.headerAvatar, styles.placeholderAvatar]}>
                  <Text style={styles.headerAvatarText}>
                    {otherUser?.displayName?.charAt(0)?.toUpperCase() || "U"}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerName} numberOfLines={1}>
                {otherUser?.displayName || "Chat"}
              </Text>
              <Text style={styles.headerStatus}>Online</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconButton}>
              <Phone size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton}>
              <Video size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>



      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoadingMessages ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Say hello to start the conversation</Text>
          </View>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.senderId === user?.id;
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
            const showTimestamp = !prevMessage || 
              (new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) > 300000;
            
            const showAvatar = !nextMessage || nextMessage.senderId !== message.senderId;

            return (
              <Animated.View 
                key={message.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                }}
              >
                {showTimestamp && (
                  <View style={styles.timestampContainer}>
                    <Text style={styles.timestampText}>
                      {formatMessageDate(message.createdAt)}
                    </Text>
                  </View>
                )}
                <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
                  {!isOwn && (
                    <View style={styles.avatarContainer}>
                      {showAvatar ? (
                        otherUser?.avatarUrl ? (
                          <Image
                            source={{ uri: otherUser.avatarUrl }}
                            style={styles.messageAvatar}
                            contentFit="cover"
                          />
                        ) : (
                          <View style={[styles.messageAvatar, styles.placeholderMessageAvatar]}>
                            <Text style={styles.messageAvatarText}>
                              {otherUser?.displayName?.charAt(0)?.toUpperCase() || "U"}
                            </Text>
                          </View>
                        )
                      ) : (
                        <View style={{ width: 32 }} />
                      )}
                    </View>
                  )}
                  <View style={[styles.messageBubble, isOwn ? styles.ownMessage : styles.otherMessage]}>
                    <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
                      {message.text}
                    </Text>
                  </View>
                </View>
                {showAvatar && (
                  <View style={[styles.timeRow, isOwn && styles.timeRowOwn]}>
                    <Text style={styles.messageTime}>
                      {formatTime(message.createdAt)}
                    </Text>
                  </View>
                )}
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      <View style={dynamicStyles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <Smile size={24} color="#8E8E93" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Enter Text"
            placeholderTextColor="#8E8E93"
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() && styles.sendButtonActive
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
          >
            <Send
              size={20}
              color={inputText.trim() ? "#FFFFFF" : "#8E8E93"}
              fill={inputText.trim() ? "#FFFFFF" : "transparent"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const createDynamicStyles = (insets: any) => StyleSheet.create({
  header: {
    paddingTop: insets.top,
    paddingBottom: 8,
  },
  inputContainer: {
    paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
  },
});

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.text,
    fontSize: 17,
    textAlign: "center" as const,
  },
  headerContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderBottomWidth: isDark ? 0 : 0.5,
    borderBottomColor: isDark ? "transparent" : "rgba(0, 0, 0, 0.1)",
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  backButtonText: {
    fontSize: 28,
    color: colors.text,
    marginTop: -4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginLeft: 12,
  },
  headerAvatarContainer: {
    marginRight: 8,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
  },
  placeholderAvatar: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: isDark ? "#3C3C3E" : "#E5E5EA",
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: isDark ? "#FFFFFF" : "#000000",
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 2,
  },
  headerStatus: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  headerActions: {
    flexDirection: "row" as const,
    gap: 16,
    marginLeft: 12,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  messagesContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 12,
  },
  timestampContainer: {
    alignItems: "center" as const,
    marginVertical: 16,
  },
  timestampText: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500" as const,
    textAlign: "center" as const,
  },
  messageRow: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    marginBottom: 2,
  },
  messageRowOwn: {
    justifyContent: "flex-end" as const,
  },
  avatarContainer: {
    width: 32,
    marginRight: 8,
    alignItems: "center" as const,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  placeholderMessageAvatar: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: isDark ? "#3C3C3E" : "#E5E5EA",
  },
  messageAvatarText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: isDark ? "#FFFFFF" : "#000000",
  },
  messageBubble: {
    maxWidth: "70%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  ownMessage: {
    backgroundColor: "#E53935",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: isDark ? "#2A2A2A" : "#F3F3F3",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: isDark ? "#FFFFFF" : "#111111",
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  ownMessageText: {
    color: "#FFFFFF",
  },
  timeRow: {
    flexDirection: "row" as const,
    marginTop: 2,
    marginBottom: 8,
    paddingLeft: 40,
  },
  timeRowOwn: {
    justifyContent: "flex-end" as const,
    paddingLeft: 0,
    paddingRight: 12,
  },
  messageTime: {
    fontSize: 12,
    color: "#8E8E93",
  },

  inputRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: colors.background,
    borderTopWidth: isDark ? 0 : 0.5,
    borderTopColor: isDark ? "transparent" : "#EAEAEA",
  },
  emojiButton: {
    width: 36,
    height: 36,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: isDark ? "#1C1C1E" : "#F5F5F5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDark ? "#2C2C2E" : "#E5E5EA",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  sendButtonActive: {
    backgroundColor: "#000000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 17,
    color: "#8E8E93",
    textAlign: "center" as const,
    fontWeight: "500" as const,
  },
});
