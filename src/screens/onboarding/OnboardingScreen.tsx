import { useRef, useState } from "react";
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
    image: require("../../../assets/onboarding/onbaording1.jpg"),
    badge: "SMART SCANNING",
    title: "Point. Snap.\nSort smarter.",
    description:
      "Take a photo of everyday items and get clear, practical guidance in seconds.",
  },
  {
    id: "2",
    image: require("../../../assets/onboarding/onbaording2-2.jpg"),
    badge: "SIMPLE GUIDANCE",
    title: "Know where\neverything goes.",
    description:
      "Discover whether an item can be recycled, reused, donated, sold, or safely discarded.",
  },
  {
    id: "3",
    image: require("../../../assets/onboarding/onbaording3.jpg"),
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

  const isLandscape = width > height;
  const isTabletLayout = width >= 700 || isLandscape;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isCompleting, setIsCompleting] =
    useState(false);

  const completeOnboarding = useOnboardingStore(
    (state) => state.completeOnboarding
  );

  const activeSlide = slides[activeIndex];
  const isLastSlide =
    activeIndex === slides.length - 1;

  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / width);

    setActiveIndex(
      Math.max(
        0,
        Math.min(slides.length - 1, nextIndex)
      )
    );
  };

  const goToSlide = (index: number) => {
    if (
      index < 0 ||
      index >= slides.length ||
      isCompleting
    ) {
      return;
    }

    listRef.current?.scrollToIndex({
      index,
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
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        bounces={false}
        scrollEventThrottle={16}
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
                isTabletLayout
                  ? [
                      "rgba(5,24,13,0.34)",
                      "rgba(5,24,13,0.03)",
                      "rgba(5,24,13,0.72)",
                    ]
                  : [
                      "rgba(5,24,13,0.22)",
                      "rgba(5,24,13,0.02)",
                      "rgba(5,24,13,0.68)",
                    ]
              }
              locations={[0, 0.48, 1]}
              style={styles.imageOverlay}
            />

            <View
              style={[
                styles.brandMark,
                {
                  top: Math.max(insets.top + 14, 28),
                  left: isTabletLayout ? 38 : 22,
                },
              ]}
            >
              <View style={styles.brandIcon}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={16}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.brandText}>
                SnapSort AI
              </Text>
            </View>

            <View
              style={[
                styles.counterPill,
                {
                  top: Math.max(insets.top + 16, 30),
                  right: isTabletLayout ? 38 : 22,
                },
              ]}
            >
              <Text style={styles.counterText}>
                {activeIndex + 1}/{slides.length}
              </Text>
            </View>

            <View
              style={[
                styles.imageContent,
                isTabletLayout
                  ? styles.imageContentLandscape
                  : styles.imageContentPortrait,
              ]}
            >
              <View style={styles.badgePill}>
                <View style={styles.badgeDot} />

                <Text style={styles.badgeText}>
                  {item.badge}
                </Text>
              </View>

              <Text
                style={[
                  styles.imageTitle,
                  isTabletLayout &&
                    styles.imageTitleLandscape,
                ]}
              >
                {item.title}
              </Text>

              <Text
                style={[
                  styles.imageDescription,
                  isTabletLayout &&
                    styles.imageDescriptionLandscape,
                ]}
              >
                {item.description}
              </Text>
            </View>
          </View>
        )}
      />

      <View
        style={[
          styles.bottomPanel,
          isTabletLayout &&
            styles.bottomPanelLandscape,
          {
            paddingBottom: Math.max(
              insets.bottom + 14,
              22
            ),
          },
        ]}
      >
        <View style={styles.panelHeader}>
          <Text style={styles.panelHint}>
            {isLastSlide
              ? "Ready to make a difference?"
              : "Your greener journey starts here"}
          </Text>

          <View style={styles.progressDots}>
            {slides.map((slide, index) => (
              <Pressable
                key={slide.id}
                onPress={() => goToSlide(index)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Go to slide ${index + 1}`}
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
        </View>

        <View
          style={[
            styles.panelContent,
            isTabletLayout &&
              styles.panelContentLandscape,
          ]}
        >
          <View style={styles.panelCopy}>
            <Text style={styles.panelBadge}>
              {activeSlide.badge}
            </Text>

            <Text style={styles.panelTitle}>
              {activeSlide.title}
            </Text>

            <Text style={styles.panelDescription}>
              {activeSlide.description}
            </Text>
          </View>

          <View style={styles.actions}>
            {activeIndex > 0 ? (
              <Pressable
                style={styles.backButton}
                onPress={() =>
                  goToSlide(activeIndex - 1)
                }
                accessibilityRole="button"
                accessibilityLabel="Previous slide"
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={18}
                  color={colors.primary}
                />

                <Text style={styles.backText}>
                  Back
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              style={[
                styles.continueButton,
                activeIndex > 0 &&
                  styles.continueButtonWithBack,
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
                  size={19}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    position: "relative",
    backgroundColor: "#DDEFE1",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  brandMark: {
    position: "absolute",
    zIndex: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "transparent",
  },
  brandIcon: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  brandText: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 15,
    letterSpacing: -0.2,
    textShadowColor: "rgba(0,0,0,0.32)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 3,
  },
  counterPill: {
    position: "absolute",
    zIndex: 3,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.86)",
  },
  counterText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 10,
  },
  imageContent: {
    position: "absolute",
    zIndex: 2,
  },
  imageContentPortrait: {
    left: 23,
    right: 23,
    bottom: 216,
  },
  imageContentLandscape: {
    left: 42,
    width: "52%",
    bottom: 74,
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
    marginBottom: 13,
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
    textShadowColor: "rgba(0,0,0,0.34)",
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 5,
  },
  imageTitleLandscape: {
    fontSize: 37,
    lineHeight: 44,
  },
  imageDescription: {
    maxWidth: 330,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.94)",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 4,
  },
  imageDescriptionLandscape: {
    maxWidth: 440,
    fontSize: 14,
    lineHeight: 22,
  },
  bottomPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 23,
    paddingTop: 17,
    borderTopLeftRadius: 29,
    borderTopRightRadius: 29,
    backgroundColor: "rgba(255,255,255,0.98)",
    shadowColor: "#173B25",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: -6,
    },
    elevation: 15,
  },
  bottomPanelLandscape: {
    paddingHorizontal: 38,
    paddingTop: 14,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  panelHint: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 11,
  },
  progressDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D7E4DA",
  },
  activeDot: {
    width: 28,
    backgroundColor: colors.primary,
  },
  panelContent: {
    marginTop: 10,
  },
  panelContentLandscape: {
    flexDirection: "row",
    alignItems: "center",
    gap: 26,
  },
  panelCopy: {
    flex: 1,
    minWidth: 0,
  },
  panelBadge: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 9,
    letterSpacing: 1,
  },
  panelTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 25,
    lineHeight: 32,
    marginTop: 5,
  },
  panelDescription: {
    maxWidth: 450,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 15,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    width: 94,
    height: 51,
    borderRadius: 26,
    backgroundColor: "#F0F7F1",
    borderWidth: 1,
    borderColor: "#DCE9DF",
  },
  backText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 11,
  },
  continueButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minWidth: 145,
    height: 51,
    borderRadius: 26,
    backgroundColor: colors.primary,
  },
  continueButtonWithBack: {
    flex: 1,
  },
  continueText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 12,
  },
  skipButton: {
    minWidth: 52,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
    borderRadius: 23,
  },
  skipText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 10,
  },
  disabledButton: {
    opacity: 0.55,
  },
});