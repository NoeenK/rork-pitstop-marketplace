import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useMemo, useEffect } from "react";
import { SavedListing } from "@/types";
import { useAuth } from "./AuthContext";
import { supabaseClient } from "@/lib/supabase";

export const [SavedListingsProvider, useSavedListings] = createContextHook(() => {
  const { user } = useAuth();
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSavedListings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabaseClient
          .from("saved_listings")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          console.error("[SavedListings] Failed to load:", error);
        } else if (data) {
          const mappedData: SavedListing[] = data.map(item => ({
            userId: item.user_id,
            listingId: item.listing_id,
            savedAt: new Date(item.saved_at),
          }));
          setSavedListings(mappedData);
        }
      } catch (error) {
        console.error("[SavedListings] Failed to load saved listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedListings();
  }, [user]);

  const saveListing = useCallback(async (listingId: string) => {
    if (!user) return;

    console.log("[SavedListings] Saving listing:", listingId);

    const newSaved: SavedListing = {
      userId: user.id,
      listingId,
      savedAt: new Date(),
    };

    const updated = [...savedListings, newSaved];
    setSavedListings(updated);
    
    try {
      const { error } = await supabaseClient
        .from("saved_listings")
        .insert({
          user_id: user.id,
          listing_id: listingId,
        });

      if (error) {
        console.error("[SavedListings] Failed to save listing:", error.message || error);
        setSavedListings(savedListings);
      } else {
        console.log("[SavedListings] Successfully saved listing:", listingId);
      }
    } catch (error) {
      console.error("[SavedListings] Failed to save listing:", error instanceof Error ? error.message : String(error));
      setSavedListings(savedListings);
    }
  }, [savedListings, user]);

  const unsaveListing = useCallback(async (listingId: string) => {
    if (!user) return;

    console.log("[SavedListings] Unsaving listing:", listingId);

    const updated = savedListings.filter(
      (saved) => !(saved.listingId === listingId && saved.userId === user.id)
    );
    setSavedListings(updated);
    
    try {
      const { error } = await supabaseClient
        .from("saved_listings")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);

      if (error) {
        console.error("[SavedListings] Failed to unsave listing:", error.message || error);
        setSavedListings(savedListings);
      } else {
        console.log("[SavedListings] Successfully unsaved listing:", listingId);
      }
    } catch (error) {
      console.error("[SavedListings] Failed to unsave listing:", error instanceof Error ? error.message : String(error));
      setSavedListings(savedListings);
    }
  }, [savedListings, user]);

  const toggleSaved = useCallback((listingId: string) => {
    if (!user) {
      console.log("[SavedListings] Cannot toggle - no user logged in");
      return;
    }
    
    const isSaved = savedListings.some(
      (saved) => saved.listingId === listingId && saved.userId === user.id
    );

    console.log("[SavedListings] Toggling listing:", listingId, "isSaved:", isSaved, "userId:", user.id);

    if (isSaved) {
      unsaveListing(listingId);
    } else {
      saveListing(listingId);
    }
  }, [savedListings, user, saveListing, unsaveListing]);

  const isSaved = useCallback((listingId: string): boolean => {
    if (!user) return false;
    return savedListings.some(
      (saved) => saved.listingId === listingId && saved.userId === user.id
    );
  }, [savedListings, user]);

  const getUserSavedListingIds = useCallback((): string[] => {
    if (!user) return [];
    return savedListings
      .filter((saved) => saved.userId === user.id)
      .map((saved) => saved.listingId);
  }, [savedListings, user]);

  return useMemo(() => ({
    savedListings,
    isLoading,
    saveListing,
    unsaveListing,
    toggleSaved,
    isSaved,
    getUserSavedListingIds,
  }), [savedListings, isLoading, saveListing, unsaveListing, toggleSaved, isSaved, getUserSavedListingIds]);
});
