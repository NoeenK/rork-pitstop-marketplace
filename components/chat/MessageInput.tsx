import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Smile, Paperclip, Camera, Mic, Send } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function MessageInput({
  value,
  onChangeText,
  onSend,
  placeholder = "Enter Text",
  disabled = false,
}: MessageInputProps) {
  const insets = useSafeAreaInsets();
  const hasText = value.trim().length > 0;

  const handleSend = () => {
    if (hasText && !disabled) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onSend();
    }
  };

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}
      testID="message-input-container"
    >
      <View style={styles.inputRow}>
        <TouchableOpacity
          style={styles.iconButton}
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
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!disabled}
          testID="chat-message-input"
        />

        {hasText ? (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={disabled}
            testID="chat-send-button"
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Paperclip size={20} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Camera size={20} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Mic size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    color: "#000000",
    maxHeight: 100,
    marginRight: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
});

