import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Notifications"
>;

type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

const WHITE = "#FFFFFF";
const BACKGROUND = "#FFFEFA";
const FOREST = "#075C34";
const DEEP_FOREST = "#04331D";
const EMERALD = "#16824B";
const TEXT = "#17271D";
const MUTED = "#6D7B72";
const LIGHT_GREEN = "#EAF7EE";
const BORDER = "#E2ECE4";

export default function NotificationsScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  const [dailyReminder, setDailyReminder] =
    useState(true);

  const [weeklySummary, setWeeklySummary] =
    useState(true);

  const [sortingTips, setSortingTips] =
    useState(false);

  const [productUpdates, setProductUpdates] =
    useState(true);

  const handleReminderTime = () => {
    Alert.alert(
      "Reminder time",
      "Your daily sorting reminder is currently scheduled for 7:00 PM."
    );
  };

  const handleQuietHours = () => {
    Alert.alert(
      "Quiet hours",
      "Quiet hours are currently disabled. You can connect a time selector here later."
    );
  };

  return (
    <View style={styles.screen}>
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
        <View style={styles.headerTopRow}>
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

          <Text style={styles.headerTitle}>
            Notifications
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.headerEyebrow}>
            PREFERENCES
          </Text>

          <Text style={styles.headerDescription}>
            Manage reminders, app updates, and helpful activity alerts.
          </Text>
        </View>

        <MaterialCommunityIcons
          name="bell-outline"
          size={72}
          color="rgba(255,255,255,0.10)"
          style={styles.headerIcon}
        />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(
              insets.bottom + 30,
              40
            ),
          },
        ]}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <MaterialCommunityIcons
              name="bell-ring-outline"
              size={20}
              color={FOREST}
            />
          </View>

          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>
              Notification preferences
            </Text>

            <Text style={styles.summaryText}>
              Choose which updates are helpful for you.
            </Text>
          </View>
        </View>

        <SectionHeader
          label="REMINDERS"
          title="Stay mindful"
        />

        <View style={styles.card}>
          <ToggleRow
            icon="bell-outline"
            title="Daily sorting reminder"
            subtitle="A reminder to make mindful disposal choices"
            value={dailyReminder}
            onChange={setDailyReminder}
          />

          <Divider />

          <Pressable
            style={[
              styles.pressableRow,
              !dailyReminder && styles.rowDisabled,
            ]}
            onPress={handleReminderTime}
            disabled={!dailyReminder}
            accessibilityRole="button"
            accessibilityLabel="Change reminder time"
          >
            <IconBox
              icon="clock-outline"
              disabled={!dailyReminder}
            />

            <View style={styles.rowText}>
              <Text
                style={[
                  styles.rowTitle,
                  !dailyReminder && styles.textDisabled,
                ]}
              >
                Reminder time
              </Text>

              <Text
                style={[
                  styles.rowSubtitle,
                  !dailyReminder && styles.textDisabled,
                ]}
              >
                Every day at 7:00 PM
              </Text>
            </View>

            <View
              style={[
                styles.timeBadge,
                !dailyReminder && styles.timeBadgeDisabled,
              ]}
            >
              <Text
                style={[
                  styles.timeText,
                  !dailyReminder && styles.timeTextDisabled,
                ]}
              >
                7:00 PM
              </Text>
            </View>
          </Pressable>
        </View>

        <SectionHeader
          label="ACTIVITY"
          title="SnapSort updates"
        />

        <View style={styles.card}>
          <ToggleRow
            icon="chart-line"
            title="Weekly impact summary"
            subtitle="Receive a summary of your activity"
            value={weeklySummary}
            onChange={setWeeklySummary}
          />

          <Divider />

          <ToggleRow
            icon="lightbulb-outline"
            title="Sorting tips"
            subtitle="Helpful tips for everyday items"
            value={sortingTips}
            onChange={setSortingTips}
          />

          <Divider />

          <ToggleRow
            icon="update"
            title="App updates"
            subtitle="Important product improvements"
            value={productUpdates}
            onChange={setProductUpdates}
          />
        </View>

        <SectionHeader
          label="PREFERENCES"
          title="Control interruptions"
        />

        <View style={styles.card}>
          <Pressable
            style={styles.pressableRow}
            onPress={handleQuietHours}
            accessibilityRole="button"
            accessibilityLabel="Configure quiet hours"
          >
            <IconBox icon="weather-night" />

            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>
                Quiet hours
              </Text>

              <Text style={styles.rowSubtitle}>
                Notifications can arrive anytime
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={MUTED}
            />
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons
            name="information-outline"
            size={18}
            color={FOREST}
          />

          <Text style={styles.infoText}>
            Device notification permissions can be managed
            from your phone settings at any time.
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

function ToggleRow({
  icon,
  title,
  subtitle,
  value,
  onChange,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <IconBox icon={icon} />

      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>
          {title}
        </Text>

        <Text style={styles.rowSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          false: "#D7E1D9",
          true: "#91D5A7",
        }}
        thumbColor={value ? FOREST : WHITE}
        ios_backgroundColor="#D7E1D9"
      />
    </View>
  );
}

function IconBox({
  icon,
  disabled = false,
}: {
  icon: IconName;
  disabled?: boolean;
}) {
  return (
    <View
      style={[
        styles.iconBox,
        disabled && styles.iconBoxDisabled,
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={disabled ? "#A5B1A8" : FOREST}
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  header: {
    minHeight: 165,
    overflow: "hidden",
    paddingHorizontal: 20,
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

  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 15,
  },

  headerSpace: {
    width: 42,
    height: 42,
  },

  headerContent: {
    maxWidth: 270,
    marginTop: 20,
  },

  headerEyebrow: {
    fontFamily: "Poppins_600SemiBold",
    color: "#D7F8E1",
    fontSize: 8,
    letterSpacing: 1.2,
  },

  headerDescription: {
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.82)",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  headerIcon: {
    position: "absolute",
    right: -8,
    bottom: -12,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 20,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  summaryCopy: {
    flex: 1,
    marginLeft: 10,
  },

  summaryTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
  },

  summaryText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: 2,
  },

  sectionHeader: {
    marginTop: 25,
    marginBottom: 9,
    marginLeft: 2,
  },

  sectionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 9,
    letterSpacing: 1.2,
  },

  sectionTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 16,
    marginTop: 2,
  },

  card: {
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  toggleRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
  },

  pressableRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
  },

  rowDisabled: {
    opacity: 0.55,
  },

  iconBox: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  iconBoxDisabled: {
    backgroundColor: "#F0F3F0",
  },

  rowText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  rowTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
  },

  rowSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: 2,
  },

  textDisabled: {
    color: "#A5B1A8",
  },

  timeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 13,
    backgroundColor: LIGHT_GREEN,
  },

  timeBadgeDisabled: {
    backgroundColor: "#F0F3F0",
  },

  timeText: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 9,
  },

  timeTextDisabled: {
    color: "#A5B1A8",
  },

  divider: {
    height: 1,
    marginLeft: 49,
    backgroundColor: "#E7EEE8",
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    marginTop: 24,
    borderRadius: 18,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#CBE8D3",
  },

  infoText: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    color: FOREST,
    fontSize: 9,
    lineHeight: 15,
    marginLeft: 8,
  },
});