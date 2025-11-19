import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Message } from "@/types";

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  avatarUrl?: string;
  displayName?: string;
}

export default function ChatBubble({ 
  message, 
  isOwn, 
  showAvatar = false,
  avatarUrl,
  displayName 
}: ChatBubbleProps) {
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
        <Text style={[styles.text, isOwn && styles.textOwn]}>
          {message.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 2,
  },
  containerOwn: {
    justifyContent: "flex-end",
  },
  avatarContainer: {
    width: 32,
    marginRight: 8,
    alignItems: "center",
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
    fontWeight: "600",
    color: "#000000",
  },
  bubble: {
    maxWidth: "70%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  bubbleOwn: {
    backgroundColor: "#FFFFFF",
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    color: "#111111",
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  textOwn: {
    color: "#111111",
  },
});

