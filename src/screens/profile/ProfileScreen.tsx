import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "react-native-paper";
import { signOut, updateProfile } from "firebase/auth";
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

const FOREST = "#0D6035";
const DEEP_FOREST = "#083F24";
const MINT = "#E5F5E9";
const CREAM = "#FFFDF7";
const SUN = "#DF9A32";
const SUN_LIGHT = "#FFF1D5";
const BLUE = "#3D67C7";
const BLUE_LIGHT = "#EAF0FF";
const DANGER = "#B3261E";
const DANGER_LIGHT = "#FFF1F0";

export default function ProfileScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const user = useAuthStore((state) => state.user);

  const [isSigningOut, setIsSigningOut] =
    useState(false);
  const [isPickingImage, setIsPickingImage] =
    useState(false);
  const [localPhotoUri, setLocalPhotoUri] = useState<
    string | null
  >(null);

  const isTablet = width >= 700;
  const horizontalPadding = isTablet ? 38 : 20;
  const contentMaxWidth = isTablet ? 760 : undefined;

  const displayName =
    user?.displayName?.trim() || "SnapSort user";

  const email = user?.email || "No email available";
  const initials = getInitials(displayName);

  const profilePhotoUri =
    localPhotoUri || user?.photoURL || null;

  const handlePickProfileImage = async () => {
    if (isPickingImage || !auth.currentUser) {
      return;
    }

    try {
      setIsPickingImage(true);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo permission needed",
          "Allow photo library access to choose a profile picture."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const selectedUri = result.assets[0].uri;

      setLocalPhotoUri(selectedUri);

      /*
       * This preview works immediately.
       * For permanent cross-device saving:
       * 1. Upload selectedUri to Firebase Storage.
       * 2. Get the download URL.
       * 3. Call updateProfile(auth.currentUser, {
       *      photoURL: downloadUrl,
       *    });
       */
      await updateProfile(auth.currentUser, {
        photoURL: selectedUri,
      });
    } catch {
      Alert.alert(
        "Photo update failed",
        "We could not update your profile picture. Please try again."
      );
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleSignOut = () => {
    if (isSigningOut) {
      return;
    }

    Alert.alert(
      "Sign out of SnapSort AI?",
      "Your saved scans will remain linked to your account. You can sign in again anytime.",
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
          colors={[DEEP_FOREST, FOREST, "#197847"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.header,
            {
              paddingTop: Math.max(
                insets.top + 13,
                23
              ),
            },
          ]}
        >
          <View
            style={[
              styles.headerInner,
              {
                maxWidth: contentMaxWidth,
                paddingHorizontal: horizontalPadding,
              },
            ]}
          >
            <View style={styles.headerTop}>
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

              <View style={styles.headerBrand}>
                <View style={styles.headerBrandIcon}>
                  <MaterialCommunityIcons
                    name="leaf"
                    size={14}
                    color={FOREST}
                  />
                </View>

                <Text style={styles.headerBrandText}>
                  SnapSort AI
                </Text>
              </View>

              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.headerCopy}>
              <Text style={styles.headerEyebrow}>
                MY ACCOUNT
              </Text>

              <Text style={styles.headerTitle}>
                Profile
              </Text>

              <Text style={styles.headerSubtitle}>
                Your choices, your impact, all in one place.
              </Text>
            </View>

            <View style={styles.headerEcoIcons}>
              <EcoIcon icon="leaf" />
              <EcoIcon icon="recycle" />
              <EcoIcon icon="sprout" />
              <EcoIcon icon="flower-outline" />
              <EcoIcon icon="earth" />
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
              <View style={styles.profileImageArea}>
                <Pressable
                  style={styles.avatarOuter}
                  onPress={handlePickProfileImage}
                  disabled={isPickingImage}
                  accessibilityRole="button"
                  accessibilityLabel="Choose profile photo"
                >
                  {profilePhotoUri ? (
                    <Image
                      source={{
                        uri: profilePhotoUri,
                      }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarText}>
                        {initials}
                      </Text>
                    </View>
                  )}

                  <View style={styles.cameraBadge}>
                    <MaterialCommunityIcons
                      name={
                        isPickingImage
                          ? "loading"
                          : "camera"
                      }
                      size={13}
                      color="#FFFFFF"
                    />
                  </View>
                </Pressable>
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
                    size={11}
                    color={FOREST}
                  />

                  <Text style={styles.memberText}>
                    SnapSort member
                  </Text>
                </View>
              </View>

              <View style={styles.profileStatus}>
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={19}
                  color={FOREST}
                />
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatCard
              icon="camera-outline"
              label="New scan"
              color={FOREST}
              background={MINT}
              onPress={() => navigation.navigate("Camera")}
            />

            <StatCard
              icon="history"
              label="History"
              color={BLUE}
              background={BLUE_LIGHT}
              onPress={() => navigation.navigate("History")}
            />

            <StatCard
              icon="sprout"
              label="Impact"
              color="#B96E0C"
              background={SUN_LIGHT}
              onPress={() => navigation.navigate("History")}
            />
          </View>

          <SectionHeader
            label="YOUR JOURNEY"
            title="Continue your journey"
            compact
          />

          <Pressable
            style={styles.scanCard}
            onPress={() => navigation.navigate("Camera")}
            accessibilityRole="button"
            accessibilityLabel="Start a new scan"
          >
            <View style={styles.scanIcon}>
              <MaterialCommunityIcons
                name="camera-plus-outline"
                size={22}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.scanCopy}>
              <Text style={styles.scanTitle}>
                Scan your next item
              </Text>

              <Text style={styles.scanText}>
                Get clear disposal guidance in seconds.
              </Text>
            </View>

            <View style={styles.scanArrow}>
              <MaterialCommunityIcons
                name="arrow-right"
                size={18}
                color={FOREST}
              />
            </View>
          </Pressable>

          <View style={styles.actionGrid}>
            <DashboardCard
              icon="history"
              title="Scan history"
              text="Review saved results"
              accent={MINT}
              color={FOREST}
              onPress={() => navigation.navigate("History")}
            />

            <DashboardCard
              icon="chart-timeline-variant-shimmer"
              title="Your impact"
              text="Build greener habits"
              accent={SUN_LIGHT}
              color="#B96E0C"
              onPress={() => navigation.navigate("History")}
            />
          </View>

          <SectionHeader
            label="SETTINGS"
            title="Account details"
          />

          <View style={styles.settingsCard}>
            <AccountRow
              icon="email-outline"
              title="Email address"
              value={email}
            />

            <Divider />

            <AccountRow
              icon="shield-check-outline"
              title="Account status"
              value="Active and protected"
            />

            <Divider />

            <AccountRow
              icon="cloud-check-outline"
              title="Cloud sync"
              value="Firebase connected"
            />

            <Divider />

            <Pressable
              style={styles.settingActionRow}
              onPress={() =>
                Alert.alert(
                  "Notifications",
                  "Notification settings will be available here."
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Notification settings"
            >
              <View style={styles.accountIcon}>
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={19}
                  color={FOREST}
                />
              </View>

              <View style={styles.accountCopy}>
                <Text style={styles.accountTitle}>
                  Notifications
                </Text>

                <Text style={styles.accountValue}>
                  Manage scan reminders
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={19}
                color={colors.muted}
              />
            </Pressable>

            <Divider />

            <Pressable
              style={styles.settingActionRow}
              onPress={() =>
                Alert.alert(
                  "Privacy",
                  "Privacy settings will be available here."
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Privacy settings"
            >
              <View style={styles.accountIcon}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={19}
                  color={FOREST}
                />
              </View>

              <View style={styles.accountCopy}>
                <Text style={styles.accountTitle}>
                  Privacy and security
                </Text>

                <Text style={styles.accountValue}>
                  Manage your data preferences
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={19}
                color={colors.muted}
              />
            </Pressable>

            <Divider />

            <Pressable
              style={styles.settingActionRow}
              onPress={() =>
                Alert.alert(
                  "About SnapSort AI",
                  "SnapSort AI helps you make better everyday disposal decisions. Version 1.0.0"
                )
              }
              accessibilityRole="button"
              accessibilityLabel="About SnapSort AI"
            >
              <View style={styles.accountIcon}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={19}
                  color={FOREST}
                />
              </View>

              <View style={styles.accountCopy}>
                <Text style={styles.accountTitle}>
                  About SnapSort AI
                </Text>

                <Text style={styles.accountValue}>
                  Version 1.0.0
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={19}
                color={colors.muted}
              />
            </Pressable>
          </View>

          <View style={styles.signOutSection}>
            <Text style={styles.signOutLabel}>
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
            size={30}
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

function EcoIcon({
  icon,
}: {
  icon: IconName;
}) {
  return (
    <View style={styles.ecoIcon}>
      <MaterialCommunityIcons
        name={icon}
        size={17}
        color="rgba(255,255,255,0.72)"
      />
    </View>
  );
}

function StatCard({
  icon,
  label,
  color,
  background,
  onPress,
}: {
  icon: IconName;
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
      accessibilityLabel={label}
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

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionHeader({
  label,
  title,
  compact = false,
}: {
  label: string;
  title: string;
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.sectionHeader,
        compact && styles.compactSectionHeader,
      ]}
    >
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
  color,
  onPress,
}: {
  icon: IconName;
  title: string;
  text: string;
  accent: string;
  color: string;
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
          color={color}
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
          color={color}
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
    backgroundColor: CREAM,
  },
  scrollContent: {
    flexGrow: 1,
  },

  header: {
    minHeight: 230,
    overflow: "hidden",
  },
  headerInner: {
    width: "100%",
    alignSelf: "center",
  },
  headerTop: {
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
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  headerBrandIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  headerBrandText: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 13,
  },
  headerSpacer: {
    width: 42,
    height: 42,
  },
  headerCopy: {
    marginTop: 27,
    maxWidth: 360,
  },
  headerEyebrow: {
    fontFamily: "Poppins_600SemiBold",
    color: "rgba(255,255,255,0.74)",
    fontSize: 9,
    letterSpacing: 1.4,
  },
  headerTitle: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 31,
    letterSpacing: -0.7,
    marginTop: 3,
  },
  headerSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.83)",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 4,
  },
  headerEcoIcons: {
    position: "absolute",
    right: 0,
    bottom: -14,
    flexDirection: "row",
    gap: 7,
  },
  ecoIcon: {
    width: 37,
    height: 37,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.11)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  content: {
    width: "100%",
    alignSelf: "center",
    marginTop: -45,
  },
  profileCardShadow: {
    borderRadius: 23,
    shadowColor: "#0A3C22",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 7,
  },
  profileCard: {
    minHeight: 98,
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2EFE5",
  },
  profileImageArea: {
    width: 68,
    height: 68,
  },
  avatarOuter: {
    position: "relative",
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MINT,
  },
  avatarImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  avatarFallback: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },
  avatarText: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 20,
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -1,
    width: 24,
    height: 24,
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
    marginLeft: 11,
  },
  profileName: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 16,
  },
  profileEmail: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    marginTop: 2,
  },
  memberPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: MINT,
  },
  memberText: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
  },
  profileStatus: {
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MINT,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EEE6",
  },
  statIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 10,
    marginTop: 6,
  },

  sectionHeader: {
    marginTop: 25,
    marginBottom: 9,
    marginLeft: 2,
  },
  compactSectionHeader: {
    marginTop: 20,
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
    fontSize: 16,
    marginTop: 2,
  },

  scanCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 21,
    backgroundColor: "#EAF8ED",
    borderWidth: 1,
    borderColor: "#CFE9D5",
  },
  scanIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },
  scanCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  scanTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 12,
  },
  scanText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },
  scanArrow: {
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
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

  actionGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 11,
  },
  dashboardCard: {
    position: "relative",
    flex: 1,
    minHeight: 128,
    padding: 13,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EEE6",
  },
  dashboardIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dashboardTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 11,
    marginTop: 10,
  },
  dashboardText: {
    maxWidth: "82%",
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 8,
    lineHeight: 13,
    marginTop: 2,
  },
  dashboardArrow: {
    position: "absolute",
    right: 11,
    bottom: 11,
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F7F3",
  },

  settingsCard: {
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EEE6",
  },
  accountRow: {
    minHeight: 61,
    flexDirection: "row",
    alignItems: "center",
  },
  settingActionRow: {
    minHeight: 61,
    flexDirection: "row",
    alignItems: "center",
  },
  accountIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MINT,
  },
  accountCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  accountTitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
  },
  accountValue: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 10,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 49,
    backgroundColor: "#E7EEE8",
  },

  signOutSection: {
    marginTop: 25,
  },
  signOutLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1.3,
    marginBottom: 9,
    marginLeft: 3,
  },
  signOutButton: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    borderRadius: 32,
    backgroundColor: DANGER_LIGHT,
    borderWidth: 1,
    borderColor: "#F1CCC8",
    shadowColor: "#7A1D18",
    shadowOpacity: 0.08,
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
    width: 39,
    height: 39,
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