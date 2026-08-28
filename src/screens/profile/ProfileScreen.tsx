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

const FOREST = "#0B6035";
const DEEP_FOREST = "#073E23";
const EMERALD = "#168047";
const CREAM = "#FFFDF7";
const LIGHT_GREEN = "#E8F6EB";
const LIGHT_GOLD = "#FFF0D4";
const LIGHT_BLUE = "#EAF0FF";
const BLUE = "#426AC7";
const GOLD = "#B56B0D";
const RED = "#B3261E";
const LIGHT_RED = "#FFF1F0";

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
  const initials = getInitials(displayName);

  const profilePhotoUri =
    localPhotoUri || user?.photoURL || null;

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
          "Allow photo access to choose a profile picture."
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
              insets.bottom + 28,
              36
            ),
          },
        ]}
        showsVerticalScrollIndicator={false}
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
                  size={19}
                  color="#FFFFFF"
                />
              </Pressable>

              <View style={styles.headerLine} />

              <View style={styles.headerLeaf}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={16}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.headerCopy}>
              <Text style={styles.headerEyebrow}>
                MY ACCOUNT
              </Text>

              <Text style={styles.headerTitle}>
                Profile
              </Text>

              <Text style={styles.headerSubtitle}>
                Manage your profile and account preferences.
              </Text>
            </View>

            <View style={styles.headerDecorOne}>
              <MaterialCommunityIcons
                name="leaf"
                size={32}
                color="rgba(255,255,255,0.14)"
              />
            </View>

            <View style={styles.headerDecorTwo}>
              <MaterialCommunityIcons
                name="sprout"
                size={21}
                color="rgba(255,255,255,0.13)"
              />
            </View>

            <View style={styles.headerDecorThree}>
              <MaterialCommunityIcons
                name="recycle"
                size={15}
                color="rgba(255,255,255,0.12)"
              />
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
                    color="#FFFFFF"
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
                  size={18}
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
            style={styles.journeyButton}
            onPress={() => navigation.navigate("Camera")}
            accessibilityRole="button"
            accessibilityLabel="Scan your next item"
          >
            <View style={styles.journeyIcon}>
              <MaterialCommunityIcons
                name="camera-plus-outline"
                size={21}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.journeyCopy}>
              <Text style={styles.journeyTitle}>
                Scan your next item
              </Text>

              <Text style={styles.journeySubtitle}>
                Get clear disposal guidance in seconds.
              </Text>
            </View>

            <View style={styles.journeyArrow}>
              <MaterialCommunityIcons
                name="arrow-right"
                size={17}
                color={FOREST}
              />
            </View>
          </Pressable>

          <View style={styles.miniActionRow}>
            <MiniAction
              icon="history"
              title="History"
              subtitle="Saved scans"
              color={FOREST}
              background={LIGHT_GREEN}
              onPress={() => navigation.navigate("History")}
            />

            <MiniAction
              icon="sprout"
              title="Impact"
              subtitle="Your habits"
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
                  "Notification settings will be available here."
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
        Your profile is waiting
      </Text>

      <Text style={styles.emptyText}>
        Sign in to access saved scans and account preferences.
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

function MiniAction({
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
      style={styles.miniAction}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        style={[
          styles.miniActionIcon,
          {
            backgroundColor: background,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color={color}
        />
      </View>

      <View style={styles.miniActionCopy}>
        <Text style={styles.miniActionTitle}>
          {title}
        </Text>

        <Text style={styles.miniActionSubtitle}>
          {subtitle}
        </Text>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={18}
        color={colors.muted}
      />
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

        <Text style={styles.settingsValue}>
          {subtitle}
        </Text>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={19}
        color={colors.muted}
      />
    </Pressable>
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
    minHeight: 206,
    overflow: "hidden",
  },
  headerInner: {
    position: "relative",
    width: "100%",
    alignSelf: "center",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },
  headerLine: {
    flex: 1,
    height: 1,
    marginHorizontal: 13,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  headerLeaf: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },
  headerCopy: {
    maxWidth: 330,
    marginTop: 22,
  },
  headerEyebrow: {
    fontFamily: "Poppins_600SemiBold",
    color: "rgba(255,255,255,0.74)",
    fontSize: 9,
    letterSpacing: 1.3,
  },
  headerTitle: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 31,
    lineHeight: 38,
    letterSpacing: -0.7,
    marginTop: 4,
  },
  headerSubtitle: {
    maxWidth: 290,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.83)",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },
  headerDecorOne: {
    position: "absolute",
    top: 76,
    right: 23,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  headerDecorTwo: {
    position: "absolute",
    right: 79,
    bottom: 25,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerDecorThree: {
    position: "absolute",
    right: 25,
    bottom: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  content: {
    width: "100%",
    alignSelf: "center",
    marginTop: -25,
  },
  profileCardShadow: {
    borderRadius: 22,
    shadowColor: "#123B22",
    shadowOpacity: 0.13,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 6,
  },
  profileCard: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1EDE3",
  },
  avatarArea: {
    position: "relative",
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },
  avatarText: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 18,
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -1,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GOLD,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  profileName: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 15,
  },
  profileEmail: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  sectionHeader: {
    marginTop: 22,
    marginBottom: 9,
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
    fontSize: 16,
    marginTop: 2,
  },
  journeyButton: {
    minHeight: 75,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 38,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#CBE6D2",
  },
  journeyIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },
  journeyCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  journeyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 12,
  },
  journeySubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    marginTop: 2,
  },
  journeyArrow: {
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: "#FFFFFF",
  },

  miniActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  miniAction: {
    flex: 1,
    minHeight: 73,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EEE6",
  },
  miniActionIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  miniActionCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
  },
  miniActionTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 10,
  },
  miniActionSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 8,
    marginTop: 1,
  },

  settingsCard: {
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EEE6",
  },
  settingsRow: {
    minHeight: 60,
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
    color: colors.muted,
    fontSize: 9,
  },
  settingsValue: {
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
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 31,
    backgroundColor: LIGHT_RED,
    borderWidth: 1,
    borderColor: "#F0C9C6",
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
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
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
    color: "#95615D",
    fontSize: 9,
    marginTop: 2,
  },
  signOutArrow: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
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
    backgroundColor: CREAM,
  },
  emptyLogoRing: {
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
    backgroundColor: FOREST,
  },
  emptyButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 12,
  },
});