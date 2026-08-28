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
  const contentMaxWidth = isTablet ? 760 : undefined;

  const displayName =
    user?.displayName?.trim() || "SnapSort user";

  const email = user?.email || "No email available";
  const initials = getInitials(displayName);

  // Safe static value: avoids user.metadata TypeScript error.
  const memberSince = "SnapSort member";

  const handleSignOut = () => {
    if (isSigningOut) {
      return;
    }

    Alert.alert(
      "Sign out?",
      "You can sign in again anytime to access your saved scans.",
      [
        {
          text: "Cancel",
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
                "Sign out failed",
                "We could not sign you out. Please try again."
              );
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
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
              insets.bottom + 28,
              34
            ),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[
            "#0B5D31",
            colors.primary,
            "#168148",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.hero,
            {
              paddingTop: Math.max(
                insets.top + 12,
                22
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
            <View style={styles.heroGlowLarge} />
            <View style={styles.heroGlowSmall} />

            <View style={styles.heroTopRow}>
              <Pressable
                style={styles.heroBackButton}
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

              <View style={styles.heroBrand}>
                <View style={styles.heroLeaf}>
                  <MaterialCommunityIcons
                    name="leaf"
                    size={14}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.heroBrandText}>
                  SnapSort AI
                </Text>
              </View>

              <View style={styles.heroMenuIcon}>
                <MaterialCommunityIcons
                  name="account-cog-outline"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.heroTitleArea}>
              <Text style={styles.heroEyebrow}>
                ACCOUNT
              </Text>

              <Text style={styles.heroTitle}>
                Your profile
              </Text>

              <Text style={styles.heroSubtitle}>
                Manage your account and continue building greener habits.
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
          <View style={styles.identityShadow}>
            <View style={styles.identityCard}>
              <View style={styles.avatarRing}>
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

              <View style={styles.identityCopy}>
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

                <View style={styles.memberChip}>
                  <MaterialCommunityIcons
                    name="leaf"
                    size={12}
                    color={colors.primary}
                  />

                  <Text style={styles.memberText}>
                    {memberSince}
                  </Text>
                </View>
              </View>

              <View style={styles.identityIcon}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
            </View>
          </View>

          <View style={styles.actionGrid}>
            <ActionTile
              icon="camera-outline"
              title="Scan"
              subtitle="New item"
              accent="#E1F5E7"
              onPress={() => navigation.navigate("Camera")}
            />

            <ActionTile
              icon="history"
              title="History"
              subtitle="Saved scans"
              accent="#E7EEFF"
              onPress={() => navigation.navigate("History")}
            />

            <ActionTile
              icon="chart-line"
              title="Impact"
              subtitle="Your progress"
              accent="#FFF0D7"
              onPress={() => navigation.navigate("History")}
            />
          </View>

          <SectionHeader
            title="YOUR ACTIVITY"
            subtitle="Continue your sustainability journey"
          />

          <View style={styles.activityHighlight}>
            <View style={styles.activityIcon}>
              <MaterialCommunityIcons
                name="camera-plus-outline"
                size={24}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.activityCopy}>
              <Text style={styles.activityTitle}>
                What are you sorting today?
              </Text>

              <Text style={styles.activityText}>
                Take a photo and get clear disposal guidance in seconds.
              </Text>
            </View>

            <Pressable
              style={styles.activityButton}
              onPress={() => navigation.navigate("Camera")}
              accessibilityRole="button"
              accessibilityLabel="Start a new scan"
            >
              <MaterialCommunityIcons
                name="arrow-right"
                size={18}
                color={colors.primary}
              />
            </Pressable>
          </View>

          <View style={styles.menuCard}>
            <ProfileMenuItem
              icon="history"
              title="Scan history"
              subtitle="Review your saved decisions"
              onPress={() => navigation.navigate("History")}
            />

            <Divider />

            <ProfileMenuItem
              icon="chart-line"
              title="Your impact"
              subtitle="See how your habits add up"
              onPress={() => navigation.navigate("History")}
            />
          </View>

          <SectionHeader
            title="ACCOUNT SETTINGS"
            subtitle="Your account information"
          />

          <View style={styles.menuCard}>
            <InfoMenuItem
              icon="email-outline"
              title="Email address"
              value={email}
            />

            <Divider />

            <InfoMenuItem
              icon="shield-check-outline"
              title="Account status"
              value="Active"
            />

            <Divider />

            <InfoMenuItem
              icon="cloud-check-outline"
              title="Cloud sync"
              value="Connected"
            />
          </View>

          <Pressable
            style={[
              styles.signOutButton,
              isSigningOut && styles.disabledButton,
            ]}
            onPress={handleSignOut}
            disabled={isSigningOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <MaterialCommunityIcons
              name="logout"
              size={17}
              color="#B3261E"
            />

            <Text style={styles.signOutText}>
              {isSigningOut
                ? "Signing out..."
                : "Sign out"}
            </Text>
          </Pressable>

          <Text style={styles.footerText}>
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
      <View style={styles.emptyLogoRing}>
        <View style={styles.emptyLogo}>
          <MaterialCommunityIcons
            name="leaf"
            size={30}
            color="#FFFFFF"
          />
        </View>
      </View>

      <Text style={styles.emptyTitle}>
        Your account is waiting
      </Text>

      <Text style={styles.emptyText}>
        Sign in to access your profile and saved scanning history.
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

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <Text style={styles.sectionSubtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

function ActionTile({
  icon,
  title,
  subtitle,
  accent,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.actionTile}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        style={[
          styles.actionTileIcon,
          {
            backgroundColor: accent,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={colors.primary}
        />
      </View>

      <Text style={styles.actionTileTitle}>
        {title}
      </Text>

      <Text style={styles.actionTileSubtitle}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

function ProfileMenuItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.menuRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.menuRowIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={colors.primary}
        />
      </View>

      <View style={styles.menuRowCopy}>
        <Text style={styles.menuRowTitle}>
          {title}
        </Text>

        <Text style={styles.menuRowSubtitle}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.menuArrow}>
        <MaterialCommunityIcons
          name="chevron-right"
          size={19}
          color={colors.muted}
        />
      </View>
    </Pressable>
  );
}

function InfoMenuItem({
  icon,
  title,
  value,
}: {
  icon: IconName;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.menuRow}>
      <View style={styles.menuRowIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color={colors.primary}
        />
      </View>

      <View style={styles.menuRowCopy}>
        <Text style={styles.infoTitle}>
          {title}
        </Text>

        <Text
          style={styles.infoValue}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
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
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },

  hero: {
    minHeight: 235,
    overflow: "hidden",
  },
  heroInner: {
    position: "relative",
    width: "100%",
    alignSelf: "center",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroBackButton: {
    width: 41,
    height: 41,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  heroBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  heroLeaf: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  heroBrandText: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 13,
  },
  heroMenuIcon: {
    width: 41,
    height: 41,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  heroTitleArea: {
    marginTop: 33,
    maxWidth: 360,
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
    fontSize: 31,
    letterSpacing: -0.6,
    marginTop: 4,
  },
  heroSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 4,
  },
  heroGlowLarge: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -105,
    right: -95,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  heroGlowSmall: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    bottom: -50,
    right: 42,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  content: {
    width: "100%",
    alignSelf: "center",
    marginTop: -60,
  },
  identityShadow: {
    borderRadius: 25,
    shadowColor: "#123B22",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 9,
    },
    elevation: 7,
  },
  identityCard: {
    minHeight: 112,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EEE5",
  },
  avatarRing: {
    position: "relative",
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  avatarText: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 22,
  },
  verifiedBadge: {
    position: "absolute",
    right: -1,
    bottom: 1,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DB962C",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  identityCopy: {
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
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
  },
  memberText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 8,
  },
  identityIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F7F2",
  },

  actionGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  actionTile: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 13,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionTileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTileTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 11,
    marginTop: 7,
  },
  actionTileSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 8,
    marginTop: 1,
  },

  sectionHeader: {
    marginTop: 25,
    marginBottom: 9,
    marginLeft: 2,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 9,
    letterSpacing: 1.3,
  },
  sectionSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    marginTop: 2,
  },

  activityHighlight: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 23,
    backgroundColor: "#EAF7ED",
    borderWidth: 1,
    borderColor: "#D1EAD7",
  },
  activityIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  activityCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  activityTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 12,
  },
  activityText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },
  activityButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: "#FFFFFF",
    shadowColor: "#173B25",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
  },

  menuCard: {
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
  },
  menuRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  menuRowCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  menuRowTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 12,
  },
  menuRowSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },
  menuArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F7F3",
  },
  divider: {
    height: 1,
    marginLeft: 51,
    backgroundColor: colors.border,
  },
  infoTitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
  },
  infoValue: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 11,
    marginTop: 2,
  },

  signOutButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    minWidth: 142,
    height: 44,
    paddingHorizontal: 16,
    marginTop: 24,
    borderRadius: 22,
    backgroundColor: "#FFF0EF",
    borderWidth: 1,
    borderColor: "#F1C1BE",
  },
  signOutText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#B3261E",
    fontSize: 11,
  },
  disabledButton: {
    opacity: 0.55,
  },
  footerText: {
    maxWidth: 310,
    alignSelf: "center",
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    textAlign: "center",
    marginTop: 17,
  },

  emptyScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  emptyLogoRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
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
    backgroundColor: colors.primary,
  },
  emptyTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 22,
    textAlign: "center",
    marginTop: 20,
  },
  emptyText: {
    maxWidth: 290,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minWidth: 145,
    height: 48,
    paddingHorizontal: 17,
    marginTop: 20,
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  emptyButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 12,
  },
});