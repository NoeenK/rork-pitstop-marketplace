import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Review } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const REVIEWS_KEY = "reviews";

const mockReviews: Review[] = [
  {
    id: "rev1",
    reviewerId: "user2",
    revieweeId: "user1",
    listingId: "1",
    rating: 5,
    comment: "Great seller! Item exactly as described. Fast communication and smooth transaction.",
    createdAt: new Date("2024-10-25"),
  },
  {
    id: "rev2",
    reviewerId: "user3",
    revieweeId: "user1",
    listingId: "5",
    rating: 5,
    comment: "Excellent parts and very helpful with installation tips. Highly recommend!",
    createdAt: new Date("2024-10-20"),
  },
  {
    id: "rev3",
    reviewerId: "user1",
    revieweeId: "user2",
    listingId: "2",
    rating: 5,
    comment: "Perfect condition motors. Great communication throughout the process.",
    createdAt: new Date("2024-10-18"),
  },
  {
    id: "rev4",
    reviewerId: "user4",
    revieweeId: "user2",
    listingId: "6",
    rating: 4,
    comment: "Good seller, item as described. Shipping took a bit longer than expected but overall positive experience.",
    createdAt: new Date("2024-10-15"),
  },
];

export const [ReviewsProvider, useReviews] = createContextHook(() => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const stored = await AsyncStorage.getItem(REVIEWS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const reviewsWithDates = parsed.map((r: any) => ({
            ...r,
            createdAt: new Date(r.createdAt),
          }));
          setReviews(reviewsWithDates);
        } else {
          setReviews(mockReviews);
          await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(mockReviews));
        }
      } catch (error) {
        console.error("Failed to load reviews:", error);
        setReviews(mockReviews);
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();
  }, []);

  const addReview = useCallback(async (review: Omit<Review, "id" | "createdAt">) => {
    const newReview: Review = {
      ...review,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    
    try {
      await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save review:", error);
    }

    return newReview;
  }, [reviews]);

  const getReviewsForUser = useCallback((userId: string): Review[] => {
    return reviews.filter((review) => review.revieweeId === userId);
  }, [reviews]);

  const getReviewsByUser = useCallback((userId: string): Review[] => {
    return reviews.filter((review) => review.reviewerId === userId);
  }, [reviews]);

  const getAverageRating = useCallback((userId: string): number => {
    const userReviews = getReviewsForUser(userId);
    if (userReviews.length === 0) return 0;
    const sum = userReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / userReviews.length;
  }, [getReviewsForUser]);

  const hasReviewedListing = useCallback((reviewerId: string, listingId: string): boolean => {
    return reviews.some((review) => 
      review.reviewerId === reviewerId && review.listingId === listingId
    );
  }, [reviews]);

  return useMemo(() => ({
    reviews,
    isLoading,
    addReview,
    getReviewsForUser,
    getReviewsByUser,
    getAverageRating,
    hasReviewedListing,
  }), [reviews, isLoading, addReview, getReviewsForUser, getReviewsByUser, getAverageRating, hasReviewedListing]);
});
