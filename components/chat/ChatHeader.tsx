import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Phone, Video } from "lucide-react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ChatHeaderProps {
  displayName: string;
  status?: "Online" | "Type.." | "Offline";
  avatarUrl?: string;
  onBack?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
}

export default function ChatHeader({
  displayName,
  status = "Offline",
  avatarUrl,
  onBack,
  onCall,
  onVideoCall,
}: ChatHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <TouchableOpacity 
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.center}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.statusText}>
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onVideoCall}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Video size={20} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onCall}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Phone size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: "#000000",
  },
  center: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E5EA",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E5EA",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  statusText: {
    fontSize: 13,
    color: "#8E8E93",
  },
  actions: {
    flexDirection: "row",
    gap: 16,
    marginLeft: 12,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});

