import { User } from "@/types";

export const mapProfileToUser = (profile: any): User => ({
  id: profile.id,
  email: profile.email,
  displayName: profile.display_name || profile.full_name || "User",
  username: profile.username || undefined,
  phoneNumber: profile.phone_number || undefined,
  teamNumber: profile.team_number ?? null,
  schoolName: profile.school_name || "",
  city: profile.city || "",
  country: profile.country || "",
  isVerified: profile.is_verified || false,
  avatarUrl: profile.avatar_url || undefined,
  createdAt: new Date(profile.created_at),
  tradesCompleted: profile.trades_completed || 0,
  rating: profile.rating || 0,
  reviewCount: profile.review_count || 0,
  responseRate: profile.response_rate || 0,
  avgResponseTime: profile.avg_response_time || "0 min",
  blockedUsers: profile.blocked_users || [],
});


