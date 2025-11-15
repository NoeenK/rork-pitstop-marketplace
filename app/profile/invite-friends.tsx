import { View, Text, StyleSheet, TouchableOpacity, Share } from "react-native";
import { Stack } from "expo-router";
import { UserPlus } from "lucide-react-native";

export default function InviteFriendsScreen() {
  const handleShare = async () => {
    try {
      await Share.share({
        message: "Join me on PITSTOP - Buy, Sell & Swap FRC robot parts!",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Invite friends",
          headerStyle: { backgroundColor: "#000000" },
          headerTintColor: "#FFFFFF",
          headerShadowVisible: false,
        }}
      />

      <View style={styles.content}>
        <UserPlus size={64} color="#FF6B35" />
        <Text style={styles.title}>Invite your friends</Text>
        <Text style={styles.text}>Share PITSTOP with your robotics team and friends</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Text style={styles.buttonText}>Share Invite Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
