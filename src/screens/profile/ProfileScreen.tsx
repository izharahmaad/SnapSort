import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "react-native-paper";
import { signOut } from "firebase/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";
import { auth } from "../../services/firebase/firebase";
import { useAuthStore } from "../../stores/auth.store";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Profile"
>;

type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

const FOREST = "#0E5E35";
const DEEP_FOREST = "#083D22";
const MINT = "#E7F6EA";
const CREAM = "#FFFDF7";
const SUN = "#E6A23C";
const SUN_LIGHT = "#FFF0D1";
const DANGER = "#B3261E";
const DANGER_LIGHT = "#FFF2F1";

export default function ProfileScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const user = useAuthStore((state) => state.user);
  const [isSigningOut, setIsSigningOut] =
    useState(false);

  const isTablet = width >= 700;
  const horizontalPadding = isTablet ? 38 : 20;
  const contentMaxWidth = isTablet ? 740 : undefined;

  const displayName =
    user?.displayName?.trim() || "SnapSort user";

  const email = user?.email || "No email available";
  const initials = getInitials(displayName);

  const handleSignOut = () => {
    if (isSigningOut) {
      return;
    }

    Alert.alert(
      "Sign out of SnapSort AI?",
      "Your saved scans will stay safely connected to your account. You can sign in again anytime.",
      [
        {
          text: "Keep me signed in",
          style: "cancel",
        },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            try {
              setIsSigningOut(true);
              await signOut(auth);
            } catch {
              Alert.alert(
                "Could not sign out",
                "Please check your connection and try again."
              );
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ],
      {
        cancelable: true,
      }
    );
  };

  if (!user) {
    return (
      <SignedOutState
        onSignIn={() => navigation.navigate("Login")}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(
              insets.bottom + 30,
              38
            ),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[DEEP_FOREST, FOREST, "#167646"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.hero,
            {
              paddingTop: Math.max(
                insets.top + 14,
                24
              ),
            },
          ]}
        >
          <View
            style={[
              styles.heroInner,
              {
                maxWidth: contentMaxWidth,
                paddingHorizontal: horizontalPadding,
              },
            ]}
          >
            <View style={styles.heroOrbLarge} />
            <View style={styles.heroOrbSmall} />
            <View style={styles.heroDotOne} />
            <View style={styles.heroDotTwo} />

            <View style={styles.heroTopBar}>
              <Pressable
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={20}
                  color="#FFFFFF"
                />
              </Pressable>

              <View style={styles.brand}>
                <View style={styles.brandLeaf}>
                  <MaterialCommunityIcons
                    name="leaf"
                    size={15}
                    color={FOREST}
                  />
                </View>

                <Text style={styles.brandText}>
                  SnapSort AI
                </Text>
              </View>

              <View style={styles.headerPlaceholder} />
            </View>

            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>
                ACCOUNT DASHBOARD
              </Text>

              <Text style={styles.heroTitle}>
                Your eco profile
              </Text>

              <Text style={styles.heroSubtitle}>
                Keep every thoughtful choice in one place.
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View
          style={[
            styles.content,
            {
              maxWidth: contentMaxWidth,
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          <View style={styles.profileCardShadow}>
            <View style={styles.profileCard}>
              <View style={styles.avatarHalo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {initials}
                  </Text>
                </View>

                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons
                    name="check"
                    size={11}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              <View style={styles.profileCopy}>
                <Text
                  style={styles.profileName}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>

                <Text
                  style={styles.profileEmail}
                  numberOfLines={1}
                >
                  {email}
                </Text>

                <View style={styles.memberPill}>
                  <MaterialCommunityIcons
                    name="leaf"
                    size={12}
                    color={FOREST}
                  />

                  <Text style={styles.memberText}>
                    SnapSort member
                  </Text>
                </View>
              </View>

              <View style={styles.profileBadge}>
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={21}
                  color={FOREST}
                />
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatCard
              icon="camera-outline"
              value="Scan"
              label="New item"
              color={FOREST}
              background={MINT}
              onPress={() => navigation.navigate("Camera")}
            />

            <StatCard
              icon="history"
              value="History"
              label="Saved scans"
              color="#365FB8"
              background="#EAF0FF"
              onPress={() => navigation.navigate("History")}
            />

            <StatCard
              icon="sprout"
              value="Impact"
              label="Your habits"
              color="#B76C0C"
              background={SUN_LIGHT}
              onPress={() => navigation.navigate("History")}
            />
          </View>

          <SectionHeader
            label="YOUR SNAP SORT"
            title="Continue your journey"
          />

          <Pressable
            style={styles.featureCard}
            onPress={() => navigation.navigate("Camera")}
            accessibilityRole="button"
            accessibilityLabel="Start a new scan"
          >
            <LinearGradient
              colors={["#EAF8ED", "#D6F0DC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featureGradient}
            >
              <View style={styles.featureCircleLarge} />
              <View style={styles.featureCircleSmall} />

              <View style={styles.featureIcon}>
                <MaterialCommunityIcons
                  name="camera-plus-outline"
                  size={24}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.featureCopy}>
                <Text style={styles.featureTitle}>
                  Sort your next item
                </Text>

                <Text style={styles.featureText}>
                  Take a photo for clear disposal guidance.
                </Text>
              </View>

              <View style={styles.featureArrow}>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={19}
                  color="#FFFFFF"
                />
              </View>
            </LinearGradient>
          </Pressable>

          <View style={styles.actionGrid}>
            <DashboardCard
              icon="history"
              title="Scan history"
              text="Review saved results"
              accent="#E6F5E9"
              iconColor={FOREST}
              onPress={() => navigation.navigate("History")}
            />

            <DashboardCard
              icon="chart-timeline-variant-shimmer"
              title="Your impact"
              text="Build better habits"
              accent="#FFF0D7"
              iconColor="#B76C0C"
              onPress={() => navigation.navigate("History")}
            />
          </View>

          <SectionHeader
            label="ACCOUNT"
            title="Your account details"
          />

          <View style={styles.settingsCard}>
            <AccountRow
              icon="email-outline"
              title="Email address"
              value={email}
            />

            <View style={styles.divider} />

            <AccountRow
              icon="shield-check-outline"
              title="Account status"
              value="Active and protected"
            />

            <View style={styles.divider} />

            <AccountRow
              icon="cloud-check-outline"
              title="Cloud sync"
              value="Firebase connected"
            />
          </View>

          <View style={styles.accountActionSection}>
            <Text style={styles.accountActionLabel}>
              ACCOUNT ACTIONS
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.signOutButton,
                pressed && styles.signOutPressed,
                isSigningOut && styles.disabledButton,
              ]}
              onPress={handleSignOut}
              disabled={isSigningOut}
              accessibilityRole="button"
              accessibilityLabel="Sign out of SnapSort AI"
            >
              <View style={styles.signOutIcon}>
                <MaterialCommunityIcons
                  name="logout"
                  size={19}
                  color={DANGER}
                />
              </View>

              <View style={styles.signOutCopy}>
                <Text style={styles.signOutTitle}>
                  {isSigningOut
                    ? "Signing out..."
                    : "Sign out"}
                </Text>

                <Text style={styles.signOutSubtitle}>
                  Use another account
                </Text>
              </View>

              <View style={styles.signOutArrow}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={DANGER}
                />
              </View>
            </Pressable>
          </View>

          <Text style={styles.footer}>
            SnapSort AI provides general disposal guidance.
            Local rules may vary.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SignedOutState({
  onSignIn,
}: {
  onSignIn: () => void;
}) {
  return (
    <View style={styles.emptyScreen}>
      <View style={styles.emptyLogoOuter}>
        <View style={styles.emptyLogo}>
          <MaterialCommunityIcons
            name="leaf"
            size={31}
            color="#FFFFFF"
          />
        </View>
      </View>

      <Text style={styles.emptyTitle}>
        Your profile is waiting
      </Text>

      <Text style={styles.emptyText}>
        Sign in to access saved scans and your sustainability journey.
      </Text>

      <Pressable
        style={styles.emptyButton}
        onPress={onSignIn}
        accessibilityRole="button"
        accessibilityLabel="Sign in"
      >
        <Text style={styles.emptyButtonText}>
          Sign in
        </Text>

        <MaterialCommunityIcons
          name="arrow-right"
          size={18}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
  background,
  onPress,
}: {
  icon: IconName;
  value: string;
  label: string;
  color: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.statCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value}
    >
      <View
        style={[
          styles.statIcon,
          {
            backgroundColor: background,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={color}
        />
      </View>

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionHeader({
  label,
  title,
}: {
  label: string;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>
        {label}
      </Text>

      <Text style={styles.sectionTitle}>
        {title}
      </Text>
    </View>
  );
}

function DashboardCard({
  icon,
  title,
  text,
  accent,
  iconColor,
  onPress,
}: {
  icon: IconName;
  title: string;
  text: string;
  accent: string;
  iconColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.dashboardCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        style={[
          styles.dashboardIcon,
          {
            backgroundColor: accent,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={21}
          color={iconColor}
        />
      </View>

      <Text style={styles.dashboardTitle}>
        {title}
      </Text>

      <Text style={styles.dashboardText}>
        {text}
      </Text>

      <View style={styles.dashboardArrow}>
        <MaterialCommunityIcons
          name="arrow-top-right"
          size={16}
          color={iconColor}
        />
      </View>
    </Pressable>
  );
}

function AccountRow({
  icon,
  title,
  value,
}: {
  icon: IconName;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.accountRow}>
      <View style={styles.accountIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color={FOREST}
        />
      </View>

      <View style={styles.accountCopy}>
        <Text style={styles.accountTitle}>
          {title}
        </Text>

        <Text
          style={styles.accountValue}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function getInitials(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "S";
  }

  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CREAM,
  },
  scrollContent: {
    flexGrow: 1,
  },

  hero: {
    minHeight: 260,
    overflow: "hidden",
  },
  heroInner: {
    position: "relative",
    width: "100%",
    alignSelf: "center",
  },
  heroTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  brandLeaf: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  brandText: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 13,
  },
  headerPlaceholder: {
    width: 42,
    height: 42,
  },
  heroCopy: {
    maxWidth: 360,
    marginTop: 34,
  },
  heroEyebrow: {
    fontFamily: "Poppins_600SemiBold",
    color: "rgba(255,255,255,0.72)",
    fontSize: 9,
    letterSpacing: 1.4,
  },
  heroTitle: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 32,
    letterSpacing: -0.7,
    marginTop: 4,
  },
  heroSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.84)",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
  },
  heroOrbLarge: {
    position: "absolute",
    top: -100,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.11)",
  },
  heroOrbSmall: {
    position: "absolute",
    bottom: -48,
    right: 35,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroDotOne: {
    position: "absolute",
    top: 104,
    right: 56,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.32)",
  },
  heroDotTwo: {
    position: "absolute",
    top: 135,
    right: 86,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.27)",
  },

  content: {
    width: "100%",
    alignSelf: "center",
    marginTop: -66,
  },
  profileCardShadow: {
    borderRadius: 25,
    shadowColor: "#0A3C22",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 7,
  },
  profileCard: {
    minHeight: 116,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2EFE5",
  },
  avatarHalo: {
    position: "relative",
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DFF2E3",
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },
  avatarText: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 23,
  },
  verifiedBadge: {
    position: "absolute",
    right: -1,
    bottom: 1,
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SUN,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  profileName: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 17,
  },
  profileEmail: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    marginTop: 2,
  },
  memberPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: MINT,
  },
  memberText: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
  },
  profileBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MINT,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 13,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EEE6",
  },
  statIcon: {
    width: 41,
    height: 41,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 11,
    marginTop: 7,
  },
  statLabel: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 8,
    marginTop: 1,
  },

  sectionHeader: {
    marginTop: 26,
    marginBottom: 10,
    marginLeft: 2,
  },
  sectionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 9,
    letterSpacing: 1.3,
  },
  sectionTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 17,
    marginTop: 2,
  },

  featureCard: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#0F4F2B",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },
  featureGradient: {
    position: "relative",
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#CBE5D2",
  },
  featureCircleLarge: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    right: -66,
    top: -62,
    backgroundColor: "rgba(255,255,255,0.26)",
  },
  featureCircleSmall: {
    position: "absolute",
    width: 65,
    height: 65,
    borderRadius: 33,
    right: 37,
    bottom: -38,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  featureIcon: {
    width: 47,
    height: 47,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },
  featureCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  featureTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 13,
  },
  featureText: {
    fontFamily: "Poppins_400Regular",
    color: "#4E6857",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },
  featureArrow: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: FOREST,
  },

  actionGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 11,
  },
  dashboardCard: {
    position: "relative",
    flex: 1,
    minHeight: 142,
    padding: 13,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EEE6",
  },
  dashboardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dashboardTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 12,
    marginTop: 12,
  },
  dashboardText: {
    maxWidth: "88%",
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },
  dashboardArrow: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F7F3",
  },

  settingsCard: {
    paddingHorizontal: 14,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EEE6",
  },
  accountRow: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MINT,
  },
  accountCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  accountTitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
  },
  accountValue: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 51,
    backgroundColor: "#E7EEE8",
  },

  accountActionSection: {
    marginTop: 27,
  },
  accountActionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1.3,
    marginBottom: 9,
    marginLeft: 3,
  },
  signOutButton: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    borderRadius: 22,
    backgroundColor: DANGER_LIGHT,
    borderWidth: 1,
    borderColor: "#F1CCC8",
    shadowColor: "#7A1D18",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },
  signOutPressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },
  signOutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F6D8D5",
  },
  signOutCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  signOutTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: DANGER,
    fontSize: 12,
  },
  signOutSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "#95615D",
    fontSize: 9,
    marginTop: 2,
  },
  signOutArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  disabledButton: {
    opacity: 0.55,
  },
  footer: {
    maxWidth: 310,
    alignSelf: "center",
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    textAlign: "center",
    marginTop: 18,
  },

  emptyScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: CREAM,
  },
  emptyLogoOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D9EEDD",
  },
  emptyLogo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },
  emptyTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 22,
    textAlign: "center",
    marginTop: 20,
  },
  emptyText: {
    maxWidth: 300,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
  },
  emptyButton: {
    minWidth: 145,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 17,
    marginTop: 20,
    borderRadius: 24,
    backgroundColor: FOREST,
  },
  emptyButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 12,
  },
});