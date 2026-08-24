import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Text } from "react-native-paper";

import { colors } from "../../constants/theme";
import { useOnboardingStore } from "../../stores/onboarding.store";

const { width } = Dimensions.get("window");

type IconName =
  | "camera-outline"
  | "recycle-variant"
  | "sprout-outline";

type Slide = {
  id: string;
  icon: IconName;
  iconBackground: string;
  iconColor: string;
  badge: string;
  title: string;
  description: string;
  gradient: readonly [string, string, ...string[]];
};

const slides: Slide[] = [
  {
    id: "1",
    icon: "camera-outline",
    iconBackground: "#DDF8E5",
    iconColor: "#1E7A46",
    badge: "SMART SCANNING",
    title: "Point. Snap.\nSort smarter.",
    description:
      "Take a photo of everyday items and get clear, practical guidance in seconds.",
    gradient: ["#F1FFF5", "#DFF8E7"],
  },
  {
    id: "2",
    icon: "recycle-variant",
    iconBackground: "#E8F0FF",
    iconColor: "#3563C9",
    badge: "SIMPLE GUIDANCE",
    title: "Know where\neverything goes.",
    description:
      "Discover whether an item can be recycled, reused, donated, sold, or safely discarded.",
    gradient: ["#F3F7FF", "#E2ECFF"],
  },
  {
    id: "3",
    icon: "sprout-outline",
    iconBackground: "#FFF0D7",
    iconColor: "#C87912",
    badge: "BUILD BETTER HABITS",
    title: "Small choices.\nReal impact.",
    description:
      "Save your discoveries, earn eco points, and make mindful disposal a daily habit.",
    gradient: ["#FFF9EF", "#FFF0D7"],
  },
];

export default function OnboardingScreen() {
  const listRef = useRef<FlatList<Slide>>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const completeOnboarding = useOnboardingStore(
    (state) => state.completeOnboarding
  );

  const isLastSlide =
    activeIndex === slides.length - 1;

  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / width
    );

    const safeIndex = Math.max(
      0,
      Math.min(slides.length - 1, nextIndex)
    );

    setActiveIndex(safeIndex);
  };

  const goToSlide = (index: number) => {
    if (index < 0 || index >= slides.length) {
      return;
    }

    listRef.current?.scrollToIndex({
      index,
      animated: true,
    });

    setActiveIndex(index);
  };

  const handleContinue = async () => {
    if (isLastSlide) {
      await completeOnboarding();
      return;
    }

    goToSlide(activeIndex + 1);
  };

  const handleBack = () => {
    if (activeIndex === 0) return;

    goToSlide(activeIndex - 1);
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  return (
    <View style={styles.container}>
      <FlatList
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
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.slide}
          >
            <View style={styles.topBar}>
              <View style={styles.brandMark}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={17}
                  color={colors.primary}
                />

                <Text style={styles.brandText}>
                  SnapSort
                </Text>
              </View>

              <Text style={styles.progressText}>
                {activeIndex + 1} / {slides.length}
              </Text>
            </View>

            <View style={styles.topArea}>
              <View style={styles.glowRing} />

              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor:
                      item.iconBackground,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={86}
                  color={item.iconColor}
                />
              </View>

              <View style={styles.decorativeCircleOne} />
              <View style={styles.decorativeCircleTwo} />
              <View style={styles.decorativeLeaf}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={19}
                  color="rgba(30,122,70,0.35)"
                />
              </View>
            </View>

            <View style={styles.content}>
              <View style={styles.badge}>
                <View style={styles.badgeDot} />

                <Text style={styles.badgeText}>
                  {item.badge}
                </Text>
              </View>

              <Text style={styles.title}>
                {item.title}
              </Text>

              <Text style={styles.description}>
                {item.description}
              </Text>
            </View>
          </LinearGradient>
        )}
      />

      <View style={styles.bottomPanel}>
        <View style={styles.indicatorHeader}>
          <Text style={styles.indicatorHint}>
            {isLastSlide
              ? "Ready to make a difference?"
              : "Your greener journey starts here"}
          </Text>

          <Text style={styles.indicatorCount}>
            {activeIndex + 1} of {slides.length}
          </Text>
        </View>

        <View style={styles.indicators}>
          {slides.map((slide, index) => (
            <View
              key={slide.id}
              style={[
                styles.indicator,
                activeIndex === index &&
                  styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        <View style={styles.actionRow}>
          {activeIndex > 0 && (
            <Button
              mode="outlined"
              icon="arrow-left"
              onPress={handleBack}
              accessibilityLabel="Go to previous introduction slide"
              contentStyle={styles.backButton}
              labelStyle={styles.backButtonText}
              style={styles.backButtonWrapper}
            >
              Back
            </Button>
          )}

          <Button
            mode="contained"
            onPress={handleContinue}
            accessibilityLabel={
              isLastSlide
                ? "Start exploring SnapSort"
                : "Continue introduction"
            }
            contentStyle={styles.continueButton}
            labelStyle={styles.continueButtonText}
            icon={
              isLastSlide
                ? "check-circle-outline"
                : "arrow-right"
            }
            style={
              activeIndex > 0
                ? styles.continueButtonWithBack
                : undefined
            }
          >
            {isLastSlide
              ? "Start exploring"
              : "Continue"}
          </Button>
        </View>

        {!isLastSlide && (
          <Button
            mode="text"
            onPress={handleSkip}
            textColor={colors.muted}
            accessibilityLabel="Skip introduction"
            labelStyle={styles.skipButtonText}
            style={styles.skipButton}
          >
            Skip for now
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 205,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandMark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandText: {
    fontFamily: "Poppins_700Bold",
    color: colors.primary,
    fontSize: 15,
  },
  progressText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 11,
  },
  topArea: {
    height: "47%",
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing: {
    position: "absolute",
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
  },
  iconCircle: {
    width: 218,
    height: 218,
    borderRadius: 109,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000000",
    shadowOpacity: 0.09,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 8,
    },
  },
  decorativeCircleOne: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
    top: 43,
    left: 38,
  },
  decorativeCircleTwo: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.75)",
    bottom: 25,
    right: 48,
  },
  decorativeLeaf: {
    position: "absolute",
    right: 43,
    top: 70,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  content: {
    paddingTop: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 17,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primaryDark,
    fontSize: 10,
    letterSpacing: 1.1,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 34,
    lineHeight: 43,
    letterSpacing: -0.5,
  },
  description: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 14,
    lineHeight: 23,
    marginTop: 15,
    maxWidth: 330,
  },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 28,
    elevation: 12,
    shadowColor: "#153B22",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: -5,
    },
  },
  indicatorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
  },
  indicatorHint: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 12,
  },
  indicatorCount: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
  },
  indicators: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 17,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D8E4DA",
  },
  activeIndicator: {
    width: 28,
    backgroundColor: colors.primary,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  backButtonWrapper: {
    width: 102,
  },
  backButton: {
    height: 54,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  continueButtonWithBack: {
    flex: 1,
  },
  continueButton: {
    height: 54,
  },
  continueButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
  skipButton: {
    marginTop: 3,
  },
  skipButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
});