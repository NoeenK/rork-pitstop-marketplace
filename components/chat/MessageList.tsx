import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { Message } from "@/types";
import ChatBubble from "./ChatBubble";
import { Image } from "expo-image";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  otherUser?: {
    displayName?: string;
    avatarUrl?: string;
  };
  isLoading?: boolean;
  scrollViewRef?: React.RefObject<ScrollView>;
}

export default function MessageList({
  messages,
  currentUserId,
  otherUser,
  isLoading = false,
  scrollViewRef,
}: MessageListProps) {
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
      return "Today, " + messageDate.toLocaleDateString("en-US", { 
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Say hello to start the conversation</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {messages.map((message, index) => {
        const isOwn = message.senderId === currentUserId;
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
        
        // Show date separator if more than 5 minutes apart or different day
        const showDateSeparator = !prevMessage || 
          (new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) > 300000 ||
          new Date(message.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();
        
        // Show avatar only for incoming messages and only if next message is from different sender
        const showAvatar = !isOwn && (!nextMessage || nextMessage.senderId !== message.senderId);
        
        // Show timestamp only on last message in a group
        const showTimestamp = !nextMessage || nextMessage.senderId !== message.senderId;

        return (
          <View key={message.id} style={styles.messageWrapper}>
            {showDateSeparator && (
              <View style={styles.dateSeparator}>
                <Text style={styles.dateText}>
                  {formatMessageDate(message.createdAt)}
                </Text>
              </View>
            )}
            <View style={[styles.messageContainer, isOwn && styles.messageContainerOwn]}>
              <ChatBubble
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                avatarUrl={otherUser?.avatarUrl}
                displayName={otherUser?.displayName}
              />
              {showTimestamp && (
                <View style={[styles.timestampContainer, isOwn && styles.timestampContainerOwn]}>
                  <Text style={styles.timestamp}>
                    {formatTime(message.createdAt)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 12,
  },
  messageWrapper: {
    marginBottom: 2,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  messageContainerOwn: {
    justifyContent: "flex-end",
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateText: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500",
    textAlign: "center",
  },
  timestampContainer: {
    flexDirection: "row",
    marginTop: 2,
    marginBottom: 8,
    paddingLeft: 40,
  },
  timestampContainerOwn: {
    justifyContent: "flex-end",
    paddingLeft: 0,
    paddingRight: 12,
  },
  timestamp: {
    fontSize: 12,
    color: "#8E8E93",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 17,
    color: "#8E8E93",
    textAlign: "center",
    fontWeight: "500",
  },
});

