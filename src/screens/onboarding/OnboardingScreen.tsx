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

const slides = [
  {
    id: "1",
    icon: "camera-outline",
    iconBackground: "#DDF8E5",
    iconColor: "#1E7A46",
    badge: "SMART SCANNING",
    title: "Point. Snap.\nSort smarter.",
    description:
      "Take a photo of everyday items and get clear, practical guidance in seconds.",
    gradient: ["#F1FFF5", "#DFF8E7"] as const,
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
    gradient: ["#F3F7FF", "#E2ECFF"] as const,
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
    gradient: ["#FFF9EF", "#FFF0D7"] as const,
  },
];

export default function OnboardingScreen() {
  const listRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const completeOnboarding = useOnboardingStore(
    (state) => state.completeOnboarding
  );

  const isLastSlide = activeIndex === slides.length - 1;

  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const handleContinue = async () => {
    if (isLastSlide) {
      await completeOnboarding();
      return;
    }

    listRef.current?.scrollToIndex({
      index: activeIndex + 1,
      animated: true,
    });
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
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <LinearGradient colors={item.gradient} style={styles.slide}>
            <View style={styles.topArea}>
              <View style={[styles.iconCircle, { backgroundColor: item.iconBackground }]}>
                <MaterialCommunityIcons
                  name={item.icon as never}
                  size={86}
                  color={item.iconColor}
                />
              </View>

              <View style={styles.decorativeCircleOne} />
              <View style={styles.decorativeCircleTwo} />
            </View>

            <View style={styles.content}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>

              <Text style={styles.title}>{item.title}</Text>

              <Text style={styles.description}>{item.description}</Text>
            </View>
          </LinearGradient>
        )}
      />

      <View style={styles.bottomPanel}>
        <View style={styles.indicators}>
          {slides.map((slide, index) => (
            <View
              key={slide.id}
              style={[
                styles.indicator,
                activeIndex === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        <Button
          mode="contained"
          onPress={handleContinue}
          contentStyle={styles.continueButton}
          labelStyle={styles.continueButtonText}
          icon={isLastSlide ? "check-circle-outline" : "arrow-right"}
        >
          {isLastSlide ? "Start exploring" : "Continue"}
        </Button>

        {!isLastSlide && (
          <Button
            mode="text"
            onPress={handleSkip}
            textColor={colors.muted}
            labelStyle={styles.skipButtonText}
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
    paddingTop: 76,
  },
  topArea: {
    height: "48%",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  decorativeCircleOne: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
    top: 52,
    left: 42,
  },
  decorativeCircleTwo: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.75)",
    bottom: 32,
    right: 54,
  },
  content: {
    paddingTop: 12,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 18,
  },
  badgeText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primaryDark,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 34,
    lineHeight: 43,
  },
  description: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 16,
    maxWidth: 330,
  },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 30,
    elevation: 12,
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 7,
    marginBottom: 18,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D8E4DA",
  },
  activeIndicator: {
    width: 25,
    backgroundColor: colors.primary,
  },
  continueButton: {
    height: 54,
  },
  continueButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },
  skipButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
});