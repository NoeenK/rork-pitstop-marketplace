import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { HelpCircle, MessageCircle, Book, Mail, Phone, ExternalLink } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function HelpScreen() {
  const helpTopics = [
    {
      title: "Getting Started",
      items: [
        "How to create an account",
        "Setting up your profile",
        "Team verification process",
        "How to post a listing",
      ],
    },
    {
      title: "Buying",
      items: [
        "How to search for parts",
        "Making an offer",
        "Payment methods",
        "Shipping options",
      ],
    },
    {
      title: "Selling",
      items: [
        "Creating your first listing",
        "Pricing strategies",
        "Negotiating with buyers",
        "Shipping best practices",
      ],
    },
    {
      title: "Safety & Trust",
      items: [
        "Protecting your account",
        "Avoiding scams",
        "Report suspicious activity",
        "Trust & verification",
      ],
    },
  ];

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@pitstop.app");
  };

  const handleCallSupport = () => {
    Linking.openURL("tel:+1234567890");
  };

  const handleOpenDocs = () => {
    Linking.openURL("https://pitstop.app/docs");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>How can we help?</Text>
        <Text style={styles.subtitle}>
          Find answers to common questions or contact our support team
        </Text>
      </View>

      <View style={styles.contactCards}>
        <TouchableOpacity style={styles.contactCard} onPress={handleContactSupport}>
          <View style={[styles.contactIcon, { backgroundColor: Colors.accent + "20" }]}>
            <Mail size={24} color={Colors.accent} />
          </View>
          <Text style={styles.contactTitle}>Email Support</Text>
          <Text style={styles.contactSubtitle}>support@pitstop.app</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={handleCallSupport}>
          <View style={[styles.contactIcon, { backgroundColor: Colors.primary + "20" }]}>
            <Phone size={24} color={Colors.primary} />
          </View>
          <Text style={styles.contactTitle}>Call Us</Text>
          <Text style={styles.contactSubtitle}>Mon-Fri 9AM-5PM</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={handleOpenDocs}>
          <View style={[styles.contactIcon, { backgroundColor: Colors.secondary + "20" }]}>
            <Book size={24} color={Colors.secondary} />
          </View>
          <Text style={styles.contactTitle}>Documentation</Text>
          <Text style={styles.contactSubtitle}>Read our guides</Text>
        </TouchableOpacity>
      </View>

      {helpTopics.map((topic, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{topic.title}</Text>
          <View style={styles.topicList}>
            {topic.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.topicItem}
                onPress={() => console.log("Open help article", item)}
              >
                <HelpCircle size={20} color={Colors.accent} />
                <Text style={styles.topicText}>{item}</Text>
                <ExternalLink size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <MessageCircle size={24} color={Colors.accent} />
        <Text style={styles.footerText}>
          Still need help? Our support team is here for you.
        </Text>
        <TouchableOpacity style={styles.chatButton} onPress={handleContactSupport}>
          <Text style={styles.chatButtonText}>Start a Conversation</Text>
        </TouchableOpacity>
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
    padding: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  contactCards: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  contactCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  topicList: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: "hidden",
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  topicText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  footer: {
    alignItems: "center",
    padding: 24,
    marginTop: 16,
  },
  footerText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
    lineHeight: 24,
  },
  chatButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.background,
  },
});
