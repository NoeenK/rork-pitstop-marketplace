import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from "react-native";
import { MessageCircle, TrendingUp, Users, Plus, ChevronRight } from "lucide-react-native";
import { Colors } from "@/constants/colors";

interface ForumTopic {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  category: string;
  replies: number;
  views: number;
  lastActivity: Date;
  isHot: boolean;
}

export default function ForumScreen() {
  const categories = [
    { id: "1", name: "General Discussion", posts: 156, color: Colors.accent },
    { id: "2", name: "Trading Tips", posts: 89, color: Colors.secondary },
    { id: "3", name: "Robot Builds", posts: 234, color: Colors.primary },
    { id: "4", name: "Q&A", posts: 312, color: "#5856D6" },
  ];

  const hotTopics: ForumTopic[] = [
    {
      id: "1",
      title: "Best practices for shipping heavy robot parts?",
      author: "Team 7558",
      category: "Trading Tips",
      replies: 24,
      views: 156,
      lastActivity: new Date("2024-11-02T14:30:00"),
      isHot: true,
    },
    {
      id: "2",
      title: "MK4i Swerve Module Setup Guide",
      author: "Team 8717",
      category: "Robot Builds",
      replies: 45,
      views: 312,
      lastActivity: new Date("2024-11-02T11:20:00"),
      isHot: true,
    },
    {
      id: "3",
      title: "How to verify team authenticity when buying?",
      author: "Team 3456",
      category: "Q&A",
      replies: 18,
      views: 98,
      lastActivity: new Date("2024-11-01T16:45:00"),
      isHot: false,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Forum</Text>
        <Text style={styles.subtitle}>
          Connect with other FRC teams, share tips, and get help
        </Text>
      </View>

      <TouchableOpacity style={styles.createButton}>
        <Plus size={20} color={Colors.background} />
        <Text style={styles.createButtonText}>Start a Discussion</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color + "20" }]}>
                <MessageCircle size={24} color={category.color} />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryPosts}>{category.posts} posts</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Hot Topics</Text>
        </View>
        {hotTopics.map((topic) => (
          <TouchableOpacity key={topic.id} style={styles.topicCard}>
            <View style={styles.topicHeader}>
              <Text style={styles.topicTitle} numberOfLines={2}>
                {topic.title}
              </Text>
              {topic.isHot && (
                <View style={styles.hotBadge}>
                  <Text style={styles.hotBadgeText}>HOT</Text>
                </View>
              )}
            </View>
            
            <View style={styles.topicMeta}>
              <Text style={styles.topicCategory}>{topic.category}</Text>
              <Text style={styles.topicAuthor}>by {topic.author}</Text>
            </View>
            
            <View style={styles.topicStats}>
              <View style={styles.topicStat}>
                <MessageCircle size={14} color={Colors.textSecondary} />
                <Text style={styles.topicStatText}>{topic.replies} replies</Text>
              </View>
              <View style={styles.topicStat}>
                <Users size={14} color={Colors.textSecondary} />
                <Text style={styles.topicStatText}>{topic.views} views</Text>
              </View>
              <Text style={styles.topicTime}>
                {getRelativeTime(topic.lastActivity)}
              </Text>
            </View>
            
            <ChevronRight size={20} color={Colors.textSecondary} style={styles.topicArrow} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Be respectful, helpful, and follow our community guidelines
        </Text>
      </View>
    </ScrollView>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.accent,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.background,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  categoryPosts: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  topicCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: "relative" as const,
  },
  topicHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  topicTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
    lineHeight: 24,
  },
  hotBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hotBadgeText: {
    fontSize: 10,
    fontWeight: "800" as const,
    color: Colors.background,
  },
  topicMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  topicCategory: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  topicAuthor: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  topicStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  topicStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  topicStatText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  topicTime: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: "auto" as const,
  },
  topicArrow: {
    position: "absolute" as const,
    right: 16,
    top: "50%",
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
