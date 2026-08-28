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
const CREAM = "#FFFEFA";
const FOREST = "#075C34";
const DEEP_FOREST = "#04331D";
const EMERALD = "#16824B";
const TEXT = "#17271D";
const MUTED = "#6D7B72";
const LIGHT_GREEN = "#EAF7EE";
const SOFT_GREEN = "#D8F0E0";
const LIGHT_GOLD = "#FFF3DB";
const GOLD = "#C98718";

export default function NotificationsScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  const [remindersEnabled, setRemindersEnabled] =
    useState(true);

  const [weeklySummaryEnabled, setWeeklySummaryEnabled] =
    useState(true);

  const [tipsEnabled, setTipsEnabled] =
    useState(false);

  const [updatesEnabled, setUpdatesEnabled] =
    useState(true);

  const [quietHoursEnabled, setQuietHoursEnabled] =
    useState(false);

  const handleReminderToggle = (value: boolean) => {
    setRemindersEnabled(value);

    if (value) {
      Alert.alert(
        "Reminders enabled",
        "SnapSort AI will remind you to make mindful disposal choices."
      );
    }
  };

  const showTimePickerMessage = () => {
    Alert.alert(
      "Reminder time",
      "Time selection can be connected here later. Your reminder is currently set for 7:00 PM."
    );
  };

  const showQuietHoursMessage = () => {
    Alert.alert(
      "Quiet hours",
      "Quiet hours can be configured here later. This setting will silence non-essential notifications during your selected time."
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
              22
            ),
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

          <View style={styles.topSpace} />
        </View>

        <View style={styles.headerContent}>
          <View style={styles.headerBell}>
            <MaterialCommunityIcons
              name="bell-ring-outline"
              size={31}
              color={WHITE}
            />
          </View>

          <Text style={styles.headerTitle}>
            Notifications
          </Text>

          <Text style={styles.headerSubtitle}>
            Stay on track with helpful reminders and updates.
          </Text>
        </View>

        <View style={styles.headerLeaf}>
          <MaterialCommunityIcons
            name="leaf"
            size={32}
            color="rgba(255,255,255,0.15)"
          />
        </View>

        <View style={styles.headerSprout}>
          <MaterialCommunityIcons
            name="sprout"
            size={21}
            color="rgba(255,255,255,0.15)"
          />
        </View>
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
        <View style={styles.reminderHeroCard}>
          <View style={styles.reminderHeroIcon}>
            <MaterialCommunityIcons
              name={
                remindersEnabled
                  ? "bell-ring-outline"
                  : "bell-off-outline"
              }
              size={24}
              color={WHITE}
            />
          </View>

          <View style={styles.reminderHeroCopy}>
            <Text style={styles.reminderHeroTitle}>
              {remindersEnabled
                ? "Your reminders are active"
                : "Your reminders are paused"}
            </Text>

            <Text style={styles.reminderHeroText}>
              {remindersEnabled
                ? "A small reminder can help build greener habits."
                : "Turn on reminders whenever you need a little nudge."}
            </Text>
          </View>
        </View>

        <SectionHeader
          label="REMINDERS"
          title="Stay mindful"
        />

        <View style={styles.settingsCard}>
          <NotificationRow
            icon="bell-ring-outline"
            title="Daily sorting reminder"
            subtitle="A gentle reminder to sort responsibly"
            value={remindersEnabled}
            onValueChange={handleReminderToggle}
          />

          <Divider />

          <Pressable
            style={styles.timeRow}
            onPress={showTimePickerMessage}
            disabled={!remindersEnabled}
            accessibilityRole="button"
            accessibilityLabel="Change reminder time"
          >
            <View
              style={[
                styles.rowIcon,
                !remindersEnabled && styles.disabledIcon,
              ]}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={18}
                color={
                  remindersEnabled
                    ? FOREST
                    : "#A6B3AA"
                }
              />
            </View>

            <View style={styles.rowCopy}>
              <Text
                style={[
                  styles.rowTitle,
                  !remindersEnabled && styles.disabledText,
                ]}
              >
                Reminder time
              </Text>

              <Text
                style={[
                  styles.rowSubtitle,
                  !remindersEnabled && styles.disabledText,
                ]}
              >
                Every day at 7:00 PM
              </Text>
            </View>

            <View
              style={[
                styles.timeBadge,
                !remindersEnabled &&
                  styles.disabledTimeBadge,
              ]}
            >
              <Text
                style={[
                  styles.timeBadgeText,
                  !remindersEnabled &&
                    styles.disabledTimeBadgeText,
                ]}
              >
                7:00 PM
              </Text>
            </View>
          </Pressable>
        </View>

        <SectionHeader
          label="ACTIVITY"
          title="Your SnapSort updates"
        />

        <View style={styles.settingsCard}>
          <NotificationRow
            icon="chart-line"
            title="Weekly impact summary"
            subtitle="See your weekly sustainable progress"
            value={weeklySummaryEnabled}
            onValueChange={setWeeklySummaryEnabled}
          />

          <Divider />

          <NotificationRow
            icon="lightbulb-outline"
            title="Smart sorting tips"
            subtitle="Helpful disposal and recycling tips"
            value={tipsEnabled}
            onValueChange={setTipsEnabled}
          />

          <Divider />

          <NotificationRow
            icon="update"
            title="App updates"
            subtitle="Important SnapSort AI improvements"
            value={updatesEnabled}
            onValueChange={setUpdatesEnabled}
          />
        </View>

        <SectionHeader
          label="PREFERENCES"
          title="Control your interruptions"
        />

        <View style={styles.settingsCard}>
          <Pressable
            style={styles.timeRow}
            onPress={showQuietHoursMessage}
            accessibilityRole="button"
            accessibilityLabel="Configure quiet hours"
          >
            <View
              style={[
                styles.rowIcon,
                quietHoursEnabled &&
                  styles.quietHoursActiveIcon,
              ]}
            >
              <MaterialCommunityIcons
                name="weather-night"
                size={18}
                color={
                  quietHoursEnabled
                    ? GOLD
                    : FOREST
                }
              />
            </View>

            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>
                Quiet hours
              </Text>

              <Text style={styles.rowSubtitle}>
                {quietHoursEnabled
                  ? "10:00 PM to 8:00 AM"
                  : "Notifications can arrive anytime"}
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={MUTED}
            />
          </Pressable>

          <Divider />

          <NotificationRow
            icon="volume-high"
            title="Notification sounds"
            subtitle="Play sound for important reminders"
            value={quietHoursEnabled}
            onValueChange={setQuietHoursEnabled}
            switchLabel="Toggle quiet hours"
          />
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <MaterialCommunityIcons
              name="leaf"
              size={20}
              color={FOREST}
            />
          </View>

          <View style={styles.tipCopy}>
            <Text style={styles.tipTitle}>
              Keep it helpful
            </Text>

            <Text style={styles.tipText}>
              SnapSort AI notifications are designed to be useful,
              simple, and easy to control.
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          You can change these preferences at any time.
        </Text>
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

function NotificationRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  switchLabel,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  switchLabel?: string;
}) {
  return (
    <View style={styles.notificationRow}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={FOREST}
        />
      </View>

      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>
          {title}
        </Text>

        <Text style={styles.rowSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: "#D7E1D9",
          true: "#91D5A7",
        }}
        thumbColor={value ? FOREST : "#FFFFFF"}
        ios_backgroundColor="#D7E1D9"
        accessibilityLabel={switchLabel || title}
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
    backgroundColor: CREAM,
  },

  header: {
    minHeight: 250,
    overflow: "hidden",
    paddingHorizontal: 20,
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
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandIcon: {
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

  topSpace: {
    width: 43,
    height: 43,
  },

  headerContent: {
    alignItems: "center",
    marginTop: 22,
  },

  headerBell: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
  },

  headerTitle: {
    fontFamily: "Poppins_700Bold",
    color: WHITE,
    fontSize: 26,
    marginTop: 12,
  },

  headerSubtitle: {
    maxWidth: 290,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.82)",
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 3,
  },

  headerLeaf: {
    position: "absolute",
    right: 25,
    bottom: 24,
    width: 63,
    height: 63,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  headerSprout: {
    position: "absolute",
    left: 33,
    bottom: 26,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  reminderHeroCard: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 22,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#C9E8D1",
  },

  reminderHeroIcon: {
    width: 47,
    height: 47,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },

  reminderHeroCopy: {
    flex: 1,
    marginLeft: 11,
  },

  reminderHeroTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
  },

  reminderHeroText: {
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
    letterSpacing: 1.2,
  },

  sectionTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 16,
    marginTop: 2,
  },

  settingsCard: {
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "#E3ECE5",
  },

  notificationRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
  },

  timeRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
  },

  rowIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  quietHoursActiveIcon: {
    backgroundColor: LIGHT_GOLD,
  },

  disabledIcon: {
    backgroundColor: "#F0F3F0",
  },

  rowCopy: {
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

  disabledText: {
    color: "#A6B3AA",
  },

  timeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 13,
    backgroundColor: LIGHT_GREEN,
  },

  timeBadgeText: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 9,
  },

  disabledTimeBadge: {
    backgroundColor: "#F0F3F0",
  },

  disabledTimeBadgeText: {
    color: "#A6B3AA",
  },

  divider: {
    height: 1,
    marginLeft: 49,
    backgroundColor: "#E6EEE7",
  },

  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginTop: 24,
    borderRadius: 22,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#C9E8D1",
  },

  tipIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  tipCopy: {
    flex: 1,
    marginLeft: 10,
  },

  tipTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
  },

  tipText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },

  footerText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    textAlign: "center",
    marginTop: 18,
  },
});