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

const WHITE = "#FFFFFF";
const CREAM = "#FFFEFA";
const FOREST = "#075C34";
const DEEP_FOREST = "#04331D";
const EMERALD = "#16824B";
const TEXT = "#17271D";
const MUTED = "#6D7B72";
const LIGHT_GREEN = "#EAF7EE";
const SOFT_GREEN = "#D9F1E0";
const GOLD = "#C98718";
const LIGHT_GOLD = "#FFF3DB";
const RED = "#B3261E";
const LIGHT_RED = "#FFF1F0";

export default function ProfileScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const user = useAuthStore((state) => state.user);

  const [isPickingImage, setIsPickingImage] =
    useState(false);

  const [isSigningOut, setIsSigningOut] =
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
          "Please allow photo library access to choose a profile picture."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
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
      "Your saved scans will remain connected to your account. You can sign in again anytime.",
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
                "Please check your internet connection and try again."
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
              insets.bottom + 30,
              40
            ),
          },
        ]}
      >
        <LinearGradient
          colors={[DEEP_FOREST, FOREST, EMERALD]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.hero,
            {
              paddingTop: Math.max(
                insets.top + 12,
                24
              ),
            },
          ]}
        >
          <View style={styles.heroGlowTop} />
          <View style={styles.heroGlowRight} />
          <View style={styles.heroGlowBottom} />

          <View
            style={[
              styles.heroInner,
              {
                maxWidth: contentMaxWidth,
                paddingHorizontal: horizontalPadding,
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
                  size={21}
                  color={WHITE}
                />
              </Pressable>

              <View style={styles.brand}>
                <View style={styles.brandMark}>
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

              <View style={styles.topBarSpacer} />
            </View>

            <View style={styles.profileHeroContent}>
              <View style={styles.profileLabel}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={13}
                  color="#D7F8E1"
                />

                <Text style={styles.profileLabelText}>
                  MY PROFILE
                </Text>
              </View>

              <Pressable
                style={styles.heroAvatarOuter}
                onPress={handleChoosePhoto}
                disabled={isPickingImage}
                accessibilityRole="button"
                accessibilityLabel="Change profile picture"
              >
                <View style={styles.heroAvatarGlow} />

                <View style={styles.heroAvatarRing}>
                  {profilePhotoUri ? (
                    <Image
                      source={{
                        uri: profilePhotoUri,
                      }}
                      style={styles.heroAvatarImage}
                    />
                  ) : (
                    <View style={styles.heroAvatarFallback}>
                      <Text style={styles.heroAvatarText}>
                        {initials}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.editAvatarBadge}>
                  <MaterialCommunityIcons
                    name={
                      isPickingImage
                        ? "loading"
                        : "camera"
                    }
                    size={14}
                    color={WHITE}
                  />
                </View>
              </Pressable>

              <Text
                style={styles.heroName}
                numberOfLines={1}
              >
                {displayName}
              </Text>

              <Text
                style={styles.heroEmail}
                numberOfLines={1}
              >
                {email}
              </Text>

              <View style={styles.memberBadge}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={12}
                  color="#D7F8E1"
                />

                <Text style={styles.memberBadgeText}>
                  SnapSort member
                </Text>
              </View>
            </View>

            <View style={styles.heroArt}>
              <View style={styles.artLargeLeaf}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={40}
                  color="rgba(255,255,255,0.16)"
                />
              </View>

              <View style={styles.artSprout}>
                <MaterialCommunityIcons
                  name="sprout"
                  size={22}
                  color="rgba(255,255,255,0.15)"
                />
              </View>

              <View style={styles.artRecycle}>
                <MaterialCommunityIcons
                  name="recycle"
                  size={16}
                  color="rgba(255,255,255,0.14)"
                />
              </View>

              <View style={styles.artDotOne} />
              <View style={styles.artDotTwo} />
              <View style={styles.artDotThree} />
            </View>
          </View>

          <View style={styles.heroCurve} />
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
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeIcon}>
              <MaterialCommunityIcons
                name="sprout"
                size={21}
                color={FOREST}
              />
            </View>

            <View style={styles.welcomeCopy}>
              <Text style={styles.welcomeTitle}>
                Small actions, real impact.
              </Text>

              <Text style={styles.welcomeText}>
                Keep building smarter and greener habits every day.
              </Text>
            </View>
          </View>

          <SectionHeader
            label="YOUR JOURNEY"
            title="What would you like to do?"
          />

          <Pressable
            style={styles.scanButton}
            onPress={() => navigation.navigate("Camera")}
            accessibilityRole="button"
            accessibilityLabel="Scan your next item"
          >
            <View style={styles.scanIcon}>
              <MaterialCommunityIcons
                name="camera-plus-outline"
                size={22}
                color={WHITE}
              />
            </View>

            <View style={styles.scanCopy}>
              <Text style={styles.scanTitle}>
                Scan your next item
              </Text>

              <Text style={styles.scanSubtitle}>
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

          <View style={styles.quickActionRow}>
            <View style={styles.quickActionLeft}>
              <QuickAction
                icon="history"
                title="Scan history"
                subtitle="Review saved results"
                iconColor={FOREST}
                iconBackground={LIGHT_GREEN}
                onPress={() => navigation.navigate("History")}
              />
            </View>

            <View style={styles.quickActionRight}>
              <QuickAction
                icon="chart-line"
                title="Your impact"
                subtitle="Build better habits"
                iconColor={GOLD}
                iconBackground={LIGHT_GOLD}
                onPress={() => navigation.navigate("History")}
              />
            </View>
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
              title="Account security"
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
  iconColor,
  iconBackground,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  iconColor: string;
  iconBackground: string;
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
            backgroundColor: iconBackground,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color={iconColor}
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
          color={iconColor}
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
        size={20}
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
        Sign in to access saved scans, account preferences,
        and your sustainable journey.
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
  const names = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!names.length) {
    return "S";
  }

  return names
    .map((item) => item.charAt(0).toUpperCase())
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
    minHeight: 440,
    overflow: "hidden",
  },

  heroInner: {
    position: "relative",
    width: "100%",
    flex: 1,
    alignSelf: "center",
  },

  heroGlowTop: {
    position: "absolute",
    top: -115,
    left: -95,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  heroGlowRight: {
    position: "absolute",
    top: 115,
    right: -95,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  heroGlowBottom: {
    position: "absolute",
    bottom: -135,
    left: "16%",
    width: 300,
    height: 190,
    borderRadius: 150,
    backgroundColor: "rgba(0,0,0,0.07)",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.23)",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandMark: {
    width: 29,
    height: 29,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
    marginRight: 7,
  },

  brandText: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 11,
  },

  topBarSpacer: {
    width: 43,
    height: 43,
  },

  profileHeroContent: {
    alignItems: "center",
    marginTop: 27,
  },

  profileLabel: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  profileLabelText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#D7F8E1",
    fontSize: 8,
    letterSpacing: 1.2,
    marginLeft: 5,
  },

  heroAvatarOuter: {
    position: "relative",
    width: 122,
    height: 122,
    borderRadius: 61,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
  },

  heroAvatarGlow: {
    position: "absolute",
    width: 122,
    height: 122,
    borderRadius: 61,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.31)",
  },

  heroAvatarRing: {
    width: 106,
    height: 106,
    borderRadius: 53,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: WHITE,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.90)",
  },

  heroAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  heroAvatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B4529",
  },

  heroAvatarText: {
    fontFamily: "Poppins_700Bold",
    color: WHITE,
    fontSize: 30,
  },

  editAvatarBadge: {
    position: "absolute",
    right: 1,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GOLD,
    borderWidth: 3,
    borderColor: FOREST,
  },

  heroName: {
    maxWidth: "88%",
    fontFamily: "Poppins_700Bold",
    color: WHITE,
    fontSize: 23,
    lineHeight: 30,
    textAlign: "center",
    marginTop: 13,
  },

  heroEmail: {
    maxWidth: "82%",
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.80)",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },

  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  memberBadgeText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#D7F8E1",
    fontSize: 9,
    marginLeft: 5,
  },

  heroArt: {
    position: "absolute",
    right: -9,
    bottom: 26,
    width: 137,
    height: 115,
  },

  artLargeLeaf: {
    position: "absolute",
    top: 0,
    right: 9,
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    transform: [
      {
        rotate: "-17deg",
      },
    ],
  },

  artSprout: {
    position: "absolute",
    left: 0,
    bottom: 5,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  artRecycle: {
    position: "absolute",
    right: 3,
    bottom: 1,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  artDotOne: {
    position: "absolute",
    top: 20,
    left: 24,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.28)",
  },

  artDotTwo: {
    position: "absolute",
    right: 49,
    bottom: 17,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.28)",
  },

  artDotThree: {
    position: "absolute",
    top: 56,
    left: 52,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.30)",
  },

  heroCurve: {
    position: "absolute",
    left: -48,
    right: -48,
    bottom: -43,
    height: 86,
    borderRadius: 75,
    backgroundColor: CREAM,
  },

  content: {
    width: "100%",
    alignSelf: "center",
    marginTop: 8,
  },

  welcomeCard: {
    minHeight: 73,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 21,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "#E1ECE3",
  },

  welcomeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  welcomeCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  welcomeTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
  },

  welcomeText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
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
    minHeight: 77,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 39,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#C6E6CF",
  },

  scanIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
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
    color: TEXT,
    fontSize: 12,
  },

  scanSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: 2,
  },

  scanArrow: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: WHITE,
  },

  quickActionRow: {
    flexDirection: "row",
    marginTop: 10,
  },

  quickActionLeft: {
    flex: 1,
    marginRight: 5,
  },

  quickActionRight: {
    flex: 1,
    marginLeft: 5,
  },

  quickAction: {
    position: "relative",
    minHeight: 125,
    padding: 12,
    borderRadius: 21,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "#E3ECE5",
  },

  quickActionIcon: {
    width: 38,
    height: 38,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F8F4",
  },

  settingsCard: {
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "#E3ECE5",
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
    paddingHorizontal: 17,
    marginTop: 20,
    borderRadius: 24,
    backgroundColor: FOREST,
  },

  emptyButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 12,
    marginRight: 8,
  },
});