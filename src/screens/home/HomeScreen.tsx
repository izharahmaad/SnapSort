import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import {
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Button,
  Text,
} from "react-native-paper";
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

type Pathway = {
  title: string;
  subtitle: string;
  icon: IconName;
  image: number;
};

type RecentScan = {
  id: string;
  title: string;
  category: string;
  score: string;
  icon: IconName;
  time: string;
};

const heroImage = require("../../../assets/images/hero-leaf.png");

const pathways: Pathway[] = [
  {
    title: "Recycle",
    subtitle: "Transform waste into new beginnings.",
    icon: "recycle",
    image: heroImage,
  },
  {
    title: "Reuse",
    subtitle: "Give useful things another life.",
    icon: "refresh",
    image: heroImage,
  },
  {
    title: "Compost",
    subtitle: "Return natural materials to the earth.",
    icon: "leaf",
    image: heroImage,
  },
  {
    title: "Dispose",
    subtitle: "Choose the safest final destination.",
    icon: "delete-outline",
    image: heroImage,
  },
];

const recentScans: RecentScan[] = [
  {
    id: "coffee-cup",
    title: "Coffee Cup",
    category: "COMPOSTABLE",
    score: "9.2",
    icon: "coffee-outline",
    time: "TODAY, 08:30 AM",
  },
  {
    id: "pet-bottle",
    title: "PET Bottle",
    category: "RECYCLABLE",
    score: "7.5",
    icon: "bottle-soda-outline",
    time: "YESTERDAY, 02:15 PM",
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

export default function HomeScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activePathway, setActivePathway] =
    useState("Recycle");

  const firstName = getFirstName(user?.displayName);

  const averageScore = useMemo(() => {
    if (recentScans.length === 0) {
      return "0.0";
    }

    const total = recentScans.reduce(
      (sum, scan) => sum + Number(scan.score),
      0
    );

    return (total / recentScans.length).toFixed(1);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <MaterialCommunityIcons
            name="account-lock-outline"
            size={44}
            color={colors.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>
          Sign in to continue
        </Text>

        <Text style={styles.emptyDescription}>
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
            paddingBottom: insets.bottom + 112,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={heroImage}
          style={[
            styles.hero,
            {
              paddingTop: Math.max(insets.top, 22),
            },
          ]}
          imageStyle={styles.heroImage}
        >
          <LinearGradient
            colors={[
              "rgba(3,35,25,0.74)",
              "rgba(3,35,25,0.20)",
              "rgba(3,35,25,0.86)",
            ]}
            locations={[0, 0.43, 1]}
            style={styles.heroOverlay}
          >
            <View style={styles.topBar}>
              <Pressable
                style={styles.topIconButton}
                onPress={() => navigation.navigate("Profile")}
              >
                <MaterialCommunityIcons
                  name="menu"
                  size={25}
                  color="#FFFFFF"
                />
              </Pressable>

              <Text style={styles.brand}>
                SnapSort
              </Text>

              <Pressable
                style={styles.topIconButton}
                onPress={() => navigation.navigate("Profile")}
              >
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={23}
                  color="#FFFFFF"
                />

                <View style={styles.notificationDot} />
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
                Every scan is a step towards a more regenerative
                future. Discover the hidden lifecycle of your
                everyday items.
              </Text>

              <Button
                mode="contained"
                icon="camera-outline"
                buttonColor="#0B4E3E"
                textColor="#FFFFFF"
                onPress={() => navigation.navigate("Camera")}
                style={styles.heroButton}
                contentStyle={styles.heroButtonContent}
                labelStyle={styles.heroButtonLabel}
              >
                Scan an item
              </Button>
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

          <View style={styles.pathwayIndicator}>
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

          <View style={styles.recentList}>
            {recentScans.map((scan) => (
              <RecentScanRow
                key={scan.id}
                scan={scan}
              />
            ))}
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <MaterialCommunityIcons
                name="lightbulb-on-outline"
                size={23}
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
              size={20}
              color="#A96E14"
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomNavWrapper,
          {
            bottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View style={styles.bottomNav}>
          <BottomNavItem
            icon="home-variant"
            label="Home"
            active
            onPress={() => undefined}
          />

          <BottomNavItem
            icon="camera-outline"
            label="Scan"
            onPress={() => navigation.navigate("Camera")}
          />

          <BottomNavItem
            icon="clipboard-text-outline"
            label="Missions"
            onPress={() => navigation.navigate("History")}
          />

          <BottomNavItem
            icon="chart-line"
            label="Impact"
            onPress={() => navigation.navigate("History")}
          />
        </View>
      </View>
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
  pathway: Pathway;
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
            "rgba(0,0,0,0.02)",
            "rgba(0,0,0,0.18)",
            "rgba(0,0,0,0.84)",
          ]}
          style={styles.pathwayOverlay}
        >
          <View style={styles.pathwayTop}>
            <View style={styles.pathwayIcon}>
              <MaterialCommunityIcons
                name={pathway.icon}
                size={21}
                color="#0B4E3E"
              />
            </View>

            <MaterialCommunityIcons
              name="arrow-top-right"
              size={21}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.pathwayCopy}>
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
  scan: RecentScan;
}) {
  return (
    <View style={styles.recentRow}>
      <View style={styles.recentItemIcon}>
        <MaterialCommunityIcons
          name={scan.icon}
          size={21}
          color="#0B4E3E"
        />
      </View>

      <View style={styles.recentItemContent}>
        <Text style={styles.recentItemTitle}>
          {scan.title}
        </Text>

        <Text style={styles.recentItemTime}>
          {scan.time}
        </Text>
      </View>

      <View style={styles.recentItemScore}>
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

function BottomNavItem({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
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
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={active ? "#FFFFFF" : "#7D8784"}
        />
      </View>

      <Text
        style={[
          styles.bottomNavLabel,
          active && styles.activeBottomNavLabel,
        ]}
      >
        {label}
      </Text>
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
  topIconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F6D455",
  },
  brand: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 27,
    letterSpacing: -0.8,
  },
  heroCopy: {
    maxWidth: 350,
  },
  heroKicker: {
    fontFamily: "Poppins_600SemiBold",
    color: "#D5F0E1",
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 13,
  },
  heroTitle: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    fontSize: 39,
    lineHeight: 45,
    letterSpacing: -1,
  },
  heroDescription: {
    fontFamily: "Poppins_400Regular",
    color: "#F4FFF8",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    maxWidth: 335,
  },
  heroButton: {
    alignSelf: "flex-start",
    marginTop: 20,
    borderRadius: 14,
  },
  heroButtonContent: {
    height: 52,
    paddingHorizontal: 6,
  },
  heroButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 25,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 39,
    marginBottom: 43,
  },
  metric: {
    minWidth: 100,
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
    letterSpacing: 2.2,
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
    letterSpacing: -0.5,
  },
  sectionAction: {
    fontFamily: "Poppins_600SemiBold",
    color: "#0B4E3E",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  pathwayList: {
    gap: 12,
    paddingRight: 24,
  },
  pathwayCard: {
    width: 280,
    height: 400,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#DDE3E0",
  },
  activePathwayCard: {
    shadowColor: "#0B4E3E",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 7,
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
    padding: 17,
  },
  pathwayTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pathwayIcon: {
    width: 45,
    height: 45,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(222,244,230,0.92)",
  },
  pathwayCopy: {
    marginBottom: 3,
  },
  pathwayTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 28,
    letterSpacing: -0.6,
  },
  pathwaySubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "#F5FFF7",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 3,
    maxWidth: 235,
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
  recentItemIcon: {
    width: 47,
    height: 47,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF0ED",
  },
  recentItemContent: {
    flex: 1,
    marginLeft: 14,
  },
  recentItemTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#1E2824",
    fontSize: 15,
  },
  recentItemTime: {
    fontFamily: "Poppins_600SemiBold",
    color: "#858B86",
    fontSize: 9,
    letterSpacing: 1.1,
    marginTop: 4,
  },
  recentItemScore: {
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
    letterSpacing: 1.2,
    marginTop: 1,
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
    left: 24,
    right: 24,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 75,
    paddingHorizontal: 8,
    borderRadius: 39,
    backgroundColor: "rgba(255,255,255,0.97)",
    shadowColor: "#19372D",
    shadowOpacity: 0.14,
    shadowRadius: 18,
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
    width: 37,
    height: 37,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  activeBottomNavIcon: {
    backgroundColor: "#0B4E3E",
  },
  bottomNavLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "#89908B",
    fontSize: 9,
    letterSpacing: 0.8,
    marginTop: 3,
  },
  activeBottomNavLabel: {
    color: "#0B4E3E",
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
  emptyDescription: {
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