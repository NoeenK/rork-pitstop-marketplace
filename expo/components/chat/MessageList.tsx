import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { Message } from "@/types";
import ChatBubble from "./ChatBubble";
import { memo } from "react";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  otherUser?: {
    id?: string;
    displayName?: string;
    avatarUrl?: string;
  };
  isLoading?: boolean;
  scrollViewRef?: any;
}

const MessageList = memo(function MessageList({
  messages,
  currentUserId,
  otherUser,
  isLoading = false,
  scrollViewRef,
}: MessageListProps) {
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
      removeClippedSubviews={false}
    >
      {messages.map((message, index) => {
        const isOwn = message.senderId === currentUserId;
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
        
        const showDateSeparator = !prevMessage || 
          (new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) > 300000 ||
          new Date(message.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();
        
        const showAvatar = !isOwn && (!nextMessage || nextMessage.senderId !== message.senderId);

        return (
          <View key={message.id} style={styles.messageContainer}>
            {showDateSeparator && (
              <View style={styles.dateSeparator}>
                <Text style={styles.dateText}>
                  {formatMessageDate(message.createdAt)}
                </Text>
              </View>
            )}
            <ChatBubble
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
              avatarUrl={otherUser?.avatarUrl}
              displayName={otherUser?.displayName}
            />
          </View>
        );
      })}
    </ScrollView>
  );
});

export default MessageList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    paddingBottom: 12,
    flexGrow: 1,
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
    textAlign: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
  messageContainer: {
    width: "100%",
  },
});

