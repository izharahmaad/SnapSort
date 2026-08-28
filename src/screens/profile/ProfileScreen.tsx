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
  const maxContentWidth = isTablet ? 700 : undefined;

  const displayName =
    user?.displayName?.trim() || "SnapSort user";

  const email = user?.email || "No email available";
  const initials = getInitials(displayName);

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
              34
            ),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.content,
            {
              maxWidth: maxContentWidth,
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
                Manage your SnapSort account
              </Text>
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {initials}
                </Text>
              </View>

              <View style={styles.activeBadge}>
                <MaterialCommunityIcons
                  name="check"
                  size={10}
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
                  color={colors.primary}
                />

                <Text style={styles.memberText}>
                  SnapSort member
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

          <SectionTitle title="YOUR ACTIVITY" />

          <View style={styles.menuCard}>
            <MenuItem
              icon="camera-outline"
              title="Scan an item"
              description="Identify an item and get clear guidance."
              onPress={() => navigation.navigate("Camera")}
            />

            <Divider />

            <MenuItem
              icon="history"
              title="Scan history"
              description="View your saved disposal decisions."
              onPress={() => navigation.navigate("History")}
            />

            <Divider />

            <MenuItem
              icon="chart-line"
              title="Your impact"
              description="Track your progress over time."
              onPress={() => navigation.navigate("History")}
            />
          </View>

          <SectionTitle title="ACCOUNT" />

          <View style={styles.menuCard}>
            <InfoItem
              icon="email-outline"
              title="Email address"
              value={email}
            />

            <Divider />

            <InfoItem
              icon="shield-check-outline"
              title="Account status"
              value="Active"
            />

            <Divider />

            <InfoItem
              icon="cloud-check-outline"
              title="Cloud sync"
              value="Connected"
            />
          </View>

          <View style={styles.signOutSection}>
            <Text style={styles.signOutHint}>
              Want to use a different account?
            </Text>

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
                  size={18}
                  color="#B3261E"
                />
              </View>

              <Text style={styles.signOutText}>
                {isSigningOut
                  ? "Signing out..."
                  : "Sign out"}
              </Text>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#B3261E"
              />
            </Pressable>
          </View>

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
            size={29}
            color="#FFFFFF"
          />
        </View>
      </View>

      <Text style={styles.emptyTitle}>
        Sign in to your account
      </Text>

      <Text style={styles.emptyText}>
        Access your profile, saved scans, and sustainability journey.
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
          size={19}
          color={colors.primary}
        />
      </View>

      <Text style={styles.quickActionText}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <Text style={styles.sectionTitle}>
      {title}
    </Text>
  );
}

function MenuItem({
  icon,
  title,
  description,
  onPress,
}: {
  icon: IconName;
  title: string;
  description: string;
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

        <Text style={styles.menuDescription}>
          {description}
        </Text>
      </View>

      <View style={styles.chevronCircle}>
        <MaterialCommunityIcons
          name="chevron-right"
          size={19}
          color={colors.muted}
        />
      </View>
    </Pressable>
  );
}

function InfoItem({
  icon,
  title,
  value,
}: {
  icon: IconName;
  title: string;
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
  content: {
    width: "100%",
    alignSelf: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 21,
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
    marginLeft: 12,
  },
  headerTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 24,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    marginTop: 1,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 17,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#173B25",
    shadowOpacity: 0.06,
    shadowRadius: 13,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
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
  activeBadge: {
    position: "absolute",
    right: -1,
    bottom: 1,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D9902C",
    borderWidth: 3,
    borderColor: colors.surface,
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
  },
  profileName: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 18,
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
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
  },
  memberText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 9,
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
    width: 37,
    height: 37,
    borderRadius: 19,
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

  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1.35,
    marginTop: 24,
    marginBottom: 9,
    marginLeft: 3,
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
  menuDescription: {
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
    backgroundColor: "#F1F6F2",
  },
  divider: {
    height: 1,
    marginLeft: 50,
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

  signOutSection: {
    marginTop: 25,
  },
  signOutHint: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    textAlign: "center",
    marginBottom: 9,
  },
  signOutButton: {
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: "#FFF5F4",
    borderWidth: 1,
    borderColor: "#F0CCC8",
  },
  signOutIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  signOutText: {
    flex: 1,
    marginLeft: 10,
    fontFamily: "Poppins_600SemiBold",
    color: "#B3261E",
    fontSize: 12,
  },
  disabledButton: {
    opacity: 0.55,
  },
  footerText: {
    maxWidth: 305,
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