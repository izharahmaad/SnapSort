import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "About"
>;

type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

const WHITE = "#FFFFFF";
const CREAM = "#FFFEFA";
const FOREST = "#075C34";
const DEEP_FOREST = "#04331D";
const EMERALD = "#16824B";
const TEXT = "#17271D";
const MUTED = "#6D7B72";
const LIGHT_GREEN = "#EAF7EE";
const LIGHT_GOLD = "#FFF3DB";
const GOLD = "#C98718";

export default function AboutScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  const handleSupport = async () => {
    const emailUrl =
      "mailto:support@snapsort.ai?subject=SnapSort%20AI%20Support";

    const canOpen = await Linking.canOpenURL(emailUrl);

    if (canOpen) {
      await Linking.openURL(emailUrl);
    }
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[DEEP_FOREST, FOREST, EMERALD]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.header,
          {
            paddingTop: Math.max(
              insets.top + 10,
              22
            ),
          },
        ]}
      >
        <View style={styles.topBar}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={21}
              color={WHITE}
            />
          </Pressable>

          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <MaterialCommunityIcons
                name="leaf"
                size={14}
                color={FOREST}
              />
            </View>

            <Text style={styles.brandText}>
              SnapSort AI
            </Text>
          </View>

          <View style={styles.topSpace} />
        </View>

        <View style={styles.headerContent}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <MaterialCommunityIcons
                name="leaf"
                size={35}
                color={FOREST}
              />
            </View>
          </View>

          <Text style={styles.headerTitle}>
            SnapSort AI
          </Text>

          <Text style={styles.headerSubtitle}>
            Make every disposal decision count.
          </Text>

          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>
              VERSION 1.0.0
            </Text>
          </View>
        </View>

        <View style={styles.decorLeaf}>
          <MaterialCommunityIcons
            name="leaf"
            size={32}
            color="rgba(255,255,255,0.14)"
          />
        </View>

        <View style={styles.decorRecycle}>
          <MaterialCommunityIcons
            name="recycle"
            size={18}
            color="rgba(255,255,255,0.14)"
          />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(
              insets.bottom + 30,
              40
            ),
          },
        ]}
      >
        <Text style={styles.introTitle}>
          Better choices start with clarity.
        </Text>

        <Text style={styles.introText}>
          SnapSort AI helps you identify everyday items and
          understand how to dispose of them more responsibly.
          Scan an item, receive clear guidance, and build
          more sustainable habits over time.
        </Text>

        <View style={styles.missionCard}>
          <View style={styles.missionIcon}>
            <MaterialCommunityIcons
              name="earth"
              size={23}
              color={FOREST}
            />
          </View>

          <View style={styles.missionCopy}>
            <Text style={styles.missionLabel}>
              OUR MISSION
            </Text>

            <Text style={styles.missionText}>
              Make sustainable disposal simple, useful,
              and accessible for everyone.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          WHAT SNAPSort AI HELPS WITH
        </Text>

        <FeatureCard
          icon="camera-outline"
          title="Smart item scans"
          text="Scan an everyday item and receive simple guidance on how to handle it."
          iconBackground={LIGHT_GREEN}
          iconColor={FOREST}
        />

        <FeatureCard
          icon="history"
          title="Saved scan history"
          text="Keep your previous scans in one place and revisit guidance whenever you need it."
          iconBackground={LIGHT_GREEN}
          iconColor={FOREST}
        />

        <FeatureCard
          icon="sprout"
          title="Greener everyday habits"
          text="Use each scan as a small step toward more mindful choices."
          iconBackground={LIGHT_GOLD}
          iconColor={GOLD}
        />

        <Text style={styles.sectionLabel}>
          SUPPORT
        </Text>

        <Pressable
          style={styles.supportCard}
          onPress={handleSupport}
          accessibilityRole="button"
          accessibilityLabel="Contact SnapSort AI support"
        >
          <View style={styles.supportIcon}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={WHITE}
            />
          </View>

          <View style={styles.supportCopy}>
            <Text style={styles.supportTitle}>
              Contact support
            </Text>

            <Text style={styles.supportText}>
              Need help or want to share feedback?
            </Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={FOREST}
          />
        </Pressable>

        <View style={styles.bottomInfo}>
          <MaterialCommunityIcons
            name="heart-outline"
            size={15}
            color={FOREST}
          />

          <Text style={styles.bottomInfoText}>
            Built to support thoughtful everyday choices.
          </Text>
        </View>

        <Text style={styles.footerText}>
          © 2026 SnapSort AI. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}

function FeatureCard({
  icon,
  title,
  text,
  iconBackground,
  iconColor,
}: {
  icon: IconName;
  title: string;
  text: string;
  iconBackground: string;
  iconColor: string;
}) {
  return (
    <View style={styles.featureCard}>
      <View
        style={[
          styles.featureIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={iconColor}
        />
      </View>

      <View style={styles.featureCopy}>
        <Text style={styles.featureTitle}>
          {title}
        </Text>

        <Text style={styles.featureText}>
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CREAM,
  },

  header: {
    minHeight: 300,
    overflow: "hidden",
    paddingHorizontal: 20,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandIcon: {
    width: 29,
    height: 29,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
    marginRight: 7,
  },

  brandText: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 11,
  },

  topSpace: {
    width: 43,
    height: 43,
  },

  headerContent: {
    alignItems: "center",
    marginTop: 20,
  },

  logoOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.27)",
  },

  logoInner: {
    width: 67,
    height: 67,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  headerTitle: {
    fontFamily: "Poppins_700Bold",
    color: WHITE,
    fontSize: 27,
    marginTop: 12,
  },

  headerSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.82)",
    fontSize: 10,
    marginTop: 2,
  },

  versionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 13,
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  versionText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#D8F8E1",
    fontSize: 8,
    letterSpacing: 1.1,
  },

  decorLeaf: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 65,
    height: 65,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  decorRecycle: {
    position: "absolute",
    left: 35,
    bottom: 27,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  introTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 18,
  },

  introText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 6,
  },

  missionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginTop: 21,
    borderRadius: 22,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#C9E8D1",
  },

  missionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  missionCopy: {
    flex: 1,
    marginLeft: 10,
  },

  missionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
    letterSpacing: 1.1,
  },

  missionText: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },

  sectionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: 25,
    marginBottom: 9,
    marginLeft: 2,
  },

  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginTop: 9,
    borderRadius: 22,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "#E3ECE5",
  },

  featureIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  featureCopy: {
    flex: 1,
    marginLeft: 11,
  },

  featureTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
  },

  featureText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },

  supportCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    borderRadius: 22,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#C7E8D1",
  },

  supportIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },

  supportCopy: {
    flex: 1,
    marginLeft: 10,
  },

  supportTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
  },

  supportText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: 2,
  },

  bottomInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  bottomInfoText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginLeft: 6,
  },

  footerText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    textAlign: "center",
    marginTop: 14,
  },
});