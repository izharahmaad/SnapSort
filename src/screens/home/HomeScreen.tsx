import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
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

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

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
  const cleanName = displayName?.trim();

  if (!cleanName) {
    return "there";
  }

  return cleanName.split(/\s+/)[0];
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

function getScanCategory(scan: any): string {
  return String(
    scan.disposalMethod ||
      scan.category ||
      scan.recommendation ||
      "REVIEW"
  ).toUpperCase();
}

function getScanScore(scan: any): string {
  const value = Number(
    scan.ecoScore ??
      scan.score ??
      scan.sustainabilityScore ??
      0
  );

  return Number.isFinite(value)
    ? value.toFixed(1)
    : "0.0";
}

function getScanDate(value: any): string {
  if (
    value &&
    typeof value === "object" &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toLocaleDateString();
  }

  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Recently"
    : date.toLocaleDateString();
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
      const scansService = await import(
        "../../services/firebase/scans.service"
      );

      const scans = await scansService.getUserScans(user.uid);

      const formattedScans: ScanItem[] = scans
        .slice(0, 4)
        .map((scan: any) => {
          const category = getScanCategory(scan);

          return {
            id: scan.id,
            title: getScanTitle(scan),
            category,
            score: getScanScore(scan),
            icon: getScanIcon(category),
            time: getScanDate(
              scan.createdAt ||
                scan.timestamp ||
                scan.scannedAt
            ),
          };
        });

      setRecentScans(formattedScans);
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

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    await loadRecentScans();
    setIsRefreshing(false);
  };

  const openScreen = (screen: keyof RootStackParamList) => {
    setIsMenuOpen(false);
    navigation.navigate(screen as never);
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
          Sign in to continue
        </Text>

        <Text style={styles.emptyText}>
          Your sustainability dashboard is waiting for you.
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
            paddingBottom: insets.bottom + 95,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshDashboard}
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
              paddingTop: Math.max(insets.top, 16),
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
            locations={[0, 0.45, 1]}
            style={styles.heroOverlay}
          >
            <View style={styles.topBar}>
              <Pressable
                style={styles.headerButton}
                onPress={() => setIsMenuOpen(true)}
              >
                <MaterialCommunityIcons
                  name="menu"
                  size={23}
                  color="#FFFFFF"
                />
              </Pressable>

              <Text style={styles.brand}>
                SnapSort AI
              </Text>

              <Pressable
                style={styles.headerButton}
                onPress={() => navigation.navigate("Profile")}
              >
                <MaterialCommunityIcons
                  name="account-circle-outline"
                  size={23}
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
                Every scan is a step towards a regenerative
                future. Discover the hidden lifecycle of your
                everyday items.
              </Text>

              <Pressable
                style={styles.scanButton}
                onPress={() => navigation.navigate("Camera")}
              >
                <MaterialCommunityIcons
                  name="camera-outline"
                  size={23}
                  color="#FFFFFF"
                />

                <Text style={styles.scanButtonText}>
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

          <SectionHeader
            title="Pathways"
            action="VIEW ALL"
            onPress={() => navigation.navigate("History")}
          />

          <ScrollView
            horizontal
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

          <View style={styles.indicators}>
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

          <SectionHeader
            title="Recent scans"
            action="VIEW HISTORY"
            onPress={() => navigation.navigate("History")}
          />

          {recentScans.length > 0 ? (
            <View>
              {recentScans.map((scan) => (
                <RecentScanRow
                  key={scan.id}
                  scan={scan}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyRecent}>
              <View style={styles.recentIcon}>
                <MaterialCommunityIcons
                  name="scan-helper"
                  size={21}
                  color="#0B4E3E"
                />
              </View>

              <View style={styles.emptyRecentCopy}>
                <Text style={styles.emptyRecentTitle}>
                  No recent scans
                </Text>

                <Text style={styles.emptyRecentText}>
                  Scan your first item to begin.
                </Text>
              </View>

              <Pressable
                style={styles.arrowButton}
                onPress={() => navigation.navigate("Camera")}
              >
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={18}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          )}

          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <MaterialCommunityIcons
                name="lightbulb-on-outline"
                size={21}
                color="#A96E14"
              />
            </View>

            <View style={styles.insightCopy}>
              <Text style={styles.insightLabel}>
                TODAY&apos;S INSIGHT
              </Text>

              <Text style={styles.insightText}>
                The best waste is the waste you never create.
              </Text>
            </View>

            <MaterialCommunityIcons
              name="arrow-top-right"
              size={18}
              color="#A96E14"
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footerWrapper,
          {
            bottom: Math.max(insets.bottom + 7, 14),
          },
        ]}
      >
        <BlurView
          intensity={78}
          tint="light"
          style={styles.footer}
        >
          <BottomItem
            icon="home-variant"
            label="Home"
            active
            onPress={() => undefined}
          />

          <BottomItem
            icon="camera-outline"
            label="Scan"
            center
            onPress={() => navigation.navigate("Camera")}
          />

          <BottomItem
            icon="history"
            label="History"
            onPress={() => navigation.navigate("History")}
          />

          <BottomItem
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
                paddingTop: Math.max(insets.top, 20),
                paddingBottom: Math.max(insets.bottom, 20),
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
                  size={20}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>

            <View style={styles.menuProfile}>
              <View style={styles.menuAvatar}>
                <Text style={styles.menuAvatarText}>
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.menuProfileText}>
                <Text style={styles.menuName}>
                  {user.displayName || "SnapSort user"}
                </Text>

                <Text style={styles.menuEmail}>
                  {user.email || "Personal account"}
                </Text>
              </View>
            </View>

            <Text style={styles.menuLabel}>
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
              subtitle="Identify an everyday item"
              onPress={() => openScreen("Camera")}
            />

            <MenuItem
              icon="history"
              title="Scan history"
              subtitle="Review previous results"
              onPress={() => openScreen("History")}
            />

            <MenuItem
              icon="account-outline"
              title="Profile"
              subtitle="Manage your account"
              onPress={() => openScreen("Profile")}
            />

            <View style={styles.menuInfo}>
              <MaterialCommunityIcons
                name="sprout"
                size={23}
                color="#BEEAD0"
              />

              <Text style={styles.menuInfoText}>
                Every thoughtful choice helps keep useful
                materials in circulation.
              </Text>
            </View>

            <View style={styles.menuFooter}>
              <Text style={styles.menuFooterTitle}>
                SnapSort AI
              </Text>

              <Text style={styles.menuFooterText}>
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

function SectionHeader({
  title,
  action,
  onPress,
}: {
  title: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <Pressable onPress={onPress}>
        <Text style={styles.sectionAction}>
          {action}
        </Text>
      </Pressable>
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
            "rgba(0,0,0,0.18)",
            "rgba(0,0,0,0.85)",
          ]}
          style={styles.pathwayOverlay}
        >
          <View style={styles.pathwayTop}>
            <View style={styles.pathwayIcon}>
              <MaterialCommunityIcons
                name={pathway.icon}
                size={20}
                color="#0B4E3E"
              />
            </View>

            <View style={styles.pathwayArrow}>
              <MaterialCommunityIcons
                name="arrow-top-right"
                size={17}
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
          size={20}
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

function BottomItem({
  icon,
  label,
  active = false,
  center = false,
  onPress,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  center?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.bottomItem}
      onPress={onPress}
    >
      <View
        style={[
          styles.bottomIcon,
          active && styles.activeBottomIcon,
          center && styles.centerBottomIcon,
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={center ? 21 : 18}
          color={
            active || center ? "#FFFFFF" : "#7C8781"
          }
        />
      </View>

      <Text
        style={[
          styles.bottomLabel,
          active && styles.activeBottomLabel,
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
      style={styles.menuItem}
      onPress={onPress}
    >
      <View style={styles.menuItemIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={19}
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
        size={19}
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
    height: 555,
    overflow: "hidden",
  },
  heroImage: {
    resizeMode: "cover",
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 25,
    letterSpacing: -0.8,
  },
  heroCopy: {
    maxWidth: 350,
  },
  heroKicker: {
    fontFamily: "Poppins_600SemiBold",
    color: "#D7F7E2",
    fontSize: 9,
    letterSpacing: 1.35,
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
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 335,
    marginTop: 13,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "flex-start",
    minWidth: 143,
    height: 50,
    paddingHorizontal: 18,
    borderRadius: 28,
    backgroundColor: "#2F8FEA",
    marginTop: 19,
    shadowColor: "#063D6D",
    shadowOpacity: 0.3,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },
  scanButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 11,
    letterSpacing: 1,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 25,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 38,
    marginBottom: 42,
  },
  metric: {
    minWidth: 105,
  },
  metricValue: {
    fontFamily: "Poppins_700Bold",
    color: "#064B3D",
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1,
  },
  metricLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "#7B817C",
    fontSize: 8,
    letterSpacing: 1.9,
    marginTop: 7,
  },
  metricLine: {
    width: 46,
    height: 4,
    backgroundColor: "#F2D34D",
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#1D2421",
    fontSize: 25,
    letterSpacing: -0.5,
  },
  sectionAction: {
    fontFamily: "Poppins_600SemiBold",
    color: "#0B4E3E",
    fontSize: 9,
    letterSpacing: 1.3,
  },
  pathwayList: {
    gap: 10,
    paddingRight: 24,
  },
  pathwayCard: {
    width: 238,
    height: 278,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#DDE3E0",
  },
  activePathwayCard: {
    shadowColor: "#0B4E3E",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
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
    padding: 14,
  },
  pathwayTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pathwayIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(224,245,231,0.94)",
  },
  pathwayArrow: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  pathwayTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 25,
  },
  pathwaySubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "#F5FFF7",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 2,
    maxWidth: 205,
  },
  indicators: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 12,
  },
  indicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#C5CCC8",
  },
  activeIndicator: {
    width: 21,
    backgroundColor: "#0B4E3E",
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 40,
    marginBottom: 12,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 72,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E5E1",
  },
  recentIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF0ED",
  },
  recentCopy: {
    flex: 1,
    marginLeft: 13,
  },
  recentTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#1E2824",
    fontSize: 14,
  },
  recentTime: {
    fontFamily: "Poppins_600SemiBold",
    color: "#858B86",
    fontSize: 8,
    letterSpacing: 1,
    marginTop: 3,
  },
  recentScore: {
    alignItems: "flex-end",
  },
  scoreValue: {
    fontFamily: "Poppins_700Bold",
    color: "#07513F",
    fontSize: 20,
  },
  scoreCategory: {
    fontFamily: "Poppins_600SemiBold",
    color: "#8C7732",
    fontSize: 7,
    letterSpacing: 1,
    marginTop: 1,
  },
  emptyRecent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E5E1",
  },
  emptyRecentCopy: {
    flex: 1,
    marginLeft: 10,
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
    marginTop: 2,
  },
  arrowButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B4E3E",
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 22,
    padding: 13,
    borderRadius: 16,
    backgroundColor: "#FFF8E4",
    borderWidth: 1,
    borderColor: "#F2E2AD",
  },
  insightIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEABD",
  },
  insightCopy: {
    flex: 1,
  },
  insightLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "#A96E14",
    fontSize: 8,
    letterSpacing: 1.1,
  },
  insightText: {
    fontFamily: "Poppins_500Medium",
    color: "#65501F",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 2,
  },
  footerWrapper: {
    position: "absolute",
    left: 35,
    right: 35,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 57,
    paddingHorizontal: 3,
    overflow: "hidden",
    borderRadius: 29,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    backgroundColor: "rgba(255,255,255,0.72)",
    shadowColor: "#19372D",
    shadowOpacity: 0.13,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 7,
  },
  bottomItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
  bottomIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  activeBottomIcon: {
    backgroundColor: "#0B4E3E",
  },
  centerBottomIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2F8FEA",
    shadowColor: "#2F8FEA",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },
  bottomLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "#7C8781",
    fontSize: 7,
    letterSpacing: 0.4,
    marginTop: 1,
  },
  activeBottomLabel: {
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
    paddingHorizontal: 21,
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
    fontSize: 24,
  },
  menuSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "#B9D8C6",
    fontSize: 9,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  menuProfile: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginTop: 27,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  menuAvatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#CBECD6",
  },
  menuAvatarText: {
    fontFamily: "Poppins_700Bold",
    color: "#0B4E3E",
    fontSize: 18,
  },
  menuProfileText: {
    flex: 1,
    marginLeft: 10,
  },
  menuName: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 12,
  },
  menuEmail: {
    fontFamily: "Poppins_400Regular",
    color: "#B9D8C6",
    fontSize: 9,
    marginTop: 2,
  },
  menuLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "#8CBDA0",
    fontSize: 8,
    letterSpacing: 1.6,
    marginTop: 30,
    marginBottom: 7,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 62,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  menuItemIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  menuItemCopy: {
    flex: 1,
    marginLeft: 10,
  },
  menuItemTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 12,
  },
  menuItemSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "#A8C9B5",
    fontSize: 9,
    marginTop: 2,
  },
  menuInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 26,
    padding: 13,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  menuInfoText: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    color: "#D4EFDC",
    fontSize: 10,
    lineHeight: 16,
  },
  menuFooter: {
    marginTop: "auto",
  },
  menuFooterTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 11,
  },
  menuFooterText: {
    fontFamily: "Poppins_400Regular",
    color: "#8CBDA0",
    fontSize: 9,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor: "#F8F7F3",
  },
  emptyIcon: {
    width: 86,
    height: 86,
    borderRadius: 28,
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