import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";
import { useOnboardingStore } from "../../stores/onboarding.store";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");

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
  const listRef = useRef<FlatList<Slide>>(null);

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
    const nextIndex = Math.round(
      offsetX / SCREEN_WIDTH
    );

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
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={item.image}
              resizeMode="cover"
              style={styles.heroImage}
            />

            <LinearGradient
              colors={[
                "rgba(5,24,13,0.20)",
                "rgba(5,24,13,0.02)",
                "rgba(5,24,13,0.64)",
              ]}
              locations={[0, 0.45, 1]}
              style={styles.imageOverlay}
            />

            <View
              style={[
                styles.topBar,
                {
                  top: Math.max(
                    insets.top + 14,
                    28
                  ),
                },
              ]}
            >
              <View style={styles.brandPill}>
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

              <View style={styles.counterPill}>
                <Text style={styles.counterText}>
                  {activeIndex + 1}/{slides.length}
                </Text>
              </View>
            </View>

            <View style={styles.imageMessage}>
              <View style={styles.messagePill}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={14}
                  color="#FFFFFF"
                />

                <Text style={styles.messageText}>
                  Make a greener choice
                </Text>
              </View>
            </View>
          </View>
        )}
      />

      <View
        style={[
          styles.bottomSheet,
          {
            paddingBottom: Math.max(
              insets.bottom + 15,
              24
            ),
          },
        ]}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.badge}>
            {activeSlide.badge}
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

        <Text style={styles.title}>
          {activeSlide.title}
        </Text>

        <Text style={styles.description}>
          {activeSlide.description}
        </Text>

        <View style={styles.actionRow}>
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
        </View>

        {!isLastSlide ? (
          <Pressable
            style={styles.skipButton}
            onPress={complete}
            disabled={isCompleting}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text style={styles.skipText}>
              Skip for now
            </Text>
          </Pressable>
        ) : null}
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
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#DDEFE1",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: "absolute",
    left: 22,
    right: 22,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 6,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.90)",
  },
  brandIcon: {
    width: 29,
    height: 29,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  brandText: {
    fontFamily: "Poppins_700Bold",
    color: colors.primary,
    fontSize: 13,
  },
  counterPill: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.90)",
  },
  counterText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 10,
  },
  imageMessage: {
    position: "absolute",
    left: 22,
    bottom: 214,
  },
  messagePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: "rgba(29,117,67,0.92)",
  },
  messageText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 10,
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 23,
    paddingTop: 21,
    borderTopLeftRadius: 31,
    borderTopRightRadius: 31,
    backgroundColor: "#FFFFFF",
    shadowColor: "#173B25",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: -6,
    },
    elevation: 15,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 9,
    letterSpacing: 1.1,
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
  title: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 28,
    lineHeight: 35,
    letterSpacing: -0.4,
    marginTop: 11,
  },
  description: {
    maxWidth: 330,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: 101,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F0F7F1",
    borderWidth: 1,
    borderColor: "#DCE9DF",
  },
  backText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 12,
  },
  continueButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
  },
  continueButtonWithBack: {
    flex: 1,
  },
  continueText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.55,
  },
  skipButton: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 3,
    borderRadius: 20,
  },
  skipText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 11,
  },
});