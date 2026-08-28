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

const FOREST = "#0A5D35";
const DEEP_FOREST = "#05341D";
const EMERALD = "#14804A";
const CREAM = "#FFFEFA";
const WHITE = "#FFFFFF";
const TEXT = "#17251C";
const MUTED = "#6E7C73";
const LIGHT_GREEN = "#EAF7ED";
const SOFT_GREEN = "#D7F0DF";
const LIGHT_GOLD = "#FFF3D9";
const GOLD = "#B87312";
const LIGHT_RED = "#FFF1F0";
const RED = "#B3261E";

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
  const contentMaxWidth = isTablet ? 660 : undefined;

  const displayName =
    user?.displayName?.trim() || "SnapSort user";

  const email = user?.email || "No email available";

  const profilePhotoUri =
    localPhotoUri || user?.photoURL || null;

  const initials = getInitials(displayName);

  const handleChoosePhoto = async () => {
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

      const photoUri = result.assets[0].uri;

      setLocalPhotoUri(photoUri);

      await updateProfile(auth.currentUser, {
        photoURL: photoUri,
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
      "Sign out?",
      "You can sign in again anytime to access your saved scans and profile.",
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
                "Could not sign out",
                "Please check your connection and try again."
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(
              insets.bottom + 28,
              38
            ),
          },
        ]}
      >
        <LinearGradient
          colors={[DEEP_FOREST, FOREST, EMERALD]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.header,
            {
              paddingTop: Math.max(
                insets.top + 10,
                20
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
            <View style={styles.headerTopRow}>
              <Pressable
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={20}
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

              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.headerContent}>
              <View style={styles.headerPill}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={13}
                  color="#D7F4DF"
                />

                <Text style={styles.headerPillText}>
                  MY ACCOUNT
                </Text>
              </View>

              <Text style={styles.headerTitle}>
                Your profile
              </Text>

              <Text style={styles.headerSubtitle}>
                Everything you need for your sustainable journey.
              </Text>
            </View>

            <View style={styles.headerArt}>
              <View style={styles.artCircleLarge}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={38}
                  color="rgba(255,255,255,0.16)"
                />
              </View>

              <View style={styles.artCircleSmall}>
                <MaterialCommunityIcons
                  name="sprout"
                  size={21}
                  color="rgba(255,255,255,0.16)"
                />
              </View>

              <View style={styles.artRecycle}>
                <MaterialCommunityIcons
                  name="recycle"
                  size={16}
                  color="rgba(255,255,255,0.15)"
                />
              </View>

              <View style={styles.artDotOne} />
              <View style={styles.artDotTwo} />
            </View>
          </View>

          <View style={styles.headerCurve} />
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
              <Pressable
                style={styles.avatarArea}
                onPress={handleChoosePhoto}
                disabled={isPickingImage}
                accessibilityRole="button"
                accessibilityLabel="Change profile picture"
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
                    size={12}
                    color={WHITE}
                  />
                </View>
              </Pressable>

              <View style={styles.profileInfo}>
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

              <View style={styles.verifiedCircle}>
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={19}
                  color={FOREST}
                />
              </View>
            </View>
          </View>

          <SectionHeader
            label="YOUR JOURNEY"
            title="Continue your journey"
          />

          <Pressable
            style={styles.scanButton}
            onPress={() => navigation.navigate("Camera")}
            accessibilityRole="button"
            accessibilityLabel="Scan your next item"
          >
            <View style={styles.scanButtonIcon}>
              <MaterialCommunityIcons
                name="camera-plus-outline"
                size={21}
                color={WHITE}
              />
            </View>

            <View style={styles.scanButtonCopy}>
              <Text style={styles.scanButtonTitle}>
                Scan your next item
              </Text>

              <Text style={styles.scanButtonSubtitle}>
                Get disposal guidance in seconds.
              </Text>
            </View>

            <View style={styles.scanButtonArrow}>
              <MaterialCommunityIcons
                name="arrow-right"
                size={17}
                color={FOREST}
              />
            </View>
          </Pressable>

          <View style={styles.quickActionRow}>
            <QuickAction
              icon="history"
              title="Scan history"
              subtitle="Review saved results"
              color={FOREST}
              background={LIGHT_GREEN}
              onPress={() => navigation.navigate("History")}
            />

            <QuickAction
              icon="chart-line"
              title="Your impact"
              subtitle="Build greener habits"
              color={GOLD}
              background={LIGHT_GOLD}
              onPress={() => navigation.navigate("History")}
            />
          </View>

          <SectionHeader
            label="SETTINGS"
            title="Account details"
          />

          <View style={styles.settingsCard}>
            <InfoRow
              icon="email-outline"
              title="Email address"
              value={email}
            />

            <Divider />

            <InfoRow
              icon="shield-check-outline"
              title="Account status"
              value="Active and protected"
            />

            <Divider />

            <InfoRow
              icon="cloud-check-outline"
              title="Cloud sync"
              value="Firebase connected"
            />

            <Divider />

            <SettingRow
              icon="bell-outline"
              title="Notifications"
              subtitle="Manage scan reminders"
              onPress={() =>
                Alert.alert(
                  "Notifications",
                  "Notification preferences will be available here."
                )
              }
            />

            <Divider />

            <SettingRow
              icon="lock-outline"
              title="Privacy and security"
              subtitle="Manage data preferences"
              onPress={() =>
                Alert.alert(
                  "Privacy and security",
                  "Privacy settings will be available here."
                )
              }
            />

            <Divider />

            <SettingRow
              icon="information-outline"
              title="About SnapSort AI"
              subtitle="Version 1.0.0"
              onPress={() =>
                Alert.alert(
                  "About SnapSort AI",
                  "SnapSort AI helps you make better everyday disposal decisions."
                )
              }
            />
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
              accessibilityLabel="Sign out"
            >
              <View style={styles.signOutIcon}>
                <MaterialCommunityIcons
                  name="logout"
                  size={18}
                  color={RED}
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
                  color={RED}
                />
              </View>
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

function QuickAction({
  icon,
  title,
  subtitle,
  color,
  background,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  color: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.quickAction}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        style={[
          styles.quickActionIcon,
          {
            backgroundColor: background,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={color}
        />
      </View>

      <Text
        style={styles.quickActionTitle}
        numberOfLines={1}
      >
        {title}
      </Text>

      <Text
        style={styles.quickActionSubtitle}
        numberOfLines={1}
      >
        {subtitle}
      </Text>

      <View style={styles.quickActionArrow}>
        <MaterialCommunityIcons
          name="arrow-top-right"
          size={14}
          color={color}
        />
      </View>
    </Pressable>
  );
}

function InfoRow({
  icon,
  title,
  value,
}: {
  icon: IconName;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.settingsRow}>
      <View style={styles.settingsIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={FOREST}
        />
      </View>

      <View style={styles.settingsCopy}>
        <Text style={styles.settingsTitle}>
          {title}
        </Text>

        <Text
          style={styles.settingsValue}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function SettingRow({
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
      style={styles.settingsRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.settingsIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={FOREST}
        />
      </View>

      <View style={styles.settingsCopy}>
        <Text style={styles.settingsTitle}>
          {title}
        </Text>

        <Text
          style={styles.settingsValue}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={19}
        color={MUTED}
      />
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
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
            color={WHITE}
          />
        </View>
      </View>

      <Text style={styles.emptyTitle}>
        Your profile is waiting
      </Text>

      <Text style={styles.emptyText}>
        Sign in to access saved scans, account preferences, and your sustainable journey.
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
          color={WHITE}
        />
      </Pressable>
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

  header: {
    minHeight: 232,
    overflow: "hidden",
  },

  headerInner: {
    position: "relative",
    width: "100%",
    alignSelf: "center",
    flex: 1,
  },

  headerTopRow: {
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
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  brandIcon: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  brandText: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 11,
    letterSpacing: -0.1,
  },

  headerSpacer: {
    width: 42,
    height: 42,
  },

  headerContent: {
    maxWidth: 275,
    marginTop: 29,
  },

  headerPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  headerPillText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#D7F4DF",
    fontSize: 8,
    letterSpacing: 1,
  },

  headerTitle: {
    fontFamily: "Poppins_700Bold",
    color: WHITE,
    fontSize: 31,
    lineHeight: 39,
    letterSpacing: -0.8,
    marginTop: 8,
  },

  headerSubtitle: {
    maxWidth: 255,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.82)",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 2,
  },

  headerArt: {
    position: "absolute",
    right: 2,
    bottom: 33,
    width: 125,
    height: 115,
  },

  artCircleLarge: {
    position: "absolute",
    right: 2,
    top: 3,
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    transform: [
      {
        rotate: "-14deg",
      },
    ],
  },

  artCircleSmall: {
    position: "absolute",
    left: 4,
    bottom: 5,
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  artRecycle: {
    position: "absolute",
    right: 3,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  artDotOne: {
    position: "absolute",
    top: 18,
    left: 28,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.26)",
  },

  artDotTwo: {
    position: "absolute",
    right: 47,
    bottom: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.28)",
  },

  headerCurve: {
    position: "absolute",
    left: -30,
    right: -30,
    bottom: -38,
    height: 75,
    borderRadius: 60,
    backgroundColor: CREAM,
  },

  content: {
    width: "100%",
    alignSelf: "center",
    marginTop: 14,
  },

  profileCardShadow: {
    borderRadius: 23,
    shadowColor: "#123B22",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 5,
  },

  profileCard: {
    minHeight: 91,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 23,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "#E0ECE2",
  },

  avatarArea: {
    position: "relative",
    width: 63,
    height: 63,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  avatarImage: {
    width: 57,
    height: 57,
    borderRadius: 29,
  },

  avatarFallback: {
    width: 57,
    height: 57,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },

  avatarText: {
    fontFamily: "Poppins_700Bold",
    color: WHITE,
    fontSize: 18,
  },

  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -1,
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GOLD,
    borderWidth: 3,
    borderColor: WHITE,
  },

  profileInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  profileName: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 15,
  },

  profileEmail: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: 1,
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
    backgroundColor: LIGHT_GREEN,
  },

  memberText: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
  },

  verifiedCircle: {
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 9,
    marginLeft: 2,
  },

  sectionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 9,
    letterSpacing: 1.25,
  },

  sectionTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 16,
    marginTop: 2,
  },

  scanButton: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 38,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#C8E6D0",
  },

  scanButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },

  scanButtonCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  scanButtonTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 12,
  },

  scanButtonSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: 2,
  },

  scanButtonArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: WHITE,
  },

  quickActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  quickAction: {
    position: "relative",
    flex: 1,
    minHeight: 124,
    padding: 12,
    borderRadius: 21,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "#E3ECE4",
  },

  quickActionIcon: {
    width: 37,
    height: 37,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  quickActionTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
    marginTop: 10,
  },

  quickActionSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 8,
    marginTop: 2,
  },

  quickActionArrow: {
    position: "absolute",
    right: 11,
    bottom: 11,
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F8F5",
  },

  settingsCard: {
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "#E3ECE4",
  },

  settingsRow: {
    minHeight: 61,
    flexDirection: "row",
    alignItems: "center",
  },

  settingsIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  settingsCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  settingsTitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
  },

  settingsValue: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
    marginTop: 2,
  },

  divider: {
    height: 1,
    marginLeft: 49,
    backgroundColor: "#E6EEE7",
  },

  signOutSection: {
    marginTop: 25,
  },

  signOutLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: MUTED,
    fontSize: 9,
    letterSpacing: 1.3,
    marginBottom: 9,
    marginLeft: 3,
  },

  signOutButton: {
    minHeight: 63,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 32,
    backgroundColor: LIGHT_RED,
    borderWidth: 1,
    borderColor: "#F0C9C6",
  },

  signOutPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  disabledButton: {
    opacity: 0.55,
  },

  signOutIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  signOutCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  signOutTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: RED,
    fontSize: 12,
  },

  signOutSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "#96635E",
    fontSize: 9,
    marginTop: 2,
  },

  signOutArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  footerText: {
    maxWidth: 310,
    alignSelf: "center",
    fontFamily: "Poppins_400Regular",
    color: MUTED,
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

  emptyLogoRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SOFT_GREEN,
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
    color: TEXT,
    fontSize: 21,
    textAlign: "center",
    marginTop: 19,
  },

  emptyText: {
    maxWidth: 290,
    fontFamily: "Poppins_400Regular",
    color: MUTED,
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
    color: WHITE,
    fontSize: 12,
  },
});