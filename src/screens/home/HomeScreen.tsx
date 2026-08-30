import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ImageBackground,
  Modal,
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
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/auth.store";
import { getUserScans } from "../../services/firebase/scans.service";

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

const WHITE = "#FFFFFF";
const BACKGROUND = "#F8FBF8";
const FOREST = "#075C34";
const DARK_FOREST = "#053D23";
const TEXT = "#17271D";
const MUTED = "#6D7B72";
const LIGHT_GREEN = "#EAF7EE";
const PALE_GREEN = "#F1FAF3";
const GOLD = "#C98718";
const LIGHT_GOLD = "#FFF3DB";
const BORDER = "#E1EBE3";

const heroImage = require(
  "../../../assets/images/hero-leaf.png"
);

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
) {
  const name = displayName?.trim();

  if (!name) {
    return "there";
  }

  return name.split(/\s+/)[0];
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
      "Review"
  ).toUpperCase();
}

function getScanScore(scan: any): number {
  const score = Number(
    scan.ecoScore ??
      scan.score ??
      scan.sustainabilityScore ??
      0
  );

  return Number.isFinite(score)
    ? Math.max(0, Math.min(10, score))
    : 0;
}

function getScanDate(value: any): Date | null {
  if (
    value &&
    typeof value === "object" &&
    typeof value.toDate === "function"
  ) {
    const date = value.toDate();

    return date instanceof Date ? date : null;
  }

  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function getTimeLabel(date: Date | null): string {
  if (!date) {
    return "RECENTLY";
  }

  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `TODAY, ${date
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      .toUpperCase()}`;
  }

  return date
    .toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

function getScanIcon(
  category: string
): IconName {
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

  if (value.includes("hazard")) {
    return "alert-outline";
  }

  if (value.includes("donat")) {
    return "gift-outline";
  }

  return "delete-outline";
}

function getStartOfWeek(): Date {
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

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [isGuideOpen, setIsGuideOpen] =
    useState(false);

  const [activePathway, setActivePathway] =
    useState("Recycle");

  const [allScans, setAllScans] =
    useState<ScanItem[]>([]);

  const firstName = getFirstName(user?.displayName);

  const loadScans = useCallback(async () => {
    if (!user) {
      setAllScans([]);
      return;
    }

    try {
      const scans = await getUserScans(user.uid);

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
        const firstTime =
          first.date?.getTime() || 0;

        const secondTime =
          second.date?.getTime() || 0;

        return secondTime - firstTime;
      });

      setAllScans(formattedScans);
    } catch {
      setAllScans([]);
    }
  }, [user]);

  useEffect(() => {
    void loadScans();
  }, [loadScans]);

  const recentScans = useMemo(
    () => allScans.slice(0, 3),
    [allScans]
  );

  const weeklyScans = useMemo(() => {
    const weekStart = getStartOfWeek();

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
            color={FOREST}
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
          buttonColor={FOREST}
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshDashboard}
            tintColor={WHITE}
            colors={[FOREST]}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 106,
          },
        ]}
      >
        <ImageBackground
          source={heroImage}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <LinearGradient
            colors={[
              "rgba(3,32,24,0.30)",
              "rgba(3,32,24,0.04)",
              "rgba(3,32,24,0.90)",
            ]}
            locations={[0, 0.42, 1]}
            style={styles.heroOverlay}
          >
            <View
              style={[
                styles.topBar,
                {
                  paddingTop: Math.max(
                    insets.top,
                    10
                  ),
                },
              ]}
            >
              <Pressable
                style={styles.headerButton}
                onPress={() => setIsMenuOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Open menu"
              >
                <MaterialCommunityIcons
                  name="menu"
                  size={25}
                  color={WHITE}
                />
              </Pressable>

              <Text style={styles.brand}>
                SnapSort AI
              </Text>

              <Pressable
                style={styles.headerButton}
                onPress={() =>
                  navigation.navigate("Profile")
                }
                accessibilityRole="button"
                accessibilityLabel="Open profile"
              >
                <MaterialCommunityIcons
                  name="account-circle-outline"
                  size={25}
                  color={WHITE}
                />
              </Pressable>
            </View>

            <View style={styles.heroCopy}>
              <Text style={styles.heroKicker}>
                WELCOME BACK, {firstName.toUpperCase()}
              </Text>

              <Text style={styles.heroTitle}>
                Your footprint,
                {"\n"}
                evolved.
              </Text>

              <Text style={styles.heroDescription}>
                Every scan is a step toward a more thoughtful
                future. Discover better choices for everyday items.
              </Text>

              <Pressable
                style={styles.scanButton}
                onPress={() => navigation.navigate("Camera")}
                accessibilityRole="button"
                accessibilityLabel="Scan an item"
              >
                <MaterialCommunityIcons
                  name="camera-outline"
                  size={21}
                  color={WHITE}
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

            <View style={styles.metricsDivider} />

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
                    color={FOREST}
                  />
                </View>

                <View>
                  <Text style={styles.weeklyTitle}>
                    This week
                  </Text>

                  <Text style={styles.weeklySubtitle}>
                    {weeklyScans} of {weeklyGoal} scans completed
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
              accessibilityRole="button"
              accessibilityLabel="View scan history"
            >
              <Text style={styles.sectionAction}>
                VIEW HISTORY
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
                active={
                  activePathway === pathway.title
                }
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
            accessibilityRole="button"
            accessibilityLabel="Scan an item and build your streak"
          >
            <View style={styles.streakIcon}>
              <MaterialCommunityIcons
                name="fire"
                size={20}
                color={GOLD}
              />
            </View>

            <View style={styles.streakCopy}>
              <Text style={styles.streakTitle}>
                Build your eco streak
              </Text>

              <Text style={styles.streakText}>
                Scan one item today and keep your habit growing.
              </Text>
            </View>

            <View style={styles.streakArrow}>
              <MaterialCommunityIcons
                name="arrow-right"
                size={16}
                color={WHITE}
              />
            </View>
          </Pressable>

          <Pressable
            style={styles.guideCard}
            onPress={() => setIsGuideOpen((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel="Open quick disposal guide"
          >
            <View style={styles.guideHeader}>
              <View style={styles.guideIcon}>
                <MaterialCommunityIcons
                  name="book-open-variant"
                  size={19}
                  color={FOREST}
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
                  color={FOREST}
                />
              </View>
            </View>

            {isGuideOpen ? (
              <View style={styles.guideDetails}>
                <GuideRow
                  icon="recycle"
                  title="Recycle"
                  text="Clean and sort accepted materials."
                  color={LIGHT_GREEN}
                />

                <GuideRow
                  icon="refresh"
                  title="Reuse"
                  text="Repair, donate, refill, or repurpose."
                  color={LIGHT_GOLD}
                />

                <GuideRow
                  icon="leaf"
                  title="Compost"
                  text="Return approved natural materials to soil."
                  color="#EEF0D9"
                />
              </View>
            ) : null}
          </Pressable>

          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>
              Recent scans
            </Text>

            <Pressable
              onPress={() => navigation.navigate("History")}
              accessibilityRole="button"
              accessibilityLabel="Open scan history"
            >
              <Text style={styles.sectionAction}>
                VIEW ALL
              </Text>
            </Pressable>
          </View>

          {recentScans.length > 0 ? (
            <View style={styles.recentCard}>
              {recentScans.map((scan, index) => (
                <View key={scan.id}>
                  <RecentScanRow scan={scan} />

                  {index < recentScans.length - 1 ? (
                    <View style={styles.recentDivider} />
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyRecent}>
              <View style={styles.recentIcon}>
                <MaterialCommunityIcons
                  name="camera-outline"
                  size={20}
                  color={FOREST}
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
                onPress={() =>
                  navigation.navigate("Camera")
                }
                accessibilityRole="button"
                accessibilityLabel="Scan your first item"
              >
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={17}
                  color={WHITE}
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
            bottom: Math.max(
              insets.bottom + 8,
              14
            ),
          },
        ]}
      >
        <BlurView
          intensity={90}
          tint="light"
          style={styles.footer}
        >
          <BottomItem
            icon="home-variant"
            label="Home"
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
            onPress={() =>
              navigation.navigate("WasteJournal")
            }
          />

          <BottomItem
            icon="account-outline"
            label="Profile"
            onPress={() => navigation.navigate("Profile")}
          />
        </BlurView>
      </View>

      <Modal
        visible={isMenuOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View style={styles.menuLayer}>
          <Pressable
            style={styles.menuBackdrop}
            onPress={() => setIsMenuOpen(false)}
          />

          <View
            style={[
              styles.sideMenu,
              {
                paddingTop: Math.max(
                  insets.top + 16,
                  30
                ),
                paddingBottom: Math.max(
                  insets.bottom + 18,
                  28
                ),
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
                accessibilityRole="button"
                accessibilityLabel="Close menu"
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={WHITE}
                />
              </Pressable>
            </View>

            <Pressable
              style={styles.menuProfile}
              onPress={() => openScreen("Profile")}
              accessibilityRole="button"
              accessibilityLabel="Open profile"
            >
              <View style={styles.menuAvatar}>
                <Text style={styles.menuAvatarText}>
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.menuProfileCopy}>
                <Text
                  style={styles.menuName}
                  numberOfLines={1}
                >
                  {user.displayName || "SnapSort user"}
                </Text>

                <Text
                  style={styles.menuEmail}
                  numberOfLines={1}
                >
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
              subtitle="Review saved results"
              onPress={() => openScreen("History")}
            />

            <MenuItem
              icon="chart-line"
              title="Waste Journal"
              subtitle="Review your progress"
              onPress={() => openScreen("WasteJournal")}
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
              accessibilityRole="button"
              accessibilityLabel="Refresh dashboard"
            >
              <MaterialCommunityIcons
                name="refresh"
                size={18}
                color={WHITE}
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
      </Modal>
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
      accessibilityRole="button"
      accessibilityLabel={`Scan an item to ${pathway.title.toLowerCase()}`}
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
            "rgba(0,0,0,0.84)",
          ]}
          style={styles.pathwayOverlay}
        >
          <View style={styles.pathwayTop}>
            <View style={styles.pathwayIcon}>
              <MaterialCommunityIcons
                name={pathway.icon}
                size={18}
                color={FOREST}
              />
            </View>

            <MaterialCommunityIcons
              name="arrow-top-right"
              size={17}
              color={WHITE}
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
          color={FOREST}
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
          color={FOREST}
        />
      </View>

      <View style={styles.recentCopy}>
        <Text
          style={styles.recentTitle}
          numberOfLines={1}
        >
          {scan.title}
        </Text>

        <Text
          style={styles.recentTime}
          numberOfLines={1}
        >
          {scan.timeLabel}
        </Text>
      </View>

      <View style={styles.recentScore}>
        <Text style={styles.recentScoreValue}>
          {scan.score.toFixed(1)}
        </Text>

        <Text style={styles.recentScoreLabel}>
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
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={styles.bottomItem}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.bottomIcon,
          center && styles.centerBottomIcon,
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={center ? 21 : 17}
          color={WHITE}
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
      accessibilityRole="button"
      accessibilityLabel={title}
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
    backgroundColor: BACKGROUND,
  },

  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  scrollContent: {
    backgroundColor: BACKGROUND,
  },

  hero: {
    height: 525,
    overflow: "hidden",
  },

  heroImage: {
    resizeMode: "cover",
  },

  heroOverlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 31,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.14)",
  },

  brand: {
    fontFamily: "Poppins_700Bold",
    color: WHITE,
    fontSize: 21,
    letterSpacing: -0.5,
  },

  heroCopy: {
    maxWidth: 350,
    paddingHorizontal: 24,
  },

  heroKicker: {
    fontFamily: "Poppins_600SemiBold",
    color: "#D7F7E2",
    fontSize: 9,
    letterSpacing: 1.3,
    marginBottom: 10,
  },

  heroTitle: {
    fontFamily: "Poppins_700Bold",
    color: WHITE,
    fontSize: 37,
    lineHeight: 44,
    letterSpacing: -1.1,
  },

  heroDescription: {
    maxWidth: 320,
    fontFamily: "Poppins_400Regular",
    color: "#F2FFF6",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 12,
  },

  scanButton: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 17,
    marginTop: 18,
    borderRadius: 25,
    backgroundColor: FOREST,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.34)",
  },

  scanButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 10,
    letterSpacing: 1,
    marginLeft: 8,
  },

  body: {
    paddingHorizontal: 22,
    paddingTop: 24,
  },

  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  metric: {
    flex: 1,
  },

  metricsDivider: {
    width: 1,
    height: 48,
    marginHorizontal: 22,
    backgroundColor: "#D9E5DB",
  },

  metricValue: {
    fontFamily: "Poppins_700Bold",
    color: DARK_FOREST,
    fontSize: 32,
    lineHeight: 37,
    letterSpacing: -1,
  },

  metricLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: MUTED,
    fontSize: 8,
    letterSpacing: 1.25,
    marginTop: 3,
  },

  metricLine: {
    width: 38,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    backgroundColor: GOLD,
  },

  weeklyCard: {
    padding: 13,
    marginBottom: 28,
    borderRadius: 19,
    backgroundColor: PALE_GREEN,
    borderWidth: 1,
    borderColor: "#D8EBDC",
  },

  weeklyTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  weeklyLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  weeklyIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  weeklyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 12,
    marginLeft: 10,
  },

  weeklySubtitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: 1,
    marginLeft: 10,
  },

  weeklyPercent: {
    fontFamily: "Poppins_700Bold",
    color: FOREST,
    fontSize: 13,
  },

  weeklyTrack: {
    height: 5,
    overflow: "hidden",
    borderRadius: 4,
    marginTop: 11,
    backgroundColor: "#CEE3D3",
  },

  weeklyValue: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: FOREST,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  sectionTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 20,
    letterSpacing: -0.4,
  },

  sectionAction: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 9,
    letterSpacing: 1.1,
  },

  pathwayList: {
    paddingRight: 22,
  },

  pathwayCard: {
    width: 194,
    height: 214,
    overflow: "hidden",
    marginRight: 10,
    borderRadius: 18,
    backgroundColor: "#DDE3E0",
  },

  activePathwayCard: {
    borderWidth: 2,
    borderColor: FOREST,
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
    padding: 13,
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
    backgroundColor: "rgba(239,255,244,0.97)",
  },

  pathwayTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 21,
  },

  pathwaySubtitle: {
    maxWidth: 170,
    fontFamily: "Poppins_400Regular",
    color: "#F5FFF7",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },

  indicators: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 11,
  },

  indicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: "#C5CCC8",
  },

  activeIndicator: {
    width: 20,
    backgroundColor: FOREST,
  },

  streakCard: {
    minHeight: 75,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginTop: 24,
    borderRadius: 19,
    backgroundColor: "#FFF7E9",
    borderWidth: 1,
    borderColor: "#F0E0BF",
  },

  streakIcon: {
    width: 41,
    height: 41,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GOLD,
  },

  streakCopy: {
    flex: 1,
    marginLeft: 10,
  },

  streakTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#3F3524",
    fontSize: 12,
  },

  streakText: {
    fontFamily: "Poppins_400Regular",
    color: "#7B6B50",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },

  streakArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GOLD,
  },

  guideCard: {
    marginTop: 13,
    padding: 13,
    borderRadius: 19,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
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
    backgroundColor: LIGHT_GREEN,
  },

  guideCopy: {
    flex: 1,
    marginLeft: 10,
  },

  guideTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 12,
  },

  guideSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
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
    paddingTop: 3,
    borderTopWidth: 1,
    borderTopColor: "#EDF0ED",
  },

  guideRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
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
    color: TEXT,
    fontSize: 10,
  },

  guideRowText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 8,
    lineHeight: 13,
    marginTop: 1,
  },

  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 31,
    marginBottom: 11,
  },

  recentCard: {
    paddingHorizontal: 13,
    borderRadius: 19,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  recentRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
  },

  recentIcon: {
    width: 41,
    height: 41,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF5EF",
  },

  recentCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  recentTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 12,
  },

  recentTime: {
    fontFamily: "Poppins_600SemiBold",
    color: MUTED,
    fontSize: 7,
    letterSpacing: 0.9,
    marginTop: 3,
  },

  recentScore: {
    alignItems: "flex-end",
  },

  recentScoreValue: {
    fontFamily: "Poppins_700Bold",
    color: FOREST,
    fontSize: 18,
  },

  recentScoreLabel: {
    maxWidth: 68,
    fontFamily: "Poppins_600SemiBold",
    color: GOLD,
    fontSize: 7,
    letterSpacing: 0.8,
    textAlign: "right",
    marginTop: -1,
  },

  recentDivider: {
    height: 1,
    marginLeft: 51,
    backgroundColor: "#E7EEE8",
  },

  emptyRecent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 19,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  emptyRecentCopy: {
    flex: 1,
    marginLeft: 10,
  },

  emptyRecentTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 12,
  },

  emptyRecentText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: 2,
  },

  arrowButton: {
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },

  footerWrapper: {
    position: "absolute",
    left: 20,
    right: 20,
  },

  footer: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 3,
    overflow: "hidden",
    borderRadius: 31,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.86)",
    backgroundColor: "rgba(255,255,255,0.48)",
  },

  bottomItem: {
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomIcon: {
    width: 29,
    height: 29,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },

  centerBottomIcon: {
    width: 41,
    height: 41,
    borderRadius: 21,
    marginTop: -14,
    borderWidth: 2,
    borderColor: WHITE,
  },

  bottomLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 7,
    letterSpacing: 0.2,
    marginTop: 3,
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
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  menuBrand: {
    fontFamily: "Poppins_700Bold",
    color: WHITE,
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
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  menuAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#CBECD6",
  },

  menuAvatarText: {
    fontFamily: "Poppins_700Bold",
    color: FOREST,
    fontSize: 15,
  },

  menuProfileCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  menuName: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 11,
  },

  menuEmail: {
    fontFamily: "Poppins_400Regular",
    color: "#B9D8C6",
    fontSize: 8,
    marginTop: 2,
  },

  menuLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "#92C4A6",
    fontSize: 8,
    letterSpacing: 1.2,
    marginTop: 27,
    marginBottom: 8,
  },

  menuItem: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  menuItemIcon: {
    width: 37,
    height: 37,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  menuItemCopy: {
    flex: 1,
    marginLeft: 10,
  },

  menuItemTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 10,
  },

  menuItemSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "#B9D8C6",
    fontSize: 8,
    marginTop: 2,
  },

  syncButton: {
    height: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
    borderRadius: 24,
    backgroundColor: FOREST,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },

  syncButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 10,
    marginLeft: 7,
  },

  menuFooterText: {
    fontFamily: "Poppins_400Regular",
    color: "#A4C8B0",
    fontSize: 8,
    lineHeight: 13,
    textAlign: "center",
    marginTop: 17,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: BACKGROUND,
  },

  emptyIcon: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: LIGHT_GREEN,
  },

  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 18,
    textAlign: "center",
  },

  emptyText: {
    maxWidth: 290,
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 16,
  },
});