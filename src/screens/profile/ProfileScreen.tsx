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
  const horizontalPadding = isTablet ? 36 : 20;
  const contentMaxWidth = isTablet ? 680 : undefined;

  const displayName =
    user?.displayName?.trim() || "SnapSort user";

  const email = user?.email || "No email available";
  const initials = getInitials(displayName);

  const memberLabel = useMemo(() => {
    if (!user) {
      return "SnapSort member";
    }

    return "Active member";
  }, [user]);

  const handleSignOut = () => {
    if (isSigningOut) {
      return;
    }

    Alert.alert(
      "Sign out?",
      "You can sign in again anytime to access your scan history.",
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
      <View style={styles.emptyScreen}>
        <View style={styles.emptyLogoRing}>
          <View style={styles.emptyLogo}>
            <MaterialCommunityIcons
              name="leaf"
              size={31}
              color="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.emptyTitle}>
          You are not signed in
        </Text>

        <Text style={styles.emptyText}>
          Sign in to view your profile and saved scans.
        </Text>

        <Pressable
          style={styles.emptySignInButton}
          onPress={() => navigation.navigate("Login")}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          <Text style={styles.emptySignInText}>
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
              insets.bottom + 26,
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
              maxWidth: contentMaxWidth,
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
                size={20}
                color={colors.primary}
              />
            </Pressable>

            <View style={styles.topTitleArea}>
              <Text style={styles.topTitle}>
                Profile
              </Text>

              <Text style={styles.topSubtitle}>
                Your SnapSort account
              </Text>
            </View>

            <View style={styles.profileTopIcon}>
              <MaterialCommunityIcons
                name="account-outline"
                size={20}
                color={colors.primary}
              />
            </View>
          </View>

          <View style={styles.profileShadow}>
            <View style={styles.profileCard}>
              <View style={styles.profileAccentTop} />

              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {initials}
                  </Text>
                </View>

                <View style={styles.statusIcon}>
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
                  {memberLabel}
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
              label="Progress"
              onPress={() => navigation.navigate("History")}
            />
          </View>

          <Text style={styles.sectionTitle}>
            YOUR ACTIVITY
          </Text>

          <View style={styles.cardShadow}>
            <View style={styles.listCard}>
              <ProfileRow
                icon="camera-outline"
                title="Scan something new"
                subtitle="Identify an item and get guidance"
                onPress={() => navigation.navigate("Camera")}
              />

              <View style={styles.divider} />

              <ProfileRow
                icon="history"
                title="Scan history"
                subtitle="View your saved results"
                onPress={() => navigation.navigate("History")}
              />

              <View style={styles.divider} />

              <ProfileRow
                icon="chart-line"
                title="Your sustainability journey"
                subtitle="Review your progress and habits"
                onPress={() => navigation.navigate("History")}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            ACCOUNT
          </Text>

          <View style={styles.cardShadow}>
            <View style={styles.listCard}>
              <InfoRow
                icon="email-outline"
                label="Email address"
                value={email}
              />

              <View style={styles.divider} />

              <InfoRow
                icon="shield-check-outline"
                label="Account status"
                value="Active"
              />

              <View style={styles.divider} />

              <InfoRow
                icon="cloud-check-outline"
                label="Data sync"
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
            <MaterialCommunityIcons
              name="logout"
              size={18}
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

      <Text style={styles.quickActionLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

function ProfileRow({
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
      style={styles.profileRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color={colors.primary}
        />
      </View>

      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>
          {title}
        </Text>

        <Text style={styles.rowSubtitle}>
          {subtitle}
        </Text>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={colors.muted}
      />
    </Pressable>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={colors.primary}
        />
      </View>

      <View style={styles.rowCopy}>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
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
  topTitleArea: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10,
  },
  topTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 22,
  },
  topSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    marginTop: 1,
  },
  profileTopIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  profileShadow: {
    borderRadius: 25,
    shadowColor: "#173B25",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 5,
  },
  profileCard: {
    position: "relative",
    alignItems: "center",
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
    borderRadius: 25,
    backgroundColor: colors.primary,
  },
  profileAccentTop: {
    position: "absolute",
    width: 260,
    height: 110,
    borderRadius: 80,
    top: -62,
    backgroundColor: "rgba(255,255,255,0.11)",
  },
  avatarRing: {
    position: "relative",
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 11,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  avatarText: {
    fontFamily: "Poppins_700Bold",
    color: colors.primary,
    fontSize: 25,
  },
  statusIcon: {
    position: "absolute",
    right: 0,
    bottom: 1,
    width: 23,
    height: 23,
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
    marginTop: 12,
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
  quickActionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1.4,
    marginTop: 23,
    marginBottom: 9,
    marginLeft: 3,
  },
  cardShadow: {
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
  listCard: {
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileRow: {
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
  },
  rowIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  rowTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 12,
  },
  rowSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 49,
    backgroundColor: colors.border,
  },
  infoRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    gap: 7,
    height: 46,
    minWidth: 150,
    paddingHorizontal: 18,
    marginTop: 22,
    borderRadius: 23,
    backgroundColor: "#FFF1F0",
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
  emptySignInButton: {
    height: 48,
    minWidth: 145,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 17,
    marginTop: 20,
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  emptySignInText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 12,
  },
});