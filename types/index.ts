export type Condition = "New" | "Like New" | "Good" | "Used" | "For Parts";

export type Category = "Drivetrain" | "Electronics" | "Pneumatics" | "Structure" | "Tools" | "Misc" | "Team Merchandise";

export type RoboticsCategory = "FRC" | "FTC" | "FLL";

export interface User {
  id: string;
  email: string;
  displayName: string;
  username?: string;
  phoneNumber?: string;
  teamNumber: number | null;
  schoolName: string;
  city: string;
  country: string;
  isVerified: boolean;
  avatarUrl?: string;
  createdAt: Date;
  tradesCompleted: number;
  rating: number;
  reviewCount: number;
  responseRate: number;
  avgResponseTime: string;
  blockedUsers: string[];
}

export interface Listing {
  id: string;
  sellerId: string;
  seller?: User;
  title: string;
  description: string;
  category: Category;
  condition: Condition;
  priceCents: number | null;
  isSwapOnly: boolean;
  city: string;
  country: string;
  images: string[];
  seasonTag?: string;
  roboticsCategory: RoboticsCategory;
  isActive: boolean;
  createdAt: Date;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  chatCount: number;
  boostedAt?: Date;
  soldAt?: Date;
  isSold: boolean;
  priceHistory: PriceHistoryEntry[];
}

export interface ChatThread {
  id: string;
  listingId: string;
  listing?: Listing;
  buyerId: string;
  buyer?: User;
  sellerId: string;
  seller?: User;
  lastMessage?: Message;
  lastMessageAt: Date;
  unreadCount: number;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  sender?: User;
  text: string;
  offerId?: string;
  createdAt: Date;
  readAt?: Date;
}

export interface Offer {
  id: string;
  listingId: string;
  listing?: Listing;
  buyerId: string;
  buyer?: User;
  offeredPriceCents?: number;
  proposedSwapListingId?: string;
  proposedSwapListing?: Listing;
  note: string;
  status: "pending" | "accepted" | "declined" | "completed";
  createdAt: Date;
}

export interface Activity {
  id: string;
  userId: string;
  type: "offer_received" | "offer_accepted" | "offer_declined" | "listing_sold" | "message_received" | "team_verified";
  title: string;
  description: string;
  payload: any;
  read: boolean;
  createdAt: Date;
}

export interface ListingFilters {
  category?: Category;
  condition?: Condition;
  maxPrice?: number;
  swapOnly?: boolean;
  search?: string;
  location?: string;
}

export interface PriceHistoryEntry {
  priceCents: number;
  changedAt: Date;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewer?: User;
  revieweeId: string;
  listingId: string;
  listing?: Listing;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface SavedListing {
  userId: string;
  listingId: string;
  savedAt: Date;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  reportedListingId?: string;
  reason: string;
  description: string;
  status: "pending" | "reviewed" | "resolved";
  createdAt: Date;
}

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  country: string;
  radius: number;
  listingCount: number;
}
