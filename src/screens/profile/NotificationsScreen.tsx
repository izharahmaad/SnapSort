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
      "Quiet hours are currently disabled. You can add time selection here later."
    );
  };

  return (
    <View style={styles.screen}>
      <View
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
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color={TEXT}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Notifications
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(
              insets.bottom + 28,
              36
            ),
          },
        ]}
      >
        <Text style={styles.pageTitle}>
          Stay in control
        </Text>

        <Text style={styles.pageDescription}>
          Choose the updates and reminders you would like
          to receive from SnapSort AI.
        </Text>

        <Text style={styles.sectionLabel}>
          REMINDERS
        </Text>

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

        <Text style={styles.sectionLabel}>
          ACTIVITY
        </Text>

        <View style={styles.card}>
          <ToggleRow
            icon="chart-line"
            title="Weekly impact summary"
            subtitle="See a weekly summary of your activity"
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
            subtitle="Important updates and improvements"
            value={productUpdates}
            onChange={setProductUpdates}
          />
        </View>

        <Text style={styles.sectionLabel}>
          PREFERENCES
        </Text>

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
            You can update these preferences anytime.
            Device notification permissions are managed
            in your phone settings.
          </Text>
        </View>
      </ScrollView>
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
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 15,
  },

  headerSpace: {
    width: 42,
    height: 42,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 26,
  },

  pageTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 24,
  },

  pageDescription: {
    maxWidth: 330,
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
  },

  sectionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: 26,
    marginBottom: 9,
    marginLeft: 2,
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