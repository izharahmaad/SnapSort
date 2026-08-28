import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
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
  const contentMaxWidth = isTablet ? 680 : undefined;

  const displayName =
    user?.displayName?.trim() || "SnapSort user";

  const email = user?.email || "No email available";
  const initials = getInitials(displayName);

  const memberSince = useMemo(() => {
    if (!user?.metadata?.creationTime) {
      return "SnapSort member";
    }

    const date = new Date(user.metadata.creationTime);

    return `Member since ${date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        year: "numeric",
      }
    )}`;
  }, [user?.metadata?.creationTime]);

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
      <SignedOutView
        onSignIn={() => navigation.navigate("Login")}
      />
    );
  }

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: Math.max(insets.top + 8, 16),
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: Math.max(
              insets.bottom + 28,
              36
            ),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.content,
            {
              maxWidth: contentMaxWidth,
            },
          ]}
        >
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={20}
                color={colors.primary}
              />
            </Pressable>

            <View style={styles.headerCopy}>
              <Text style={styles.headerTitle}>
                Profile
              </Text>

              <Text style={styles.headerSubtitle}>
                Your SnapSort account
              </Text>
            </View>

            <View style={styles.headerLeaf}>
              <MaterialCommunityIcons
                name="leaf"
                size={18}
                color="#FFFFFF"
              />
            </View>
          </View>

          <View style={styles.profileShadow}>
            <View style={styles.profileHero}>
              <View style={styles.heroOrbLarge} />
              <View style={styles.heroOrbSmall} />

              <View style={styles.avatarOuter}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {initials}
                  </Text>
                </View>

                <View style={styles.verifiedDot}>
                  <MaterialCommunityIcons
                    name="check"
                    size={11}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              <Text style={styles.profileName}>
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
                  size={13}
                  color={colors.primary}
                />

                <Text style={styles.memberText}>
                  {memberSince}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.quickActions}>
            <QuickAction
              icon="camera-outline"
              label="New scan"
              onPress={() => navigation.navigate("Camera")}
            />

            <QuickAction
              icon="history"
              label="History"
              onPress={() => navigation.navigate("History")}
            />

            <QuickAction
              icon="chart-line"
              label="Impact"
              onPress={() => navigation.navigate("History")}
            />
          </View>

          <SectionLabel title="YOUR SNAP SORT" />

          <View style={styles.menuShadow}>
            <View style={styles.menuCard}>
              <MenuItem
                icon="camera-outline"
                title="Scan an item"
                subtitle="Get clear disposal guidance"
                onPress={() => navigation.navigate("Camera")}
              />

              <MenuDivider />

              <MenuItem
                icon="history"
                title="Scan history"
                subtitle="Review your saved decisions"
                onPress={() => navigation.navigate("History")}
              />

              <MenuDivider />

              <MenuItem
                icon="chart-line"
                title="Your progress"
                subtitle="Build better habits over time"
                onPress={() => navigation.navigate("History")}
              />
            </View>
          </View>

          <SectionLabel title="ACCOUNT DETAILS" />

          <View style={styles.menuShadow}>
            <View style={styles.menuCard}>
              <InfoItem
                icon="email-outline"
                label="Email address"
                value={email}
              />

              <MenuDivider />

              <InfoItem
                icon="shield-check-outline"
                label="Account status"
                value="Active"
              />

              <MenuDivider />

              <InfoItem
                icon="cloud-check-outline"
                label="Cloud sync"
                value="Connected"
              />
            </View>
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
            <View style={styles.signOutIcon}>
              <MaterialCommunityIcons
                name="logout"
                size={17}
                color="#B3261E"
              />
            </View>

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

function SignedOutView({
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
            size={29}
            color="#FFFFFF"
          />
        </View>
      </View>

      <Text style={styles.emptyTitle}>
        Your profile is waiting
      </Text>

      <Text style={styles.emptyText}>
        Sign in to access your account and saved scan history.
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

function SectionLabel({
  title,
}: {
  title: string;
}) {
  return (
    <Text style={styles.sectionLabel}>
      {title}
    </Text>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.quickAction}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.quickActionIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={colors.primary}
        />
      </View>

      <Text style={styles.quickActionText}>
        {label}
      </Text>
    </Pressable>
  );
}

function MenuItem({
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
      style={styles.menuItem}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.menuIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color={colors.primary}
        />
      </View>

      <View style={styles.menuCopy}>
        <Text style={styles.menuTitle}>
          {title}
        </Text>

        <Text style={styles.menuSubtitle}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.chevronCircle}>
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color={colors.muted}
        />
      </View>
    </Pressable>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.menuIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={colors.primary}
        />
      </View>

      <View style={styles.menuCopy}>
        <Text style={styles.infoLabel}>
          {label}
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

function MenuDivider() {
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
  content: {
    width: "100%",
    alignSelf: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 19,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerCopy: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10,
  },
  headerTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 22,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    marginTop: 1,
  },
  headerLeaf: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },

  profileShadow: {
    borderRadius: 27,
    shadowColor: "#173B25",
    shadowOpacity: 0.1,
    shadowRadius: 17,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },
  profileHero: {
    position: "relative",
    alignItems: "center",
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 21,
    borderRadius: 27,
    backgroundColor: colors.primary,
  },
  heroOrbLarge: {
    position: "absolute",
    width: 250,
    height: 120,
    borderRadius: 80,
    top: -68,
    right: -44,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  heroOrbSmall: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    left: -75,
    bottom: -76,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  avatarOuter: {
    position: "relative",
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.17)",
    marginBottom: 11,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  avatarText: {
    fontFamily: "Poppins_700Bold",
    color: colors.primary,
    fontSize: 26,
  },
  verifiedDot: {
    position: "absolute",
    right: 0,
    bottom: 1,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D9902C",
    borderWidth: 3,
    borderColor: colors.primary,
  },
  profileName: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 21,
  },
  profileEmail: {
    maxWidth: "95%",
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.82)",
    fontSize: 11,
    marginTop: 2,
  },
  memberPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 13,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },
  memberText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 10,
  },

  quickActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 13,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  quickActionText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 10,
    marginTop: 6,
  },

  sectionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1.4,
    marginTop: 24,
    marginBottom: 9,
    marginLeft: 3,
  },
  menuShadow: {
    borderRadius: 22,
    shadowColor: "#173B25",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },
  menuCard: {
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
  },
  infoItem: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  menuCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  menuTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 12,
  },
  menuSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },
  chevronCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F6F2",
  },
  divider: {
    height: 1,
    marginLeft: 50,
    backgroundColor: colors.border,
  },
  infoLabel: {
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
    minWidth: 145,
    height: 45,
    paddingHorizontal: 17,
    marginTop: 23,
    borderRadius: 23,
    backgroundColor: "#FFF0EF",
    borderWidth: 1,
    borderColor: "#F1C1BE",
  },
  signOutIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
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
    maxWidth: 300,
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
    fontSize: 21,
    textAlign: "center",
    marginTop: 19,
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
    minWidth: 145,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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