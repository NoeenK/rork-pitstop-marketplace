import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Text, Animated, Platform, Image, Dimensions, Modal } from "react-native";
import { Stack, useRouter } from "expo-router";
import { MapPin, SlidersHorizontal, X } from "lucide-react-native";
import { useState, useRef, useMemo, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListings } from "@/contexts/ListingsContext";
import { Category } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import SearchBar from "@/components/SearchBar";
import HorizontalListingCard from "@/components/HorizontalListingCard";
import SectionHeader from "@/components/SectionHeader";
import GoogleMapView from "@/components/GoogleMapView";

import ScreenWrapper from "@/components/ScreenWrapper";

const { width: SCREEN_WIDTH } = Dimensions.get('window');



export default function HomeScreen() {
  const { listings } = useListings();

  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("FRC");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showMapInModal, setShowMapInModal] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const { city, latitude, longitude } = useLocation();

  const CATEGORIES = ["FRC", "FTC", "FLL"];
  const CATEGORY_WIDTH = SCREEN_WIDTH / 3;

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleCategoryChange = useCallback((category: string, index: number) => {
    setSelectedCategory(category);
    Animated.spring(indicatorPosition, {
      toValue: index * CATEGORY_WIDTH,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [indicatorPosition, CATEGORY_WIDTH]);

  const recommendedListings = useMemo(() => listings.filter(l => l.likeCount >= 10).slice(0, 6), [listings]);
  const popularNearbyListings = useMemo(() => listings.filter(l => l.viewCount >= 40).slice(0, 6), [listings]);
  const swapOnlyListings = useMemo(() => listings.filter(l => l.isSwapOnly).slice(0, 6), [listings]);
  const drivetrainListings = useMemo(() => listings.filter(l => l.category === "Drivetrain").slice(0, 6), [listings]);
  const electronicsListings = useMemo(() => listings.filter(l => l.category === "Electronics").slice(0, 6), [listings]);
  const pneumaticsListings = useMemo(() => listings.filter(l => l.category === "Pneumatics").slice(0, 6), [listings]);
  const structureListings = useMemo(() => listings.filter(l => l.category === "Structure").slice(0, 6), [listings]);
  const toolsListings = useMemo(() => listings.filter(l => l.category === "Tools").slice(0, 6), [listings]);
  const merchandiseListings = useMemo(() => listings.filter(l => l.category === ("Team Merchandise" as Category)).slice(0, 6), [listings]);

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
        <View 
          style={[
            styles.headerWrapper,
            { paddingTop: insets.top }
          ]}
        >
          <View style={styles.userHeader}>
            <TouchableOpacity 
              style={styles.userInfo}
              onPress={() => router.push("/profile/settings")}
            >
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 22, fontWeight: '700' as const, color: '#FFFFFF' }}>
                    {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.welcomeText}>Welcome back !</Text>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {user?.displayName?.split(' ')[0] || user?.username || "User"}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.bellButton}
              onPress={() => setShowLocationModal(true)}
            >
              <MapPin size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.ScrollView
          style={styles.scrollableContent}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: Platform.OS !== 'web' }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.searchSection}>
            <View style={styles.searchBarContainer}>
              <SearchBar
                value={searchText}
                onChangeText={handleSearchChange}
                placeholder="Search"
                style={styles.searchBar}
              />
              <TouchableOpacity
                style={[styles.filterButton, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}
                onPress={() => router.push("/filters")}
              >
                <SlidersHorizontal size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.categoriesSection, { backgroundColor: colors.background }]}>
            <View style={styles.categoriesContainer}>
              {CATEGORIES.map((category, index) => {
                const isSelected = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={styles.categoryButton}
                    onPress={() => handleCategoryChange(category, index)}
                  >
                    {category === "FRC" ? (
                      <Image
                        source={{ uri: "https://r2-pub.rork.com/generated-images/3970555e-236f-43f3-ba73-6e8a4edcdb93.png" }}
                        style={[
                          styles.categoryIcon,
                          {
                            opacity: isSelected ? 1 : 0.5,
                          }
                        ]}
                        resizeMode="contain"
                      />
                    ) : category === "FTC" ? (
                      <Image
                        source={{ uri: "https://r2-pub.rork.com/generated-images/bbfc95e3-f341-461d-8214-2317a627b662.png" }}
                        style={[
                          styles.categoryIcon,
                          {
                            opacity: isSelected ? 1 : 0.5,
                          }
                        ]}
                        resizeMode="contain"
                      />
                    ) : category === "FLL" ? (
                      <Image
                        source={{ uri: "https://r2-pub.rork.com/generated-images/5fe21bb8-b729-4758-9e3b-da4b0bb2d562.png" }}
                        style={[
                          styles.categoryIcon,
                          {
                            opacity: isSelected ? 1 : 0.5,
                          }
                        ]}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text
                        style={[
                          styles.categoryLabel,
                          {
                            color: isSelected ? colors.text : colors.textSecondary,
                            fontWeight: isSelected ? "600" : "500",
                          }
                        ]}
                      >
                        {category}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={[styles.indicatorTrack, { backgroundColor: colors.border }]}>
              <Animated.View
                style={[
                  styles.indicatorBar,
                  {
                    backgroundColor: colors.text,
                    width: CATEGORY_WIDTH,
                    transform: [{ translateX: indicatorPosition }]
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Recommended for You"
              onSeeAll={() => router.push({ pathname: "/category/recommended", params: { title: "Recommended for You" } })}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {recommendedListings.map((listing) => (
                <HorizontalListingCard key={listing.id} listing={listing} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Popular Nearby"
              onSeeAll={() => router.push({ pathname: "/category/popular-nearby", params: { title: "Popular Nearby" } })}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {popularNearbyListings.map((listing) => (
                <HorizontalListingCard key={listing.id} listing={listing} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Swap Only"
              onSeeAll={() => router.push({ pathname: "/category/swap-only", params: { title: "Swap Only" } })}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {swapOnlyListings.length > 0 ? (
                swapOnlyListings.map((listing) => (
                  <HorizontalListingCard key={listing.id} listing={listing} />
                ))
              ) : (
                <View style={styles.emptySection}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No swap-only listings available</Text>
                </View>
              )}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Drivetrain"
              onSeeAll={() => router.push({ pathname: "/category/drivetrain", params: { title: "Drivetrain" } })}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {drivetrainListings.map((listing) => (
                <HorizontalListingCard key={listing.id} listing={listing} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Electronics"
              onSeeAll={() => router.push({ pathname: "/category/electronics", params: { title: "Electronics" } })}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {electronicsListings.map((listing) => (
                <HorizontalListingCard key={listing.id} listing={listing} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Pneumatics"
              onSeeAll={() => router.push({ pathname: "/category/pneumatics", params: { title: "Pneumatics" } })}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {pneumaticsListings.map((listing) => (
                <HorizontalListingCard key={listing.id} listing={listing} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Structure"
              onSeeAll={() => router.push({ pathname: "/category/structure", params: { title: "Structure" } })}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {structureListings.map((listing) => (
                <HorizontalListingCard key={listing.id} listing={listing} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Tools"
              onSeeAll={() => router.push({ pathname: "/category/tools", params: { title: "Tools" } })}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {toolsListings.length > 0 ? (
                toolsListings.map((listing) => (
                  <HorizontalListingCard key={listing.id} listing={listing} />
                ))
              ) : (
                <View style={styles.emptySection}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tools listings available</Text>
                </View>
              )}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Team Merchandise"
              onSeeAll={() => router.push({ pathname: "/category/team-merchandise", params: { title: "Team Merchandise" } })}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {merchandiseListings.length > 0 ? (
                merchandiseListings.map((listing) => (
                  <HorizontalListingCard key={listing.id} listing={listing} />
                ))
              ) : (
                <View style={styles.emptySection}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No merchandise listings available</Text>
                </View>
              )}
            </ScrollView>
          </View>

          <View style={{ height: 60 }} />
        </Animated.ScrollView>

        <Modal
          visible={showLocationModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setShowLocationModal(false);
            setShowMapInModal(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <MapPin size={24} color={colors.primary} />
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Your Location</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowLocationModal(false);
                    setShowMapInModal(false);
                  }}
                  style={styles.closeButton}
                >
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                {city}
              </Text>

              {showMapInModal ? (
                <>
                  {latitude && longitude ? (
                    <View style={styles.mapWrapper}>
                      <GoogleMapView
                        latitude={latitude}
                        longitude={longitude}
                        showUserLocation={true}
                        style={styles.modalMap}
                      />
                    </View>
                  ) : (
                    <View style={styles.noLocationContainer}>
                      <Text style={[styles.noLocationText, { color: colors.textSecondary }]}>
                        Location not available
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.manageButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setShowLocationModal(false);
                      setShowMapInModal(false);
                    }}
                  >
                    <Text style={styles.manageButtonText}>Confirm Location</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {latitude && longitude ? (
                    <View style={styles.mapWrapper}>
                      <GoogleMapView
                        latitude={latitude}
                        longitude={longitude}
                        showUserLocation={true}
                        style={styles.modalMap}
                      />
                    </View>
                  ) : (
                    <View style={styles.noLocationContainer}>
                      <Text style={[styles.noLocationText, { color: colors.textSecondary }]}>
                        Location not available
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.manageButton, { backgroundColor: colors.primary }]}
                    onPress={() => setShowMapInModal(true)}
                  >
                    <Text style={styles.manageButtonText}>Use my current location</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  headerWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 0,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E5E5E5",
  },
  welcomeText: {
    fontSize: 13,
    color: "#888888",
    fontWeight: "400" as const,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700" as const,
  },
  bellButton: {
    padding: 8,
  },
  scrollableContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchBarContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  searchBar: {
    flex: 1,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  categoriesSection: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  categoriesContainer: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
  },
  categoryButton: {
    flex: 1,
    alignItems: "center" as const,
    paddingVertical: 12,
  },
  categoryLabel: {
    fontSize: 15,
    textAlign: "center" as const,
  },
  categoryIcon: {
    width: 80,
    height: 30,
  },
  indicatorTrack: {
    height: 3,
    width: "100%" as const,
    marginTop: 4,
  },
  indicatorBar: {
    height: 3,
    position: "absolute" as const,
    top: 0,
    left: 0,
  },
  section: {
    marginTop: 20,
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  gridSection: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    marginBottom: 12,
  },
  emptySection: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 20,
  },
  modalContent: {
    width: "100%" as const,
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  modalTitleContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  closeButton: {
    padding: 4,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 16,
  },
  mapWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  modalMap: {
    height: 250,
    width: "100%" as const,
  },
  noLocationContainer: {
    height: 250,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderRadius: 12,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    marginBottom: 20,
  },
  noLocationText: {
    fontSize: 14,
  },
  manageButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center" as const,
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
