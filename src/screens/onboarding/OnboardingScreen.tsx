import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";
import { useOnboardingStore } from "../../stores/onboarding.store";

type Slide = {
  id: string;
  image: number;
  badge: string;
  title: string;
  description: string;
};

const slides: Slide[] = [
  {
    id: "1",
    image: require("../../../assets/onboarding/onboarding1.png"),
    badge: "SMART SCANNING",
    title: "Point. Snap.\nSort smarter.",
    description:
      "Take a photo of everyday items and get clear, practical guidance in seconds.",
  },
  {
    id: "2",
    image: require("../../../assets/onboarding/onboarding2.png"),
    badge: "SIMPLE GUIDANCE",
    title: "Know where\neverything goes.",
    description:
      "Discover whether an item can be recycled, reused, donated, sold, or safely discarded.",
  },
  {
    id: "3",
    image: require("../../../assets/onboarding/onboarding3.png"),
    badge: "BUILD BETTER HABITS",
    title: "Small choices.\nReal impact.",
    description:
      "Save your discoveries and make mindful disposal a daily habit.",
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isCompleting, setIsCompleting] =
    useState(false);

  const completeOnboarding = useOnboardingStore(
    (state) => state.completeOnboarding
  );

  const isLandscape = width > height;
  const isTablet = width >= 700;
  const isTabletLandscape = isTablet && isLandscape;

  const isLastSlide =
    activeIndex === slides.length - 1;

  const listKey = `onboarding-${Math.round(
    width
  )}-${Math.round(height)}`;

  useEffect(() => {
    const timer = setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: activeIndex * width,
        animated: false,
      });
    }, 60);

    return () => clearTimeout(timer);
  }, [width, height, activeIndex]);

  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / width);

    const safeIndex = Math.max(
      0,
      Math.min(slides.length - 1, nextIndex)
    );

    setActiveIndex(safeIndex);
  };

  const goToSlide = (index: number) => {
    if (
      index < 0 ||
      index >= slides.length ||
      isCompleting
    ) {
      return;
    }

    listRef.current?.scrollToOffset({
      offset: index * width,
      animated: true,
    });

    setActiveIndex(index);
  };

  const complete = async () => {
    if (isCompleting) {
      return;
    }

    try {
      setIsCompleting(true);
      await completeOnboarding();
    } finally {
      setIsCompleting(false);
    }
  };

  const handleContinue = async () => {
    if (isLastSlide) {
      await complete();
      return;
    }

    goToSlide(activeIndex + 1);
  };

  return (
    <View style={styles.screen}>
      <FlatList
        key={listKey}
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        renderItem={({ item }) => (
          <View
            style={[
              styles.slide,
              {
                width,
                height,
              },
            ]}
          >
            <Image
              source={item.image}
              resizeMode="cover"
              style={styles.heroImage}
            />

            <LinearGradient
              colors={
                isTabletLandscape
                  ? [
                      "rgba(5,24,13,0.40)",
                      "rgba(5,24,13,0.04)",
                      "rgba(5,24,13,0.28)",
                    ]
                  : [
                      "rgba(5,24,13,0.22)",
                      "rgba(5,24,13,0.02)",
                      "rgba(5,24,13,0.52)",
                    ]
              }
              locations={[0, 0.48, 1]}
              style={styles.pageOverlay}
            />

            <View
              style={[
                styles.brand,
                {
                  top: Math.max(insets.top + 14, 26),
                  left: isTablet ? 38 : 22,
                },
              ]}
            >
              <View style={styles.brandIcon}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={15}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.brandText}>
                SnapSort AI
              </Text>
            </View>

            <View
              style={[
                styles.slideCounter,
                {
                  top: Math.max(insets.top + 16, 28),
                  right: isTablet ? 38 : 22,
                },
              ]}
            >
              <Text style={styles.slideCounterText}>
                {activeIndex + 1} / {slides.length}
              </Text>
            </View>

            <View
              style={[
                styles.imageContent,
                isTabletLandscape
                  ? styles.imageContentLandscape
                  : styles.imageContentPortrait,
                {
                  bottom: isTabletLandscape ? 104 : 148,
                },
              ]}
            >
              <LinearGradient
                pointerEvents="none"
                colors={[
                  "rgba(0,0,0,0.70)",
                  "rgba(0,0,0,0.34)",
                  "rgba(0,0,0,0)",
                ]}
                locations={[0, 0.55, 1]}
                style={styles.textShadowGradient}
              />

              <View style={styles.textContent}>
                <View style={styles.badgePill}>
                  <View style={styles.badgeDot} />

                  <Text style={styles.badgeText}>
                    {item.badge}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.imageTitle,
                    isTabletLandscape &&
                      styles.imageTitleLandscape,
                  ]}
                >
                  {item.title}
                </Text>

                <Text
                  style={[
                    styles.imageDescription,
                    isTabletLandscape &&
                      styles.imageDescriptionLandscape,
                  ]}
                >
                  {item.description}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.actionBar,
                isTabletLandscape &&
                  styles.actionBarLandscape,
                {
                  paddingBottom: Math.max(
                    insets.bottom + 14,
                    22
                  ),
                },
              ]}
            >
              <View style={styles.progressDots}>
                {slides.map((slide, index) => (
                  <Pressable
                    key={slide.id}
                    onPress={() => goToSlide(index)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={`Go to slide ${
                      index + 1
                    }`}
                  >
                    <View
                      style={[
                        styles.dot,
                        index === activeIndex &&
                          styles.activeDot,
                      ]}
                    />
                  </Pressable>
                ))}
              </View>

              <View style={styles.actionRow}>
                {activeIndex > 0 ? (
                  <Pressable
                    style={styles.backButton}
                    onPress={() =>
                      goToSlide(activeIndex - 1)
                    }
                    disabled={isCompleting}
                    accessibilityRole="button"
                    accessibilityLabel="Previous slide"
                  >
                    <MaterialCommunityIcons
                      name="arrow-left"
                      size={18}
                      color="#FFFFFF"
                    />

                    <Text style={styles.backText}>
                      Back
                    </Text>
                  </Pressable>
                ) : null}

                <Pressable
                  style={[
                    styles.continueButton,
                    isCompleting &&
                      styles.disabledButton,
                  ]}
                  onPress={handleContinue}
                  disabled={isCompleting}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isLastSlide
                      ? "Start exploring SnapSort"
                      : "Continue onboarding"
                  }
                >
                  <Text style={styles.continueText}>
                    {isCompleting
                      ? "Opening..."
                      : isLastSlide
                        ? "Start exploring"
                        : "Continue"}
                  </Text>

                  {!isCompleting ? (
                    <MaterialCommunityIcons
                      name={
                        isLastSlide
                          ? "check"
                          : "arrow-right"
                      }
                      size={20}
                      color="#FFFFFF"
                    />
                  ) : null}
                </Pressable>

                {!isLastSlide ? (
                  <Pressable
                    style={styles.skipButton}
                    onPress={complete}
                    disabled={isCompleting}
                    accessibilityRole="button"
                    accessibilityLabel="Skip onboarding"
                  >
                    <Text style={styles.skipText}>
                      Skip
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#173B25",
  },
  slide: {
    position: "relative",
    backgroundColor: "#173B25",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  pageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  brand: {
    position: "absolute",
    zIndex: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandIcon: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    shadowColor: "#000000",
    shadowOpacity: 0.24,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },
  brandText: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 15,
    letterSpacing: -0.2,
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 4,
  },
  slideCounter: {
    position: "absolute",
    zIndex: 4,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.32)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  slideCounterText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 10,
  },
  imageContent: {
    position: "absolute",
    zIndex: 3,
    overflow: "visible",
  },
  imageContentPortrait: {
    left: 23,
    right: 23,
  },
  imageContentLandscape: {
    left: 42,
    width: "55%",
  },
  textShadowGradient: {
    position: "absolute",
    left: -24,
    right: -24,
    top: -44,
    bottom: -28,
    borderRadius: 38,
  },
  textContent: {
    position: "relative",
    zIndex: 2,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    marginBottom: 14,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 9,
    letterSpacing: 1,
  },
  imageTitle: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -0.6,
    textShadowColor: "rgba(0,0,0,0.82)",
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 6,
  },
  imageTitleLandscape: {
    fontSize: 38,
    lineHeight: 46,
  },
  imageDescription: {
    maxWidth: 345,
    fontFamily: "Poppins_400Regular",
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    textShadowColor: "rgba(0,0,0,0.86)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 5,
  },
  imageDescriptionLandscape: {
    maxWidth: 470,
    fontSize: 14,
    lineHeight: 22,
  },
  actionBar: {
    position: "absolute",
    zIndex: 5,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 23,
    paddingTop: 12,
    backgroundColor: "transparent",
  },
  actionBarLandscape: {
    paddingHorizontal: 38,
    paddingTop: 10,
  },
  progressDots: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 7,
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.43)",
  },
  activeDot: {
    width: 28,
    backgroundColor: "#FFFFFF",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    width: 92,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.38)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 6,
  },
  backText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 11,
  },
  continueButton: {
    flex: 1,
    minWidth: 145,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 27,
    backgroundColor: colors.primary,
    shadowColor: "#000000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 9,
  },
  continueText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 13,
  },
  skipButton: {
    width: 50,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.34)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  skipText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 10,
  },
  disabledButton: {
    opacity: 0.55,
  },
});