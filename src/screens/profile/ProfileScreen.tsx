import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Card, Divider, Text } from "react-native-paper";
import { signOut } from "firebase/auth";

import { colors } from "../../constants/theme";
import { auth } from "../../services/firebase/firebase";
import { useAuthStore } from "../../stores/auth.store";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Profile"
>;

export default function ProfileScreen({
  navigation,
}: Props) {
  const user = useAuthStore((state) => state.user);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName =
    user?.displayName?.trim() || "SnapSort user";

  const email = user?.email || "No email available";

  const initials = getInitials(displayName);

  const handleSignOut = () => {
    if (isSigningOut) return;

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
      <View style={styles.emptyContainer}>
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
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroGlow} />

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials}
          </Text>

          <View style={styles.onlineDot}>
            <MaterialCommunityIcons
              name="check"
              size={10}
              color="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.heroName}>
          {displayName}
        </Text>

        <Text style={styles.heroEmail}>
          {email}
        </Text>

        <View style={styles.memberPill}>
          <MaterialCommunityIcons
            name="leaf"
            size={15}
            color={colors.primary}
          />

          <Text style={styles.memberText}>
            SnapSort member
          </Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>
        YOUR SNAP SORT
      </Text>

      <Card style={styles.actionCard}>
        <Card.Content>
          <ProfileAction
            icon="history"
            title="Scan history"
            description="Review your saved sustainability decisions."
            onPress={() => navigation.navigate("History")}
          />

          <Divider style={styles.divider} />

          <ProfileAction
            icon="camera-outline"
            title="Scan something new"
            description="Identify an item and get disposal guidance."
            onPress={() => navigation.navigate("Camera")}
          />
        </Card.Content>
      </Card>

      <Text style={styles.sectionLabel}>
        ACCOUNT
      </Text>

      <Card style={styles.infoCard}>
        <Card.Content>
          <InfoRow
            icon="email-outline"
            label="Email address"
            value={email}
          />

          <Divider style={styles.divider} />

          <InfoRow
            icon="shield-check-outline"
            label="Account status"
            value="Active and protected"
          />
        </Card.Content>
      </Card>

      <View style={styles.impactCard}>
        <View style={styles.impactIcon}>
          <MaterialCommunityIcons
            name="sprout-outline"
            size={25}
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
        {isSigningOut ? "Signing out..." : "Sign out"}
      </Button>

      <Text style={styles.disclaimer}>
        SnapSort provides general guidance only. Local
        disposal rules may vary.
      </Text>
    </ScrollView>
  );
}

function getInitials(name: string): string {
  const parts = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "S";
  }

  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function ProfileAction({
  icon,
  title,
  description,
  onPress,
}: {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Button
      mode="text"
      onPress={onPress}
      contentStyle={styles.actionButton}
      labelStyle={styles.actionButtonLabel}
    >
      <View style={styles.actionContent}>
        <View style={styles.actionIcon}>
          <MaterialCommunityIcons
            name={icon as any}
            size={21}
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

        <MaterialCommunityIcons
          name="chevron-right"
          size={23}
          color={colors.muted}
        />
      </View>
    </Button>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <MaterialCommunityIcons
          name={icon as any}
          size={19}
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
  container: {
    padding: 20,
    paddingBottom: 34,
    backgroundColor: colors.background,
  },
  heroCard: {
    position: "relative",
    alignItems: "center",
    overflow: "hidden",
    paddingVertical: 28,
    paddingHorizontal: 18,
    borderRadius: 27,
    backgroundColor: colors.primary,
    elevation: 5,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },
  },
  heroGlow: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    top: -120,
    right: -70,
    backgroundColor: "rgba(255,255,255,0.13)",
  },
  avatar: {
    position: "relative",
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 13,
  },
  avatarText: {
    fontFamily: "Poppins_700Bold",
    color: colors.primary,
    fontSize: 28,
  },
  onlineDot: {
    position: "absolute",
    right: -1,
    bottom: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E39B3B",
    borderWidth: 3,
    borderColor: colors.primary,
  },
  heroName: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 23,
  },
  heroEmail: {
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    marginTop: 2,
  },
  memberPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.88)",
  },
  memberText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 10,
  },
  sectionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 10,
    letterSpacing: 1.1,
    marginTop: 23,
    marginBottom: 9,
    marginLeft: 3,
  },
  actionCard: {
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButton: {
    minHeight: 65,
    paddingHorizontal: 0,
  },
  actionButtonLabel: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 10,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  actionCopy: {
    flex: 1,
    alignItems: "flex-start",
  },
  actionTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 14,
  },
  actionDescription: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },
  divider: {
    marginVertical: 4,
    backgroundColor: colors.border,
  },
  infoCard: {
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 7,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  infoCopy: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
  },
  infoValue: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 13,
    marginTop: 2,
  },
  impactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginTop: 18,
    padding: 14,
    borderRadius: 19,
    backgroundColor: "#F0FAF2",
    borderWidth: 1,
    borderColor: "#D5EED9",
  },
  impactIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  impactCopy: {
    flex: 1,
  },
  impactTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 13,
  },
  impactText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 2,
  },
  signOutWrapper: {
    marginTop: 20,
    borderColor: "#E6B9B5",
    borderRadius: 13,
  },
  signOutButton: {
    height: 52,
  },
  signOutLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  disclaimer: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 16,
    marginTop: 16,
  },
  emptyContainer: {
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
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 5,
  },
});