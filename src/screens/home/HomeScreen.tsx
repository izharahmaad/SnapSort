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
  score: number;
  icon: IconName;
  date: Date | null;
  timeLabel: string;
};

type PathwayItem = {
  title: string;
  subtitle: string;
  icon: IconName;
  image: number;
};

const heroImage = require("../../../assets/images/hero-leaf.png");

const pathways: PathwayItem[] = [
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
  return displayName?.trim().split(/\s+/)[0] || "there";
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

function getScanScore(scan: any): number {
  const score = Number(
    scan.ecoScore ??
      scan.score ??
      scan.sustainabilityScore ??
      0
  );

  return Number.isFinite(score) ? score : 0;
}

function getScanDate(value: any): Date | null {
  if (
    value &&
    typeof value === "object" &&
    typeof value.toDate === "function"
  ) {
    return value.toDate();
  }

  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getTimeLabel(date: Date | null): string {
  if (!date) {
    return "RECENTLY";
  }

  const now = new Date();

  const isToday =
    now.getDate() === date.getDate() &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear();

  if (isToday) {
    return `TODAY, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return date
    .toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
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

function getWeekStart(): Date {
  const today = new Date();
  const day = today.getDay();
  const offset = day === 0 ? -6 : 1 - day;

  const start = new Date(today);
  start.setDate(today.getDate() + offset);
  start.setHours(0, 0, 0, 0);

  return start;
}

export default function HomeScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activePathway, setActivePathway] =
    useState("Recycle");
  const [allScans, setAllScans] = useState<ScanItem[]>([]);

  const firstName = getFirstName(user?.displayName);

  const loadScans = useCallback(async () => {
    if (!user) {
      setAllScans([]);
      return;
    }

    try {
      const scansService = await import(
        "../../services/firebase/scans.service"
      );

      const scans = await scansService.getUserScans(
        user.uid
      );

      const formattedScans: ScanItem[] = scans.map(
        (scan: any) => {
          const category = getScanCategory(scan);
          const date = getScanDate(
            scan.createdAt ||
              scan.timestamp ||
              scan.scannedAt
          );

          return {
            id: scan.id,
            title: getScanTitle(scan),
            category,
            score: getScanScore(scan),
            icon: getScanIcon(category),
            date,
            timeLabel: getTimeLabel(date),
          };
        }
      );

      formattedScans.sort((first, second) => {
        const firstDate = first.date?.getTime() || 0;
        const secondDate = second.date?.getTime() || 0;

        return secondDate - firstDate;
      });

      setAllScans(formattedScans);
    } catch {
      setAllScans([]);
    }
  }, [user]);

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  const recentScans = allScans.slice(0, 3);
  const weeklyScans = useMemo(() => {
    const weekStart = getWeekStart();

    return allScans.filter((scan) => {
      return scan.date !== null && scan.date >= weekStart;
    }).length;
  }, [allScans]);

  const averageScore = useMemo(() => {
    if (allScans.length === 0) {
      return "0.0";
    }

    const total = allScans.reduce(
      (sum, scan) => sum + scan.score,
      0
    );

    return (total / allScans.length).toFixed(1);
  }, [allScans]);

  const weeklyGoal = 5;
  const weeklyProgress = Math.min(
    (weeklyScans / weeklyGoal) * 100,
    100
  );

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    await loadScans();
    setIsRefreshing(false);
  };

  const openScreen = (
    screen: keyof RootStackParamList
  ) => {
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
            paddingBottom: insets.bottom + 105,
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
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <LinearGradient
            colors={[
              "rgba(3,32,24,0.25)",
              "rgba(3,32,24,0.02)",
              "rgba(3,32,24,0.88)",
            ]}
            locations={[0, 0.42, 1]}
            style={styles.heroOverlay}
          >
            <View
              style={[
                styles.topBar,
                {
                  paddingTop: Math.max(insets.top, 10),
                },
              ]}
            >
              <Pressable
                style={styles.headerButton}
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
                style={styles.headerButton}
                onPress={() => navigation.navigate("Profile")}
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
                  size={22}
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
              value={String(allScans.length)}
              label="ITEMS SCANNED"
            />

            <Metric
              value={averageScore}
              label="ECO SCORE AVG"
            />
          </View>

          <View style={styles.weeklyCard}>
            <View style={styles.weeklyTop}>
              <View style={styles.weeklyLeft}>
                <View style={styles.weeklyIcon}>
                  <MaterialCommunityIcons
                    name="calendar-check-outline"
                    size={18}
                    color="#0B4E3E"
                  />
                </View>

                <View>
                  <Text style={styles.weeklyTitle}>
                    This week
                  </Text>

                  <Text style={styles.weeklySubtitle}>
                    {weeklyScans} of {weeklyGoal} scans
                  </Text>
                </View>
              </View>

              <Text style={styles.weeklyPercent}>
                {Math.round(weeklyProgress)}%
              </Text>
            </View>

            <View style={styles.weeklyTrack}>
              <View
                style={[
                  styles.weeklyValue,
                  {
                    width: `${weeklyProgress}%`,
                  },
                ]}
              />
            </View>
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
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pathwayList}
          >
            {pathways.map((pathway) => (
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
            {pathways.map((pathway) => (
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

          <Pressable
            style={styles.streakCard}
            onPress={() => navigation.navigate("Camera")}
          >
            <View style={styles.streakIcon}>
              <MaterialCommunityIcons
                name="fire"
                size={21}
                color="#C66D17"
              />
            </View>

            <View style={styles.streakCopy}>
              <Text style={styles.streakTitle}>
                Build your eco streak
              </Text>

              <Text style={styles.streakText}>
                Scan one item today and keep your sustainable
                habit growing.
              </Text>
            </View>

            <View style={styles.streakArrow}>
              <MaterialCommunityIcons
                name="arrow-right"
                size={17}
                color="#FFFFFF"
              />
            </View>
          </Pressable>

          <Pressable
            style={styles.guideCard}
            onPress={() => setIsGuideOpen(!isGuideOpen)}
          >
            <View style={styles.guideHeader}>
              <View style={styles.guideIcon}>
                <MaterialCommunityIcons
                  name="book-open-variant"
                  size={19}
                  color="#0B4E3E"
                />
              </View>

              <View style={styles.guideCopy}>
                <Text style={styles.guideTitle}>
                  Quick disposal guide
                </Text>

                <Text style={styles.guideSubtitle}>
                  Choose the right path before disposal.
                </Text>
              </View>

              <View style={styles.guideChevron}>
                <MaterialCommunityIcons
                  name={
                    isGuideOpen
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={20}
                  color="#0B4E3E"
                />
              </View>
            </View>

            {isGuideOpen && (
              <View style={styles.guideDetails}>
                <GuideRow
                  icon="recycle"
                  title="Recycle"
                  text="Clean and sort accepted materials."
                  color="#E2F4E8"
                />

                <GuideRow
                  icon="refresh"
                  title="Reuse"
                  text="Repair, donate, refill, or repurpose."
                  color="#FFF0D5"
                />

                <GuideRow
                  icon="leaf"
                  title="Compost"
                  text="Return approved natural materials to soil."
                  color="#EEF0D9"
                />
              </View>
            )}
          </Pressable>

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
                  name="camera-outline"
                  size={20}
                  color="#0B4E3E"
                />
              </View>

              <View style={styles.emptyRecentCopy}>
                <Text style={styles.emptyRecentTitle}>
                  No scans yet
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
                  size={17}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footerWrapper,
          {
            bottom: Math.max(insets.bottom + 7, 13),
          },
        ]}
      >
        <BlurView
          intensity={20}
          tint="dark"
          style={styles.footer}
        >
          <BottomItem
            icon="home-variant"
            label="Home"
            onPress={() => undefined}
          />

          <BottomItem
            icon="history"
            label="History"
            onPress={() => navigation.navigate("History")}
          />

          <BottomItem
            icon="camera-outline"
            label="Scan"
            center
            onPress={() => navigation.navigate("Camera")}
          />

          <BottomItem
            icon="chart-line"
            label="Impact"
            onPress={() => setIsGuideOpen(true)}
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

            <Pressable
              style={styles.menuProfile}
              onPress={() => openScreen("Profile")}
            >
              <View style={styles.menuAvatar}>
                <Text style={styles.menuAvatarText}>
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.menuProfileCopy}>
                <Text style={styles.menuName}>
                  {user.displayName || "SnapSort user"}
                </Text>

                <Text style={styles.menuEmail}>
                  {user.email || "Personal account"}
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#B9D8C6"
              />
            </Pressable>

            <Text style={styles.menuLabel}>
              MAIN MENU
            </Text>

            <MenuItem
              icon="camera-outline"
              title="Scan an item"
              subtitle="Get disposal guidance"
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
              subtitle="Account and settings"
              onPress={() => openScreen("Profile")}
            />

            <Pressable
              style={styles.syncButton}
              onPress={async () => {
                setIsMenuOpen(false);
                await refreshDashboard();
              }}
            >
              <MaterialCommunityIcons
                name="refresh"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.syncButtonText}>
                Refresh dashboard
              </Text>
            </Pressable>

            <Text style={styles.menuFooterText}>
              SnapSort AI helps you make smarter choices for
              everyday items.
            </Text>
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
      style={[
        styles.pathwayCard,
        active && styles.activePathwayCard,
      ]}
      onPress={onPress}
    >
      <ImageBackground
        source={pathway.image}
        style={styles.pathwayImage}
        imageStyle={styles.pathwayImageStyle}
      >
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.03)",
            "rgba(0,0,0,0.15)",
            "rgba(0,0,0,0.85)",
          ]}
          style={styles.pathwayOverlay}
        >
          <View style={styles.pathwayTop}>
            <View style={styles.pathwayIcon}>
              <MaterialCommunityIcons
                name={pathway.icon}
                size={18}
                color="#0B4E3E"
              />
            </View>

            <MaterialCommunityIcons
              name="arrow-top-right"
              size={17}
              color="#FFFFFF"
            />
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

function GuideRow({
  icon,
  title,
  text,
  color,
}: {
  icon: IconName;
  title: string;
  text: string;
  color: string;
}) {
  return (
    <View style={styles.guideRow}>
      <View
        style={[
          styles.guideRowIcon,
          {
            backgroundColor: color,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={17}
          color="#0B4E3E"
        />
      </View>

      <View style={styles.guideRowCopy}>
        <Text style={styles.guideRowTitle}>
          {title}
        </Text>

        <Text style={styles.guideRowText}>
          {text}
        </Text>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={18}
        color="#98A09B"
      />
    </View>
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
          size={19}
          color="#0B4E3E"
        />
      </View>

      <View style={styles.recentCopy}>
        <Text style={styles.recentTitle}>
          {scan.title}
        </Text>

        <Text style={styles.recentTime}>
          {scan.timeLabel}
        </Text>
      </View>

      <View style={styles.recentScore}>
        <Text style={styles.scoreValue}>
          {scan.score.toFixed(1)}
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
  center = false,
  onPress,
}: {
  icon: IconName;
  label: string;
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
          center && styles.centerBottomIcon,
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={center ? 20 : 17}
          color="#DDF8E7"
        />
      </View>

      <Text style={styles.bottomLabel}>
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
        size={18}
        color="rgba(255,255,255,0.48)"
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
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingBottom: 8,
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
    fontSize: 24,
    letterSpacing: -0.8,
  },
  heroCopy: {
    paddingHorizontal: 24,
    maxWidth: 350,
  },
  heroKicker: {
    fontFamily: "Poppins_600SemiBold",
    color: "#D7F7E2",
    fontSize: 9,
    letterSpacing: 1.3,
    marginBottom: 11,
  },
  heroTitle: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -1.1,
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
    minWidth: 138,
    height: 48,
    paddingHorizontal: 17,
    borderRadius: 26,
    backgroundColor: "#0B4E3E",
    marginTop: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  scanButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 10,
    letterSpacing: 1,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 37,
    marginBottom: 18,
  },
  metric: {
    minWidth: 102,
  },
  metricValue: {
    fontFamily: "Poppins_700Bold",
    color: "#064B3D",
    fontSize: 37,
    lineHeight: 41,
    letterSpacing: -1,
  },
  metricLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "#7B817C",
    fontSize: 8,
    letterSpacing: 1.8,
    marginTop: 7,
  },
  metricLine: {
    width: 45,
    height: 4,
    backgroundColor: "#F2D34D",
    marginTop: 15,
  },
  weeklyCard: {
    width: "100%",
    padding: 12,
    marginBottom: 29,
    borderRadius: 15,
    backgroundColor: "#EEF7F0",
    borderWidth: 1,
    borderColor: "#D8EBDC",
  },
  weeklyTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weeklyLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  weeklyIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  weeklyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#1E2824",
    fontSize: 12,
    marginLeft: 9,
  },
  weeklySubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "#748078",
    fontSize: 9,
    marginTop: 1,
    marginLeft: 9,
  },
  weeklyPercent: {
    fontFamily: "Poppins_700Bold",
    color: "#0B4E3E",
    fontSize: 13,
  },
  weeklyTrack: {
    height: 5,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 10,
    backgroundColor: "#CEE3D3",
  },
  weeklyValue: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#0B4E3E",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#1D2421",
    fontSize: 24,
    letterSpacing: -0.5,
  },
  sectionAction: {
    fontFamily: "Poppins_600SemiBold",
    color: "#0B4E3E",
    fontSize: 9,
    letterSpacing: 1.25,
  },
  pathwayList: {
    gap: 10,
    paddingRight: 24,
  },
  pathwayCard: {
    width: 195,
    height: 215,
    overflow: "hidden",
    borderRadius: 15,
    backgroundColor: "#DDE3E0",
  },
  activePathwayCard: {
    shadowColor: "#0B4E3E",
    shadowOpacity: 0.17,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
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
    padding: 12,
  },
  pathwayTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pathwayIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(224,245,231,0.97)",
  },
  pathwayTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 21,
  },
  pathwaySubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "#F5FFF7",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
    maxWidth: 175,
  },
  indicators: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 10,
  },
  indicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#C5CCC8",
  },
  activeIndicator: {
    width: 20,
    backgroundColor: "#0B4E3E",
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 12,
    marginTop: 24,
    borderRadius: 17,
    backgroundColor: "#F5EFE3",
    borderWidth: 1,
    borderColor: "#E8DCC5",
  },
  streakIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE1B0",
  },
  streakCopy: {
    flex: 1,
    marginLeft: 10,
  },
  streakTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#3F3524",
    fontSize: 13,
  },
  streakText: {
    fontFamily: "Poppins_400Regular",
    color: "#7B6B50",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },
  streakArrow: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B86B17",
  },
  guideCard: {
    width: "100%",
    marginTop: 13,
    padding: 12,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E7E2",
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  guideIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5F4E8",
  },
  guideCopy: {
    flex: 1,
    marginLeft: 10,
  },
  guideTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#1E2824",
    fontSize: 13,
  },
  guideSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "#7A847E",
    fontSize: 10,
    marginTop: 2,
  },
  guideChevron: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F1",
  },
  guideDetails: {
    marginTop: 12,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: "#EDF0ED",
  },
  guideRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0EE",
  },
  guideRowIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  guideRowCopy: {
    flex: 1,
    marginLeft: 9,
  },
  guideRowTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#24302A",
    fontSize: 11,
  },
  guideRowText: {
    fontFamily: "Poppins_400Regular",
    color: "#78827C",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 34,
    marginBottom: 10,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 69,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E5E1",
  },
  recentIcon: {
    width: 41,
    height: 41,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF0ED",
  },
  recentCopy: {
    flex: 1,
    marginLeft: 12,
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
    padding: 11,
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
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B4E3E",
  },
  footerWrapper: {
    position: "absolute",
    left: 27,
    right: 27,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 58,
    paddingHorizontal: 2,
    overflow: "hidden",
    borderRadius: 31,
    borderWidth: 1,
    borderColor: "rgba(182,237,200,0.32)",
    backgroundColor: "rgba(6,61,47,0.88)",
    shadowColor: "#002A1F",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 9,
  },
  bottomItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 42,
  },
  bottomIcon: {
    width: 29,
    height: 29,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(191,238,205,0.18)",
    borderWidth: 1,
    borderColor: "rgba(221,248,231,0.2)",
  },
  centerBottomIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#167854",
    borderColor: "rgba(221,248,231,0.42)",
  },
  bottomLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "#DDF8E7",
    fontSize: 7,
    letterSpacing: 0.25,
    marginTop: 1,
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
    top: 0,
    bottom: 0,
    left: 0,
    width: "82%",
    paddingHorizontal: 20,
    backgroundColor: "#083D31",
    shadowColor: "#000000",
    shadowOpacity: 0.28,
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
    fontSize: 22,
  },
  menuSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "#B9D8C6",
    fontSize: 9,
    marginTop: 2,
  },
  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  menuProfile: {
    flexDirection: "row",
    alignItems: "center",
    padding: 11,
    marginTop: 24,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  menuAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#CBECD6",
  },
  menuAvatarText: {
    fontFamily: "Poppins_700Bold",
    color: "#0B4E3E",
    fontSize: 17,
  },
  menuProfileCopy: {
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
    letterSpacing: 1.5,
    marginTop: 26,
    marginBottom: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 60,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  menuItemIcon: {
    width: 36,
    height: 36,
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
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: 13,
    marginTop: 24,
    backgroundColor: "#0F624D",
  },
  syncButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 11,
  },
  menuFooterText: {
    marginTop: "auto",
    fontFamily: "Poppins_400Regular",
    color: "#9BC7AD",
    fontSize: 9,
    lineHeight: 14,
    maxWidth: 220,
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