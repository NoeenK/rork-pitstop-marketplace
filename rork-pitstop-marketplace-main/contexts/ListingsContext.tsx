import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Listing, ListingFilters, RoboticsCategory } from "@/types";
import { supabaseClient } from "@/lib/supabase";
import { useAuth } from "./AuthContext";
import { mapProfileToUser } from "@/lib/profile";

const mapListingFromDb = (listing: any, seller?: any): Listing => ({
  id: listing.id,
  sellerId: listing.seller_id,
  seller: seller ? mapProfileToUser(seller) : undefined,
  title: listing.title,
  description: listing.description || "",
  category: listing.category as any,
  condition: listing.condition as any,
  priceCents: listing.price_cents,
  isSwapOnly: listing.is_swap_only || false,
  city: listing.city,
  country: listing.country,
  images: listing.images || [],
  seasonTag: listing.season_tag || undefined,
  roboticsCategory: "FRC" as RoboticsCategory, // Default, can be added to schema later
  isActive: listing.is_active,
  createdAt: new Date(listing.created_at),
  viewCount: listing.view_count || 0,
  likeCount: listing.like_count || 0,
  shareCount: listing.share_count || 0,
  chatCount: listing.chat_count || 0,
  boostedAt: listing.boosted_at ? new Date(listing.boosted_at) : undefined,
  soldAt: listing.sold_at ? new Date(listing.sold_at) : undefined,
  isSold: listing.is_sold || false,
  priceHistory: [], // Can be fetched separately if needed
});

export const [ListingsProvider, useListings] = createContextHook(() => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filters, setFilters] = useState<ListingFilters>({});
  const [roboticsFilter, setRoboticsFilter] = useState<RoboticsCategory | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadListings = async () => {
      try {
        setIsLoading(true);
        console.log("[ListingsContext] Loading listings from Supabase");

        const { data, error } = await supabaseClient
          .from("listings")
          .select(`
            *,
            seller:profiles!seller_id(*)
          `)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[ListingsContext] Error loading listings:", error);
          setListings([]);
          return;
        }

        if (data && data.length > 0) {
          const formattedListings: Listing[] = data.map((item: any) =>
            mapListingFromDb(item, item.seller)
          );
          setListings(formattedListings);
          console.log("[ListingsContext] Loaded listings:", formattedListings.length);
        } else {
          setListings([]);
          console.log("[ListingsContext] No listings found");
        }
      } catch (error) {
        console.error("[ListingsContext] Unexpected error loading listings:", error);
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadListings();

    // Subscribe to real-time updates
    const channel = supabaseClient
      .channel("listings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "listings",
        },
        () => {
          console.log("[ListingsContext] Listings changed, reloading...");
          loadListings();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      if (!listing.isActive) return false;
      if (roboticsFilter && listing.roboticsCategory !== roboticsFilter) return false;
      if (filters.category && listing.category !== filters.category) return false;
      if (filters.condition && listing.condition !== filters.condition) return false;
      if (filters.swapOnly && !listing.isSwapOnly) return false;
      if (filters.maxPrice && listing.priceCents && listing.priceCents > filters.maxPrice) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          listing.title.toLowerCase().includes(searchLower) ||
          listing.description.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [listings, filters, roboticsFilter]);

  const getListingById = useCallback((id: string) => {
    return listings.find(listing => listing.id === id);
  }, [listings]);

  const createListing = useCallback(async (listing: Omit<Listing, "id" | "createdAt" | "viewCount" | "likeCount" | "shareCount" | "chatCount">) => {
    if (!user) {
      throw new Error("User must be logged in to create a listing");
    }

    try {
    setIsLoading(true);
      console.log("[ListingsContext] Creating listing:", listing.title);

      const { data, error } = await supabaseClient
        .from("listings")
        .insert({
          seller_id: user.id,
          title: listing.title,
          description: listing.description,
          category: listing.category,
          condition: listing.condition,
          price_cents: listing.priceCents,
          is_swap_only: listing.isSwapOnly,
          city: listing.city,
          country: listing.country,
          images: listing.images || [],
          season_tag: listing.seasonTag || null,
          is_active: true,
          is_sold: false,
          view_count: 0,
          like_count: 0,
          share_count: 0,
          chat_count: 0,
        })
        .select(`
          *,
          seller:profiles!seller_id(*)
        `)
        .single();

      if (error) {
        console.error("[ListingsContext] Error creating listing:", error);
        throw error;
      }

      const newListing = mapListingFromDb(data, data.seller);
    setListings(prev => [newListing, ...prev]);
      console.log("[ListingsContext] Listing created:", newListing.id);
      return newListing;
    } catch (error) {
      console.error("[ListingsContext] Failed to create listing:", error);
      throw error;
    } finally {
    setIsLoading(false);
    }
  }, [user]);

  const updateListing = useCallback(async (id: string, updates: Partial<Listing>) => {
    if (!user) {
      throw new Error("User must be logged in to update a listing");
    }

    try {
    setIsLoading(true);
      console.log("[ListingsContext] Updating listing:", id);

      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.condition !== undefined) dbUpdates.condition = updates.condition;
      if (updates.priceCents !== undefined) dbUpdates.price_cents = updates.priceCents;
      if (updates.isSwapOnly !== undefined) dbUpdates.is_swap_only = updates.isSwapOnly;
      if (updates.city !== undefined) dbUpdates.city = updates.city;
      if (updates.country !== undefined) dbUpdates.country = updates.country;
      if (updates.images !== undefined) dbUpdates.images = updates.images;
      if (updates.seasonTag !== undefined) dbUpdates.season_tag = updates.seasonTag;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.isSold !== undefined) dbUpdates.is_sold = updates.isSold;

      const { data, error } = await supabaseClient
        .from("listings")
        .update(dbUpdates)
        .eq("id", id)
        .eq("seller_id", user.id)
        .select(`
          *,
          seller:profiles!seller_id(*)
        `)
        .single();

      if (error) {
        console.error("[ListingsContext] Error updating listing:", error);
        throw error;
      }

      const updatedListing = mapListingFromDb(data, data.seller);
    setListings(prev => 
      prev.map(listing => 
          listing.id === id ? updatedListing : listing
      )
    );
      console.log("[ListingsContext] Listing updated:", id);
    } catch (error) {
      console.error("[ListingsContext] Failed to update listing:", error);
      throw error;
    } finally {
    setIsLoading(false);
    }
  }, [user]);

  const deleteListing = useCallback(async (id: string) => {
    if (!user) {
      throw new Error("User must be logged in to delete a listing");
    }

    try {
    setIsLoading(true);
      console.log("[ListingsContext] Deleting listing:", id);

      const { error } = await supabaseClient
        .from("listings")
        .delete()
        .eq("id", id)
        .eq("seller_id", user.id);

      if (error) {
        console.error("[ListingsContext] Error deleting listing:", error);
        throw error;
      }
    
    setListings(prev => prev.filter(listing => listing.id !== id));
      console.log("[ListingsContext] Listing deleted:", id);
    } catch (error) {
      console.error("[ListingsContext] Failed to delete listing:", error);
      throw error;
    } finally {
    setIsLoading(false);
    }
  }, [user]);

  const incrementViewCount = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabaseClient.rpc("increment_listing_views", {
        listing_id: id,
      });

      if (error) {
        // If RPC doesn't exist, use direct update
        const listing = listings.find(l => l.id === id);
        if (listing) {
          await supabaseClient
            .from("listings")
            .update({ view_count: listing.viewCount + 1 })
            .eq("id", id);
        }
      }

      setListings(prev =>
        prev.map(listing =>
          listing.id === id ? { ...listing, viewCount: listing.viewCount + 1 } : listing
        )
      );
    } catch (error) {
      console.error("[ListingsContext] Failed to increment view count:", error);
      // Still update locally for better UX
    setListings(prev => 
      prev.map(listing => 
        listing.id === id ? { ...listing, viewCount: listing.viewCount + 1 } : listing
      )
    );
    }
  }, [listings]);

  return useMemo(() => ({
    listings: filteredListings,
    allListings: listings,
    filters,
    setFilters,
    roboticsFilter,
    setRoboticsFilter,
    isLoading,
    getListingById,
    createListing,
    updateListing,
    deleteListing,
    incrementViewCount,
  }), [filteredListings, listings, filters, setFilters, roboticsFilter, setRoboticsFilter, isLoading, getListingById, createListing, updateListing, deleteListing, incrementViewCount]);
});
