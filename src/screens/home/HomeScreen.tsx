import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";
import { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/auth.store";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Home"
>;

type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

type ScanItem = {
  id: string;
  title: string;
  category: string;
  score: string;
  icon: IconName;
  time: string;
};

type PathwayItem = {
  title: string;
  subtitle: string;
  icon: IconName;
  image: number;
};

const screenWidth = Dimensions.get("window").width;

const heroImage = require("../../../assets/images/hero-leaf.png");

const pathwayItems: PathwayItem[] = [
  {
    title: "Recycle",
    subtitle: "Transform waste into new beginnings.",
    icon: "recycle",
    image: require(
      "../../../assets/images/pathway-recycle.png"
    ),
  },
  {
    title: "Reuse",
    subtitle: "Give useful things another life.",
    icon: "refresh",
    image: require(
      "../../../assets/images/pathway-reuse.png"
    ),
  },
  {
    title: "Compost",
    subtitle: "Return natural materials to the earth.",
    icon: "leaf",
    image: require(
      "../../../assets/images/pathway-compost.png"
    ),
  },
  {
    title: "Dispose",
    subtitle: "Choose the safest final destination.",
    icon: "delete-outline",
    image: require(
      "../../../assets/images/pathway-dispose.png"
    ),
  },
];

function getFirstName(
  displayName: string | null | undefined
): string {
  const name = displayName?.trim();

  if (!name) {
    return "there";
  }

  return name.split(/\s+/)[0];
}

function getDateLabel(value: unknown): string {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toLocaleDateString();
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (typeof value === "string") {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
  }

  return "Recently";
}

function getScanCategory(scan: any): string {
  return (
    scan.disposalMethod ||
    scan.category ||
    scan.recommendation ||
    "REVIEW"
  )
    .toString()
    .toUpperCase();
}

function getScanScore(scan: any): string {
  const score = Number(
    scan.ecoScore ??
      scan.score ??
      scan.sustainabilityScore ??
      0
  );

  return Number.isFinite(score)
    ? score.toFixed(1)
    : "0.0";
}

function getScanTitle(scan: any): string {
  return (
    scan.itemName ||
    scan.name ||
    scan.label ||
    scan.detectedItem ||
    "Scanned item"
  );
}

function getScanIcon(category: string): IconName {
  const value = category.toLowerCase();

  if (value.includes("recycl")) {
    return "recycle";
  }

  if (value.includes("compost")) {
    return "leaf";
  }

  if (value.includes("reuse")) {
    return "refresh";
  }

  if (value.includes("donat")) {
    return "gift-outline";
  }

  return "package-variant-closed";
}

export default function HomeScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePathway, setActivePathway] =
    useState("Recycle");
  const [recentScans, setRecentScans] = useState<ScanItem[]>(
    []
  );

  const firstName = getFirstName(user?.displayName);

  const loadRecentScans = useCallback(async () => {
    if (!user) {
      setRecentScans([]);
      return;
    }

    try {
      const service = await import(
        "../../services/firebase/scans.service"
      );

      const result = await service.getUserScans(user.uid);

      const mappedScans: ScanItem[] = result
        .slice(0, 4)
        .map((scan: any) => {
          const category = getScanCategory(scan);

          return {
            id: scan.id,
            title: getScanTitle(scan),
            category,
            score: getScanScore(scan),
            icon: getScanIcon(category),
            time: getDateLabel(
              scan.createdAt ??
                scan.timestamp ??
                scan.scannedAt
            ),
          };
        });

      setRecentScans(mappedScans);
    } catch {
      setRecentScans([]);
    }
  }, [user]);

  useEffect(() => {
    loadRecentScans();
  }, [loadRecentScans]);

  const averageScore = useMemo(() => {
    if (recentScans.length === 0) {
      return "0.0";
    }

    const total = recentScans.reduce(
      (sum, scan) => sum + Number(scan.score),
      0
    );

    return (total / recentScans.length).toFixed(1);
  }, [recentScans]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRecentScans();
    setIsRefreshing(false);
  };

  const navigateFromMenu = (
    route: keyof RootStackParamList
  ) => {
    setIsMenuOpen(false);
    navigation.navigate(route as never);
  };

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <MaterialCommunityIcons
            name="account-lock-outline"
            size={43}
            color={colors.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>
          Sign in to continue
        </Text>

        <Text style={styles.emptyText}>
          Your personal sustainability dashboard is waiting
          for you.
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
    <View style={styles.root}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 110,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
            colors={["#FFFFFF"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={heroImage}
          style={[
            styles.hero,
            {
              paddingTop: Math.max(insets.top, 18),
            },
          ]}
          imageStyle={styles.heroImage}
        >
          <LinearGradient
            colors={[
              "rgba(3,32,24,0.78)",
              "rgba(3,32,24,0.12)",
              "rgba(3,32,24,0.88)",
            ]}
            locations={[0, 0.43, 1]}
            style={styles.heroOverlay}
          >
            <View style={styles.topBar}>
              <Pressable
                style={styles.headerIconButton}
                onPress={() => setIsMenuOpen(true)}
              >
                <MaterialCommunityIcons
                  name="menu"
                  size={25}
                  color="#FFFFFF"
                />
              </Pressable>

              <Text style={styles.brand}>
                SnapSort AI
              </Text>

              <Pressable
                style={styles.headerIconButton}
                onPress={() =>
                  navigation.navigate("Profile")
                }
              >
                <MaterialCommunityIcons
                  name="account-circle-outline"
                  size={25}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>

            <View style={styles.heroCopy}>
              <Text style={styles.heroKicker}>
                WELCOME BACK, {firstName.toUpperCase()}
              </Text>

              <Text style={styles.heroTitle}>
                Your footprint,{"\n"}evolved.
              </Text>

              <Text style={styles.heroDescription}>
                Every scan is a step towards a regenerative future.
                Discover the hidden lifecycle of your everyday
                items.
              </Text>

              <Pressable
                style={styles.circularScanButton}
                onPress={() =>
                  navigation.navigate("Camera")
                }
              >
                <MaterialCommunityIcons
                  name="camera-outline"
                  size={29}
                  color="#FFFFFF"
                />

                <Text style={styles.circularScanText}>
                  SCAN ITEM
                </Text>
              </Pressable>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.body}>
          <View style={styles.metricsRow}>
            <Metric
              value={String(recentScans.length)}
              label="ITEMS SCANNED"
            />

            <Metric
              value={averageScore}
              label="ECO SCORE AVG"
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Pathways
            </Text>

            <Pressable
              onPress={() => navigation.navigate("History")}
            >
              <Text style={styles.sectionAction}>
                VIEW ALL
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            pagingEnabled={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pathwayList}
          >
            {pathwayItems.map((pathway) => (
              <PathwayCard
                key={pathway.title}
                pathway={pathway}
                active={activePathway === pathway.title}
                onPress={() => {
                  setActivePathway(pathway.title);
                  navigation.navigate("Camera");
                }}
              />
            ))}
          </ScrollView>

          <View style={styles.pathwayIndicator}>
            {pathwayItems.map((pathway) => (
              <View
                key={pathway.title}
                style={[
                  styles.indicator,
                  activePathway === pathway.title &&
                    styles.activeIndicator,
                ]}
              />
            ))}
          </View>

          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>
              Recent scans
            </Text>

            <Pressable
              onPress={() => navigation.navigate("History")}
            >
              <Text style={styles.sectionAction}>
                VIEW HISTORY
              </Text>
            </Pressable>
          </View>

          {recentScans.length > 0 ? (
            <View style={styles.recentList}>
              {recentScans.map((scan) => (
                <RecentScanRow
                  key={scan.id}
                  scan={scan}
                />
              ))}
            </View>
          ) : (
            <EmptyRecentScans
              onPress={() =>
                navigation.navigate("Camera")
              }
            />
          )}

          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <MaterialCommunityIcons
                name="lightbulb-on-outline"
                size={22}
                color="#A96E14"
              />
            </View>

            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>
                TODAY&apos;S INSIGHT
              </Text>

              <Text style={styles.insightText}>
                The best waste is the waste you never create.
              </Text>
            </View>

            <MaterialCommunityIcons
              name="arrow-top-right"
              size={19}
              color="#A96E14"
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomNavWrapper,
          {
            bottom: Math.max(insets.bottom + 8, 17),
          },
        ]}
      >
        <BlurView
          intensity={78}
          tint="light"
          style={styles.bottomNav}
        >
          <BottomNavItem
            icon="home-variant"
            label="Home"
            active
            onPress={() => undefined}
          />

          <BottomNavItem
            icon="camera-outline"
            label="Scan"
            isCenter
            onPress={() => navigation.navigate("Camera")}
          />

          <BottomNavItem
            icon="clipboard-text-outline"
            label="History"
            onPress={() => navigation.navigate("History")}
          />

          <BottomNavItem
            icon="account-outline"
            label="Profile"
            onPress={() => navigation.navigate("Profile")}
          />
        </BlurView>
      </View>

      {isMenuOpen && (
        <View style={styles.menuLayer}>
          <Pressable
            style={styles.menuBackdrop}
            onPress={() => setIsMenuOpen(false)}
          />

          <View
            style={[
              styles.sideMenu,
              {
                paddingTop: Math.max(insets.top, 22),
                paddingBottom: Math.max(insets.bottom, 22),
              },
            ]}
          >
            <View style={styles.menuHeader}>
              <View>
                <Text style={styles.menuBrand}>
                  SnapSort AI
                </Text>

                <Text style={styles.menuSubtitle}>
                  Smarter choices. Smaller footprint.
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() => setIsMenuOpen(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>

            <View style={styles.menuProfileCard}>
              <View style={styles.menuAvatar}>
                <Text style={styles.menuAvatarText}>
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.menuProfileCopy}>
                <Text style={styles.menuProfileName}>
                  {user.displayName || "SnapSort user"}
                </Text>

                <Text style={styles.menuProfileEmail}>
                  {user.email || "Personal account"}
                </Text>
              </View>
            </View>

            <Text style={styles.menuSectionLabel}>
              EXPLORE
            </Text>

            <MenuItem
              icon="home-variant-outline"
              title="Home dashboard"
              subtitle="Your sustainability overview"
              onPress={() => setIsMenuOpen(false)}
            />

            <MenuItem
              icon="camera-outline"
              title="Scan an item"
              subtitle="Identify and sort everyday items"
              onPress={() => navigateFromMenu("Camera")}
            />

            <MenuItem
              icon="history"
              title="Scan history"
              subtitle="Review your previous decisions"
              onPress={() => navigateFromMenu("History")}
            />

            <MenuItem
              icon="account-outline"
              title="Profile"
              subtitle="Manage your account"
              onPress={() => navigateFromMenu("Profile")}
            />

            <View style={styles.menuInfoCard}>
              <MaterialCommunityIcons
                name="sprout"
                size={25}
                color="#BEEAD0"
              />

              <Text style={styles.menuInfoText}>
                Every thoughtful choice helps keep useful
                materials in circulation.
              </Text>
            </View>

            <View style={styles.menuFooter}>
              <Text style={styles.menuFooterText}>
                SnapSort AI
              </Text>

              <Text style={styles.menuFooterVersion}>
                Smart sustainability assistant
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function Metric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>
        {value}
      </Text>

      <Text style={styles.metricLabel}>
        {label}
      </Text>

      <View style={styles.metricLine} />
    </View>
  );
}

function PathwayCard({
  pathway,
  active,
  onPress,
}: {
  pathway: PathwayItem;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pathwayCard,
        active && styles.activePathwayCard,
      ]}
    >
      <ImageBackground
        source={pathway.image}
        style={styles.pathwayImage}
        imageStyle={styles.pathwayImageStyle}
      >
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.04)",
            "rgba(0,0,0,0.16)",
            "rgba(0,0,0,0.86)",
          ]}
          style={styles.pathwayOverlay}
        >
          <View style={styles.pathwayTop}>
            <View style={styles.pathwayIcon}>
              <MaterialCommunityIcons
                name={pathway.icon}
                size={22}
                color="#0B4E3E"
              />
            </View>

            <View style={styles.pathwayArrow}>
              <MaterialCommunityIcons
                name="arrow-top-right"
                size={19}
                color="#FFFFFF"
              />
            </View>
          </View>

          <View>
            <Text style={styles.pathwayTitle}>
              {pathway.title}
            </Text>

            <Text style={styles.pathwaySubtitle}>
              {pathway.subtitle}
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
}

function RecentScanRow({
  scan,
}: {
  scan: ScanItem;
}) {
  return (
    <View style={styles.recentRow}>
      <View style={styles.recentIcon}>
        <MaterialCommunityIcons
          name={scan.icon}
          size={21}
          color="#0B4E3E"
        />
      </View>

      <View style={styles.recentCopy}>
        <Text style={styles.recentTitle}>
          {scan.title}
        </Text>

        <Text style={styles.recentTime}>
          {scan.time}
        </Text>
      </View>

      <View style={styles.recentScore}>
        <Text style={styles.scoreValue}>
          {scan.score}
        </Text>

        <Text style={styles.scoreCategory}>
          {scan.category}
        </Text>
      </View>
    </View>
  );
}

function EmptyRecentScans({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <View style={styles.emptyRecent}>
      <View style={styles.emptyRecentIcon}>
        <MaterialCommunityIcons
          name="scan-helper"
          size={24}
          color="#0B4E3E"
        />
      </View>

      <View style={styles.emptyRecentCopy}>
        <Text style={styles.emptyRecentTitle}>
          Your scan story starts here
        </Text>

        <Text style={styles.emptyRecentText}>
          Scan your first item to see your activity.
        </Text>
      </View>

      <Pressable
        onPress={onPress}
        style={styles.emptyRecentButton}
      >
        <MaterialCommunityIcons
          name="arrow-right"
          size={18}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}

function BottomNavItem({
  icon,
  label,
  active = false,
  isCenter = false,
  onPress,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  isCenter?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.bottomNavItem}
    >
      <View
        style={[
          styles.bottomNavIcon,
          active && styles.activeBottomNavIcon,
          isCenter && styles.centerBottomNavIcon,
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={isCenter ? 23 : 20}
          color={
            active || isCenter ? "#FFFFFF" : "#77827D"
          }
        />
      </View>

      <Text
        style={[
          styles.bottomNavLabel,
          active && styles.activeBottomNavLabel,
          isCenter && styles.centerBottomNavLabel,
        ]}
      >
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
      onPress={onPress}
      style={styles.menuItem}
    >
      <View style={styles.menuItemIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={21}
          color="#BEEAD0"
        />
      </View>

      <View style={styles.menuItemCopy}>
        <Text style={styles.menuItemTitle}>
          {title}
        </Text>

        <Text style={styles.menuItemSubtitle}>
          {subtitle}
        </Text>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={21}
        color="rgba(255,255,255,0.5)"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8F7F3",
  },
  screen: {
    flex: 1,
    backgroundColor: "#F8F7F3",
  },
  scrollContent: {
    backgroundColor: "#F8F7F3",
  },
  hero: {
    height: 585,
    overflow: "hidden",
  },
  heroImage: {
    resizeMode: "cover",
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 26,
    letterSpacing: -0.8,
  },
  notificationDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F4D252",
  },
  heroCopy: {
    maxWidth: 350,
  },
  heroKicker: {
    fontFamily: "Poppins_600SemiBold",
    color: "#D7F7E2",
    fontSize: 10,
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 39,
    lineHeight: 45,
    letterSpacing: -1.2,
  },
  heroDescription: {
    fontFamily: "Poppins_400Regular",
    color: "#F2FFF6",
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 340,
    marginTop: 14,
  },
  circularScanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    alignSelf: "flex-start",
    minWidth: 148,
    height: 52,
    paddingHorizontal: 19,
    borderRadius: 30,
    backgroundColor: "#0A4F3E",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  circularScanText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 12,
    letterSpacing: 1,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 26,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 38,
    marginBottom: 43,
  },
  metric: {
    minWidth: 105,
  },
  metricValue: {
    fontFamily: "Poppins_700Bold",
    color: "#064B3D",
    fontSize: 39,
    lineHeight: 43,
    letterSpacing: -1,
  },
  metricLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "#7B817C",
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 7,
  },
  metricLine: {
    width: 48,
    height: 4,
    backgroundColor: "#F2D34D",
    marginTop: 17,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#1D2421",
    fontSize: 26,
    letterSpacing: -0.6,
  },
  sectionAction: {
    fontFamily: "Poppins_600SemiBold",
    color: "#0B4E3E",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  pathwayList: {
    gap: 12,
    paddingRight: 24,
  },
  pathwayCard: {
    width: Math.min(screenWidth * 0.76, 290),
    height: 400,
    overflow: "hidden",
    borderRadius: 17,
    backgroundColor: "#DDE3E0",
  },
  activePathwayCard: {
    shadowColor: "#0B4E3E",
    shadowOpacity: 0.2,
    shadowRadius: 13,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 6,
  },
  pathwayImage: {
    flex: 1,
  },
  pathwayImageStyle: {
    resizeMode: "cover",
  },
  pathwayOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 17,
  },
  pathwayTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pathwayIcon: {
    width: 47,
    height: 47,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(224,245,231,0.94)",
  },
  pathwayArrow: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  pathwayTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 29,
    letterSpacing: -0.7,
  },
  pathwaySubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "#F5FFF7",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 3,
    maxWidth: 240,
  },
  pathwayIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C5CCC8",
  },
  activeIndicator: {
    width: 25,
    backgroundColor: "#0B4E3E",
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 43,
    marginBottom: 14,
  },
  recentList: {
    gap: 1,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 78,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E5E1",
  },
  recentIcon: {
    width: 47,
    height: 47,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF0ED",
  },
  recentCopy: {
    flex: 1,
    marginLeft: 14,
  },
  recentTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#1E2824",
    fontSize: 15,
  },
  recentTime: {
    fontFamily: "Poppins_600SemiBold",
    color: "#858B86",
    fontSize: 9,
    letterSpacing: 1.1,
    marginTop: 4,
  },
  recentScore: {
    alignItems: "flex-end",
  },
  scoreValue: {
    fontFamily: "Poppins_700Bold",
    color: "#07513F",
    fontSize: 21,
  },
  scoreCategory: {
    fontFamily: "Poppins_600SemiBold",
    color: "#8C7732",
    fontSize: 8,
    letterSpacing: 1.1,
    marginTop: 1,
  },
  emptyRecent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E5E1",
  },
  emptyRecentIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F4EA",
  },
  emptyRecentCopy: {
    flex: 1,
    marginLeft: 11,
  },
  emptyRecentTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#1E2824",
    fontSize: 13,
  },
  emptyRecentText: {
    fontFamily: "Poppins_400Regular",
    color: "#7B817C",
    fontSize: 10,
    marginTop: 3,
  },
  emptyRecentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B4E3E",
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
    padding: 15,
    borderRadius: 17,
    backgroundColor: "#FFF8E4",
    borderWidth: 1,
    borderColor: "#F2E2AD",
  },
  insightIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEABD",
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "#A96E14",
    fontSize: 9,
    letterSpacing: 1.2,
  },
  insightText: {
    fontFamily: "Poppins_500Medium",
    color: "#65501F",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  bottomNavWrapper: {
    position: "absolute",
    left: 28,
    right: 28,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 67,
    paddingHorizontal: 5,
    overflow: "hidden",
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    backgroundColor: "rgba(255,255,255,0.7)",
    shadowColor: "#19372D",
    shadowOpacity: 0.15,
    shadowRadius: 17,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 8,
  },
  bottomNavItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 58,
  },
  bottomNavIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  activeBottomNavIcon: {
    backgroundColor: "#0B4E3E",
  },
  centerBottomNavIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#0B4E3E",
    shadowColor: "#0B4E3E",
    shadowOpacity: 0.3,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 5,
  },
  bottomNavLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "#89908B",
    fontSize: 8,
    letterSpacing: 0.7,
    marginTop: 2,
  },
  activeBottomNavLabel: {
    color: "#0B4E3E",
  },
  centerBottomNavLabel: {
    color: "#0B4E3E",
  },
  menuLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  sideMenu: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "86%",
    paddingHorizontal: 22,
    backgroundColor: "#083D31",
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: {
      width: 8,
      height: 0,
    },
    elevation: 18,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  menuBrand: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 25,
  },
  menuSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "#B9D8C6",
    fontSize: 10,
    marginTop: 2,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  menuProfileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    marginTop: 29,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  menuAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#CBECD6",
  },
  menuAvatarText: {
    fontFamily: "Poppins_700Bold",
    color: "#0B4E3E",
    fontSize: 19,
  },
  menuProfileCopy: {
    flex: 1,
    marginLeft: 11,
  },
  menuProfileName: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 13,
  },
  menuProfileEmail: {
    fontFamily: "Poppins_400Regular",
    color: "#B9D8C6",
    fontSize: 10,
    marginTop: 2,
  },
  menuSectionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "#8CBDA0",
    fontSize: 9,
    letterSpacing: 1.7,
    marginTop: 32,
    marginBottom: 9,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 65,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  menuItemIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  menuItemCopy: {
    flex: 1,
    marginLeft: 11,
  },
  menuItemTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 13,
  },
  menuItemSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "#A8C9B5",
    fontSize: 10,
    marginTop: 2,
  },
  menuInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginTop: 28,
    padding: 14,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  menuInfoText: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    color: "#D4EFDC",
    fontSize: 11,
    lineHeight: 17,
  },
  menuFooter: {
    marginTop: "auto",
  },
  menuFooterText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 12,
  },
  menuFooterVersion: {
    fontFamily: "Poppins_400Regular",
    color: "#8CBDA0",
    fontSize: 10,
    marginTop: 3,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor: "#F8F7F3",
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 20,
  },
  emptyText: {
    maxWidth: 290,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 7,
    marginBottom: 17,
  },
});