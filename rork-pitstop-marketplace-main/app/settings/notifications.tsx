import { View, Text, StyleSheet, ScrollView, Switch } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIFICATION_SETTINGS_KEY = "@pitstop_notification_settings";

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    newMessages: true,
    newOffers: true,
    priceDrops: true,
    listingUpdates: true,
    promotions: false,
    communityUpdates: true,
    sound: true,
    vibration: true,
  });

  const updateSetting = async (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      console.log(`Updated ${key} to ${value}`);
    } catch (error) {
      console.log("Error saving notification settings:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "Notifications",
          headerShown: true,
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scroll}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Push Notifications</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Manage your push notification preferences
          </Text>

          <View style={[styles.settingsGroup, { backgroundColor: colors.card }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Enable Push Notifications
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Receive notifications on this device
                </Text>
              </View>
              <Switch
                value={settings.pushEnabled}
                onValueChange={(value) => updateSetting("pushEnabled", value)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Sound</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Play sound for notifications
                </Text>
              </View>
              <Switch
                value={settings.sound}
                onValueChange={(value) => updateSetting("sound", value)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
                disabled={!settings.pushEnabled}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Vibration</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Vibrate for notifications
                </Text>
              </View>
              <Switch
                value={settings.vibration}
                onValueChange={(value) => updateSetting("vibration", value)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
                disabled={!settings.pushEnabled}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Activity Notifications
          </Text>

          <View style={[styles.settingsGroup, { backgroundColor: colors.card }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>New Messages</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Get notified when someone messages you
                </Text>
              </View>
              <Switch
                value={settings.newMessages}
                onValueChange={(value) => updateSetting("newMessages", value)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>New Offers</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Get notified when someone makes an offer
                </Text>
              </View>
              <Switch
                value={settings.newOffers}
                onValueChange={(value) => updateSetting("newOffers", value)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Listing Updates
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Updates on your active listings
                </Text>
              </View>
              <Switch
                value={settings.listingUpdates}
                onValueChange={(value) => updateSetting("listingUpdates", value)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Price Drops</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Get notified about price drops on saved items
                </Text>
              </View>
              <Switch
                value={settings.priceDrops}
                onValueChange={(value) => updateSetting("priceDrops", value)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Email Notifications</Text>

          <View style={[styles.settingsGroup, { backgroundColor: colors.card }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Enable Email Notifications
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Receive notifications via email
                </Text>
              </View>
              <Switch
                value={settings.emailEnabled}
                onValueChange={(value) => updateSetting("emailEnabled", value)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Promotions & Tips
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Get updates on new features and tips
                </Text>
              </View>
              <Switch
                value={settings.promotions}
                onValueChange={(value) => updateSetting("promotions", value)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
                disabled={!settings.emailEnabled}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Community Updates
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Updates about FRC community and events
                </Text>
              </View>
              <Switch
                value={settings.communityUpdates}
                onValueChange={(value) => updateSetting("communityUpdates", value)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
                disabled={!settings.emailEnabled}
              />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            You can manage these settings at any time. Some notifications may still be sent for
            important account updates.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 16,
  },
  settingsGroup: {
    borderRadius: 12,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    gap: 16,
  },
  settingInfo: {
    flex: 1,
    gap: 4,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  divider: {
    height: 0.5,
    marginLeft: 16,
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
