import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Check, CheckCheck } from "lucide-react-native";
import { Message } from "@/types";
import { memo } from "react";

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  avatarUrl?: string;
  displayName?: string;
}

const ChatBubble = memo(function ChatBubble({ 
  message, 
  isOwn, 
  showAvatar = false,
  avatarUrl,
  displayName 
}: ChatBubbleProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <View style={[styles.container, isOwn && styles.containerOwn]}>
      {!isOwn && (
        <View style={styles.avatarContainer}>
          {showAvatar ? (
            avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {displayName?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
            )
          ) : (
            <View style={{ width: 32 }} />
          )}
        </View>
      )}
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        {message.imageUrl && (
          <Image
            source={{ uri: message.imageUrl }}
            style={styles.messageImage}
            contentFit="cover"
          />
        )}
        {message.text ? (
          <Text style={[styles.text, isOwn && styles.textOwn]}>
            {message.text}
          </Text>
        ) : null}
        <View style={[styles.metaContainer, isOwn && styles.metaContainerOwn]}>
          <Text style={styles.timeText}>{formatTime(message.createdAt)}</Text>
          {isOwn && (
            <View style={styles.readReceiptContainer}>
              {message.readAt ? (
                <CheckCheck size={14} color="#4A90E2" strokeWidth={2.5} />
              ) : (
                <Check size={14} color="#8E8E93" strokeWidth={2.5} />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  const prevReadAt = prevProps.message.readAt?.getTime();
  const nextReadAt = nextProps.message.readAt?.getTime();
  
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.text === nextProps.message.text &&
    prevReadAt === nextReadAt &&
    prevProps.isOwn === nextProps.isOwn &&
    prevProps.showAvatar === nextProps.showAvatar &&
    prevProps.avatarUrl === nextProps.avatarUrl &&
    prevProps.displayName === nextProps.displayName
  );
});

export default ChatBubble;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  containerOwn: {
    justifyContent: "flex-end",
  },
  avatarContainer: {
    width: 32,
    marginRight: 8,
    alignItems: "center",
    flexShrink: 0,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E5EA",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E5EA",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#000000",
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    alignSelf: "flex-start",
  },
  bubbleOwn: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
    alignSelf: "flex-end",
  },
  bubbleOther: {
    backgroundColor: "#E9E9EB",
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    color: "#000000",
    lineHeight: 21,
    letterSpacing: -0.3,
    flexWrap: "wrap",
  },
  textOwn: {
    color: "#FFFFFF",
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    paddingHorizontal: 2,
  },
  metaContainerOwn: {
    justifyContent: "flex-end",
  },
  timeText: {
    fontSize: 11,
    color: "#8E8E93",
  },
  readReceiptContainer: {
    marginLeft: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
});

