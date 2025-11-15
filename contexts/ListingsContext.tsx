import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useMemo } from "react";
import { Listing, ListingFilters, RoboticsCategory } from "@/types";
import { mockListings } from "@/mocks/listings";

export const [ListingsProvider, useListings] = createContextHook(() => {
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [filters, setFilters] = useState<ListingFilters>({});
  const [roboticsFilter, setRoboticsFilter] = useState<RoboticsCategory | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const createListing = useCallback(async (listing: Omit<Listing, "id" | "createdAt" | "viewCount">) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newListing: Listing = {
      ...listing,
      id: `listing-${Date.now()}`,
      createdAt: new Date(),
      viewCount: 0,
    };
    
    setListings(prev => [newListing, ...prev]);
    setIsLoading(false);
    return newListing;
  }, []);

  const updateListing = useCallback(async (id: string, updates: Partial<Listing>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setListings(prev => 
      prev.map(listing => 
        listing.id === id ? { ...listing, ...updates } : listing
      )
    );
    setIsLoading(false);
  }, []);

  const deleteListing = useCallback(async (id: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setListings(prev => prev.filter(listing => listing.id !== id));
    setIsLoading(false);
  }, []);

  const incrementViewCount = useCallback((id: string) => {
    setListings(prev => 
      prev.map(listing => 
        listing.id === id ? { ...listing, viewCount: listing.viewCount + 1 } : listing
      )
    );
  }, []);

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
