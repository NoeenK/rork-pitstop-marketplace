import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { useState } from "react";
import { Shield, Eye, Bell, Lock, Users, ChevronRight } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function PrivacyScreen() {
  const [showProfile, setShowProfile] = useState<boolean>(true);
  const [showActivity, setShowActivity] = useState<boolean>(false);
  const [allowMessages, setAllowMessages] = useState<boolean>(true);
  const [dataCollection, setDataCollection] = useState<boolean>(true);
  const [marketingEmails, setMarketingEmails] = useState<boolean>(false);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Shield size={32} color={Colors.accent} />
        </View>
        <Text style={styles.title}>Privacy & Safety</Text>
        <Text style={styles.subtitle}>
          Control who can see your profile and how we use your data
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Visibility</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Eye size={20} color={Colors.accent} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Public Profile</Text>
              <Text style={styles.settingSubtext}>Anyone can view your profile</Text>
            </View>
          </View>
          <Switch
            value={showProfile}
            onValueChange={setShowProfile}
            trackColor={{ false: Colors.border, true: Colors.accent + "40" }}
            thumbColor={showProfile ? Colors.accent : Colors.textSecondary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Users size={20} color={Colors.secondary} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Show Activity</Text>
              <Text style={styles.settingSubtext}>Display when you&apos;re online</Text>
            </View>
          </View>
          <Switch
            value={showActivity}
            onValueChange={setShowActivity}
            trackColor={{ false: Colors.border, true: Colors.accent + "40" }}
            thumbColor={showActivity ? Colors.accent : Colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Messages & Interactions</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Bell size={20} color={Colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Allow Messages</Text>
              <Text style={styles.settingSubtext}>Anyone can message you about listings</Text>
            </View>
          </View>
          <Switch
            value={allowMessages}
            onValueChange={setAllowMessages}
            trackColor={{ false: Colors.border, true: Colors.accent + "40" }}
            thumbColor={allowMessages ? Colors.accent : Colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Permissions</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Lock size={20} color={Colors.textSecondary} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Data Collection</Text>
              <Text style={styles.settingSubtext}>Help improve the app experience</Text>
            </View>
          </View>
          <Switch
            value={dataCollection}
            onValueChange={setDataCollection}
            trackColor={{ false: Colors.border, true: Colors.accent + "40" }}
            thumbColor={dataCollection ? Colors.accent : Colors.textSecondary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Bell size={20} color="#5856D6" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Marketing Emails</Text>
              <Text style={styles.settingSubtext}>Receive tips and updates</Text>
            </View>
          </View>
          <Switch
            value={marketingEmails}
            onValueChange={setMarketingEmails}
            trackColor={{ false: Colors.border, true: Colors.accent + "40" }}
            thumbColor={marketingEmails ? Colors.accent : Colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Management</Text>
        <TouchableOpacity style={styles.linkItem}>
          <Text style={styles.linkText}>Blocked Users</Text>
          <ChevronRight size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkItem}>
          <Text style={styles.linkText}>Download My Data</Text>
          <ChevronRight size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkItem}>
          <Text style={styles.linkText}>Delete Account</Text>
          <ChevronRight size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Read our full Privacy Policy to learn more about how we protect your data and respect your privacy.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  settingSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  footer: {
    padding: 16,
    marginVertical: 16,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
