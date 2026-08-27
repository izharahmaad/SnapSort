import { useState } from "react";
import {
  Image,
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
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isCompleting, setIsCompleting] =
    useState(false);

  const completeOnboarding = useOnboardingStore(
    (state) => state.completeOnboarding
  );

  const activeSlide = slides[activeIndex];
  const isLastSlide =
    activeIndex === slides.length - 1;

  const isLandscape = width > height;
  const isTablet = width >= 700;
  const isTabletLandscape = isTablet && isLandscape;

  const horizontalPadding = isTabletLandscape
    ? Math.min(48, width * 0.06)
    : isTablet
      ? 38
      : 20;

  const textWidth = isTabletLandscape
    ? Math.min(525, width * 0.48)
    : width - horizontalPadding * 2;

  const controlWidth = isTabletLandscape
    ? Math.min(335, width * 0.42)
    : Math.min(335, width - horizontalPadding * 2);

  const goToSlide = (index: number) => {
    if (
      index < 0 ||
      index >= slides.length ||
      isCompleting
    ) {
      return;
    }

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

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left") {
      if (!isLastSlide) {
        goToSlide(activeIndex + 1);
      }
      return;
    }

    if (activeIndex > 0) {
      goToSlide(activeIndex - 1);
    }
  };

  return (
    <View style={styles.screen}>
      <Pressable
        style={styles.fullScreenTouch}
        onPressOut={(event) => {
          const { locationX } = event.nativeEvent;

          if (locationX < width * 0.28) {
            handleSwipe("right");
          } else if (locationX > width * 0.72) {
            handleSwipe("left");
          }
        }}
      >
        <Image
          source={activeSlide.image}
          resizeMode="cover"
          style={styles.backgroundImage}
        />

        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(8,34,19,0.06)",
            "rgba(8,34,19,0.05)",
            "rgba(8,34,19,0.72)",
          ]}
          locations={[0, 0.42, 1]}
          style={styles.imageShade}
        />

        <View
          style={[
            styles.brand,
            {
              top: Math.max(insets.top + 14, 26),
              left: horizontalPadding,
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
            styles.counter,
            {
              top: Math.max(insets.top + 16, 28),
              right: horizontalPadding,
            },
          ]}
        >
          <Text style={styles.counterText}>
            {activeIndex + 1} / {slides.length}
          </Text>
        </View>

        <View
          pointerEvents="none"
          style={[
            styles.textArea,
            {
              left: horizontalPadding,
              width: textWidth,
              bottom: isTabletLandscape
                ? Math.max(insets.bottom + 108, 124)
                : Math.max(insets.bottom + 116, 132),
            },
          ]}
        >
          <View style={styles.badge}>
            <View style={styles.badgeDot} />

            <Text style={styles.badgeText}>
              {activeSlide.badge}
            </Text>
          </View>

          <Text
            style={[
              styles.title,
              isTabletLandscape &&
                styles.titleLandscape,
            ]}
          >
            {activeSlide.title}
          </Text>

          <Text
            style={[
              styles.description,
              isTabletLandscape &&
                styles.descriptionLandscape,
            ]}
          >
            {activeSlide.description}
          </Text>
        </View>

        <View
          pointerEvents="box-none"
          style={[
            styles.controls,
            {
              left: horizontalPadding,
              right: horizontalPadding,
              bottom: Math.max(
                insets.bottom + 16,
                23
              ),
            },
          ]}
        >
          <View
            style={[
              styles.controlsInner,
              {
                width: controlWidth,
              },
            ]}
          >
            <View style={styles.dots}>
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
                      activeIndex === index &&
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
                    size={16}
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
                  <View style={styles.continueIcon}>
                    <MaterialCommunityIcons
                      name={
                        isLastSlide
                          ? "check"
                          : "arrow-right"
                      }
                      size={15}
                      color={colors.primary}
                    />
                  </View>
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
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#173B25",
  },
  fullScreenTouch: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  imageShade: {
    ...StyleSheet.absoluteFillObject,
  },
  brand: {
    position: "absolute",
    zIndex: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 4,
  },
  brandText: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 15,
    letterSpacing: -0.2,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 4,
  },
  counter: {
    position: "absolute",
    zIndex: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(15,78,41,0.46)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  counterText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 10,
  },
  textArea: {
    position: "absolute",
    zIndex: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    marginBottom: 12,
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
  title: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 39,
    letterSpacing: -0.5,
  },
  titleLandscape: {
    fontSize: 36,
    lineHeight: 43,
  },
  description: {
    maxWidth: 350,
    fontFamily: "Poppins_400Regular",
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 9,
  },
  descriptionLandscape: {
    maxWidth: 480,
    fontSize: 14,
    lineHeight: 21,
  },
  controls: {
    position: "absolute",
    zIndex: 10,
    alignItems: "center",
  },
  controlsInner: {
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.62)",
  },
  activeDot: {
    width: 24,
    backgroundColor: "#FFFFFF",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    width: 74,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(18,103,53,0.84)",
    shadowColor: "#06351B",
    shadowOpacity: 0.4,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },
  backText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 10,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    minWidth: 134,
    height: 41,
    paddingHorizontal: 13,
    borderRadius: 21,
    backgroundColor: "rgba(18,112,57,0.94)",
    shadowColor: "#06351B",
    shadowOpacity: 0.45,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 7,
  },
  continueText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 11,
  },
  continueIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  skipButton: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 10,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.55,
  },
});