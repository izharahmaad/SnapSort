import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Text } from "react-native-paper";
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
  const user = useAuthStore((state) => state.user);

  const [isSigningOut, setIsSigningOut] =
    useState(false);

  const displayName =
    user?.displayName?.trim() || "SnapSort user";

  const email = user?.email || "No email available";

  const initials = getInitials(displayName);

  const memberLabel = useMemo(() => {
    if (!user) {
      return "SnapSort member";
    }

    return "Active SnapSort member";
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
            } catch (error: unknown) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Could not sign out.";

              Alert.alert(
                "Sign out failed",
                message
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
        <View style={styles.emptyIcon}>
          <MaterialCommunityIcons
            name="account-lock-outline"
            size={42}
            color={colors.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>
          You are not signed in
        </Text>

        <Text style={styles.emptyText}>
          Sign in to view your profile and saved scans.
        </Text>

        <Button
          mode="contained"
          icon="login"
          onPress={() => navigation.navigate("Login")}
        >
          Sign in
        </Button>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: Math.max(insets.top, 12),
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom: insets.bottom + 28,
          },
        ]}
        showsVerticalScrollIndicator={false}
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
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.topBarTitle}>
            <Text style={styles.topTitle}>
              Profile
            </Text>

            <Text style={styles.topSubtitle}>
              Your SnapSort account
            </Text>
          </View>

          <View style={styles.topIcon}>
            <MaterialCommunityIcons
              name="account-outline"
              size={21}
              color={colors.primary}
            />
          </View>
        </View>

        <View style={styles.profileHero}>
          <View style={styles.heroOrbOne} />
          <View style={styles.heroOrbTwo} />

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {initials}
            </Text>

            <View style={styles.statusDot}>
              <MaterialCommunityIcons
                name="check"
                size={10}
                color="#FFFFFF"
              />
            </View>
          </View>

          <Text style={styles.profileName}>
            {displayName}
          </Text>

          <Text style={styles.profileEmail}>
            {email}
          </Text>

          <View style={styles.memberPill}>
            <MaterialCommunityIcons
              name="leaf"
              size={14}
              color={colors.primary}
            />

            <Text style={styles.memberText}>
              {memberLabel}
            </Text>
          </View>
        </View>

        <View style={styles.quickRow}>
          <QuickStat
            icon="camera-outline"
            value="Scan"
            label="New item"
            onPress={() =>
              navigation.navigate("Camera")
            }
          />

          <QuickStat
            icon="history"
            value="History"
            label="Saved results"
            onPress={() =>
              navigation.navigate("History")
            }
          />

          <QuickStat
            icon="shield-check-outline"
            value="Secure"
            label="Account"
            onPress={() => undefined}
          />
        </View>

        <Text style={styles.sectionLabel}>
          YOUR SNAP SORT
        </Text>

        <View style={styles.actionCard}>
          <ProfileAction
            icon="history"
            title="Scan history"
            description="Review your saved sustainability decisions."
            onPress={() =>
              navigation.navigate("History")
            }
          />

          <View style={styles.divider} />

          <ProfileAction
            icon="camera-outline"
            title="Scan something new"
            description="Identify an item and get disposal guidance."
            onPress={() =>
              navigation.navigate("Camera")
            }
          />

          <View style={styles.divider} />

          <ProfileAction
            icon="chart-line"
            title="Your sustainability journey"
            description="Keep building better disposal habits."
            onPress={() =>
              navigation.navigate("History")
            }
          />
        </View>

        <Text style={styles.sectionLabel}>
          ACCOUNT DETAILS
        </Text>

        <View style={styles.infoCard}>
          <InfoRow
            icon="email-outline"
            label="Email address"
            value={email}
          />

          <View style={styles.divider} />

          <InfoRow
            icon="shield-check-outline"
            label="Account status"
            value="Active and protected"
          />

          <View style={styles.divider} />

          <InfoRow
            icon="cloud-check-outline"
            label="Data sync"
            value="Connected to Firebase"
          />
        </View>

        <View style={styles.impactCard}>
          <View style={styles.impactIcon}>
            <MaterialCommunityIcons
              name="sprout"
              size={23}
              color={colors.primary}
            />
          </View>

          <View style={styles.impactCopy}>
            <Text style={styles.impactTitle}>
              Keep making an impact
            </Text>

            <Text style={styles.impactText}>
              Every thoughtful disposal decision helps reduce
              unnecessary waste.
            </Text>
          </View>

          <MaterialCommunityIcons
            name="arrow-top-right"
            size={18}
            color={colors.primary}
          />
        </View>

        <Button
          mode="outlined"
          icon={isSigningOut ? undefined : "logout"}
          textColor="#B3261E"
          disabled={isSigningOut}
          loading={isSigningOut}
          onPress={handleSignOut}
          contentStyle={styles.signOutButton}
          labelStyle={styles.signOutLabel}
          style={styles.signOutWrapper}
        >
          {isSigningOut
            ? "Signing out..."
            : "Sign out"}
        </Button>

        <Text style={styles.disclaimer}>
          SnapSort provides general guidance only. Local
          disposal rules may vary.
        </Text>
      </ScrollView>
    </View>
  );
}

function getInitials(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "S";
  }

  return parts
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
}

function QuickStat({
  icon,
  value,
  label,
  onPress,
}: {
  icon: IconName;
  value: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.quickStat}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value}
    >
      <View style={styles.quickStatIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={colors.primary}
        />
      </View>

      <Text style={styles.quickStatValue}>
        {value}
      </Text>

      <Text style={styles.quickStatLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

function ProfileAction({
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
      style={styles.actionRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.actionIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={colors.primary}
        />
      </View>

      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>
          {title}
        </Text>

        <Text style={styles.actionDescription}>
          {description}
        </Text>
      </View>

      <View style={styles.actionArrow}>
        <MaterialCommunityIcons
          name="chevron-right"
          size={19}
          color={colors.muted}
        />
      </View>
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
      <View style={styles.infoIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={colors.primary}
        />
      </View>

      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
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
  container: {
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  topBarTitle: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10,
  },
  topTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 23,
  },
  topSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    marginTop: 1,
  },
  topIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  profileHero: {
    position: "relative",
    alignItems: "center",
    overflow: "hidden",
    paddingVertical: 25,
    paddingHorizontal: 18,
    borderRadius: 25,
    backgroundColor: colors.primary,
  },
  heroOrbOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -92,
    right: -62,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  heroOrbTwo: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    left: -46,
    bottom: -55,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  avatar: {
    position: "relative",
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 11,
  },
  avatarText: {
    fontFamily: "Poppins_700Bold",
    color: colors.primary,
    fontSize: 27,
  },
  statusDot: {
    position: "absolute",
    right: -1,
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
    fontSize: 22,
  },
  profileEmail: {
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.78)",
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
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  memberText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 10,
  },
  quickRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 13,
  },
  quickStat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  quickStatValue: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 11,
    marginTop: 5,
  },
  quickStatLabel: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 8,
    marginTop: 1,
  },
  sectionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1.4,
    marginTop: 22,
    marginBottom: 9,
    marginLeft: 3,
  },
  actionCard: {
    padding: 14,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 58,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  actionCopy: {
    flex: 1,
    marginLeft: 10,
  },
  actionTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 13,
  },
  actionDescription: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },
  actionArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F5F2",
  },
  divider: {
    height: 1,
    marginVertical: 5,
    backgroundColor: colors.border,
  },
  infoCard: {
    padding: 14,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 51,
  },
  infoIcon: {
    width: 37,
    height: 37,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  infoCopy: {
    flex: 1,
    marginLeft: 10,
  },
  infoLabel: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
  },
  infoValue: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 12,
    marginTop: 2,
  },
  impactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 17,
    padding: 13,
    borderRadius: 18,
    backgroundColor: "#FFF5DD",
    borderWidth: 1,
    borderColor: "#F0D9A3",
  },
  impactIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE5AF",
  },
  impactCopy: {
    flex: 1,
  },
  impactTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#493817",
    fontSize: 13,
  },
  impactText: {
    fontFamily: "Poppins_400Regular",
    color: "#765D2C",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 2,
  },
  signOutWrapper: {
    marginTop: 19,
    borderColor: "#E6B9B5",
    borderRadius: 14,
  },
  signOutButton: {
    height: 50,
  },
  signOutLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
  },
  disclaimer: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 14,
  },
  emptyScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.background,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    marginBottom: 5,
  },
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 19,
    textAlign: "center",
  },
  emptyText: {
    maxWidth: 290,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 5,
  },
});