import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Review } from "@/types";
import { supabaseClient } from "@/lib/supabase";
import { mapProfileToUser } from "@/lib/profile";

const mapReviewFromDb = (review: any, reviewer?: any): Review => ({
  id: review.id,
  reviewerId: review.reviewer_id,
  reviewer: reviewer ? mapProfileToUser(reviewer) : undefined,
  revieweeId: review.reviewee_id,
  listingId: review.listing_id,
  rating: review.rating,
  comment: review.comment || "",
  createdAt: new Date(review.created_at),
});

export const [ReviewsProvider, useReviews] = createContextHook(() => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoading(true);
        console.log("[ReviewsContext] Loading reviews from Supabase");

        if (!supabaseClient) {
          console.error("[ReviewsContext] Supabase client not initialized");
          setReviews([]);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabaseClient
          .from("reviews")
          .select(`
            *,
            reviewer:profiles!reviewer_id(*)
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[ReviewsContext] Supabase error:", error.message);
          console.error("[ReviewsContext] Error code:", error.code);
          console.error("[ReviewsContext] Error details:", error.details);
          console.error("[ReviewsContext] Error hint:", error.hint);
          setReviews([]);
          return;
        }

        if (data && data.length > 0) {
          const formattedReviews: Review[] = data.map((item: any) =>
            mapReviewFromDb(item, item.reviewer)
          );
          setReviews(formattedReviews);
          console.log("[ReviewsContext] Successfully loaded reviews:", formattedReviews.length);
        } else {
          setReviews([]);
          console.log("[ReviewsContext] No reviews found (database is empty)");
        }
      } catch (error: any) {
        console.error("[ReviewsContext] Error loading reviews:", {
          message: error?.message || 'Unknown error',
          details: error?.toString() || '',
          hint: error?.hint || '',
          code: error?.code || '',
        });
        console.error("[ReviewsContext] Error details:", error);
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();

    // Subscribe to real-time updates
    const channel = supabaseClient
      .channel("reviews_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reviews",
        },
        () => {
          console.log("[ReviewsContext] Reviews changed, reloading...");
          loadReviews();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const addReview = useCallback(async (review: Omit<Review, "id" | "createdAt">) => {
    try {
      setIsLoading(true);
      console.log("[ReviewsContext] Creating review for listing:", review.listingId);

      const { data, error } = await supabaseClient
        .from("reviews")
        .insert({
          reviewer_id: review.reviewerId,
          reviewee_id: review.revieweeId,
          listing_id: review.listingId,
          rating: review.rating,
          comment: review.comment,
        })
        .select(`
          *,
          reviewer:profiles!reviewer_id(*)
        `)
        .single();

      if (error) {
        console.error("[ReviewsContext] Error creating review:", error);
        throw error;
      }

      const newReview = mapReviewFromDb(data, data.reviewer);
      setReviews(prev => [newReview, ...prev]);
      console.log("[ReviewsContext] Review created:", newReview.id);
      return newReview;
    } catch (error) {
      console.error("[ReviewsContext] Failed to create review:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

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
