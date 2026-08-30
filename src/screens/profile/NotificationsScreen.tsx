import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Notifications"
>;

const WHITE = "#FFFFFF";
const BACKGROUND = "#F8FBF8";
const FOREST = "#075C34";
const DARK_FOREST = "#053D23";
const TEXT = "#17271D";
const MUTED = "#6D7B72";
const LIGHT_GREEN = "#EAF7EE";
const PALE_GREEN = "#F1FAF3";
const BORDER = "#E1EBE3";

const REMINDER_NOTIFICATION_KEY =
  "snapsort-daily-reminder";

const REMINDER_TIME_STORAGE_KEY =
  "@snapsort/reminder-time";

const REMINDER_ENABLED_STORAGE_KEY =
  "@snapsort/reminder-enabled";

const ANDROID_CHANNEL_ID =
  "snapsort-reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotificationsScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  const [dailyReminder, setDailyReminder] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  const [reminderTime, setReminderTime] =
    useState(() => {
      const date = new Date();

      date.setHours(19);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);

      return date;
    });

  const formattedReminderTime = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(reminderTime),
    [reminderTime]
  );

  useEffect(() => {
    void initializeReminderSettings();
  }, []);

  const initializeReminderSettings = async () => {
    try {
      const [
        savedTime,
        savedEnabledValue,
        scheduledNotifications,
      ] = await Promise.all([
        AsyncStorage.getItem(
          REMINDER_TIME_STORAGE_KEY
        ),
        AsyncStorage.getItem(
          REMINDER_ENABLED_STORAGE_KEY
        ),
        Notifications.getAllScheduledNotificationsAsync(),
      ]);

      if (savedTime) {
        const parsedTime = new Date(savedTime);

        if (!Number.isNaN(parsedTime.getTime())) {
          setReminderTime(parsedTime);
        }
      }

      const scheduledReminderExists =
        scheduledNotifications.some(
          (notification) =>
            notification.content.data?.type ===
            REMINDER_NOTIFICATION_KEY
        );

      const storedEnabled =
        savedEnabledValue === "true";

      setDailyReminder(
        storedEnabled && scheduledReminderExists
      );
    } catch {
      setDailyReminder(false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveReminderEnabled = async (
    enabled: boolean
  ) => {
    await AsyncStorage.setItem(
      REMINDER_ENABLED_STORAGE_KEY,
      String(enabled)
    );
  };

  const saveReminderTime = async (date: Date) => {
    await AsyncStorage.setItem(
      REMINDER_TIME_STORAGE_KEY,
      date.toISOString()
    );
  };

  const ensureNotificationPermission = async () => {
    const permission =
      await Notifications.getPermissionsAsync();

    if (
      permission.granted ||
      permission.status === "granted"
    ) {
      return true;
    }

    const requestedPermission =
      await Notifications.requestPermissionsAsync();

    return (
      requestedPermission.granted ||
      requestedPermission.status === "granted"
    );
  };

  const createAndroidChannel = async () => {
    if (Platform.OS !== "android") {
      return;
    }

    await Notifications.setNotificationChannelAsync(
      ANDROID_CHANNEL_ID,
      {
        name: "SnapSort reminders",
        description:
          "Daily mindful disposal reminders from SnapSort AI",
        importance:
          Notifications.AndroidImportance.DEFAULT,
        sound: "default",
        vibrationPattern: [0, 250, 180, 250],
        lightColor: FOREST,
      }
    );
  };

  const cancelExistingReminder = async () => {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    const reminderNotifications =
      scheduledNotifications.filter(
        (notification) =>
          notification.content.data?.type ===
          REMINDER_NOTIFICATION_KEY
      );

    await Promise.all(
      reminderNotifications.map((notification) =>
        Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        )
      )
    );
  };

  const scheduleReminder = async (time: Date) => {
    await cancelExistingReminder();
    await createAndroidChannel();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "A small action can make a difference",
        body: "Scan an item and make a more mindful disposal choice today.",
        sound: "default",
        data: {
          type: REMINDER_NOTIFICATION_KEY,
        },
      },
      trigger: {
        type:
          Notifications.SchedulableTriggerInputTypes
            .DAILY,
        hour: time.getHours(),
        minute: time.getMinutes(),
        channelId:
          Platform.OS === "android"
            ? ANDROID_CHANNEL_ID
            : undefined,
      },
    });
  };

  const handleReminderToggle = async (
    enabled: boolean
  ) => {
    if (isLoading || isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      if (enabled) {
        const permissionGranted =
          await ensureNotificationPermission();

        if (!permissionGranted) {
          Alert.alert(
            "Notifications are disabled",
            "Allow notifications in your phone settings to receive daily SnapSort reminders."
          );

          setDailyReminder(false);
          await saveReminderEnabled(false);

          return;
        }

        await scheduleReminder(reminderTime);

        setDailyReminder(true);
        await saveReminderEnabled(true);

        Alert.alert(
          "Reminder enabled",
          `SnapSort AI will remind you each day at ${formattedReminderTime}.`
        );

        return;
      }

      await cancelExistingReminder();

      setDailyReminder(false);
      await saveReminderEnabled(false);
    } catch {
      Alert.alert(
        "Could not update reminder",
        "Please try again and check that notification permissions are enabled."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimeChange = async (
    _event: unknown,
    selectedTime?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (!selectedTime) {
      return;
    }

    const updatedTime = new Date(reminderTime);

    updatedTime.setHours(selectedTime.getHours());
    updatedTime.setMinutes(selectedTime.getMinutes());
    updatedTime.setSeconds(0);
    updatedTime.setMilliseconds(0);

    try {
      setIsSaving(true);
      setReminderTime(updatedTime);

      await saveReminderTime(updatedTime);

      if (dailyReminder) {
        await scheduleReminder(updatedTime);

        Alert.alert(
          "Reminder time updated",
          `Your daily reminder is now set for ${new Intl.DateTimeFormat(
            undefined,
            {
              hour: "numeric",
              minute: "2-digit",
            }
          ).format(updatedTime)}.`
        );
      }
    } catch {
      Alert.alert(
        "Could not update time",
        "Please try changing your reminder time again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.topNavigation,
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
            size={21}
            color={DARK_FOREST}
          />
        </Pressable>

        <Text style={styles.navigationTitle}>
          Notifications
        </Text>

        <View style={styles.navigationSpace} />
      </View>

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
        <View style={styles.heroSection}>
          <View style={styles.heroIconRing}>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons
                name={
                  dailyReminder
                    ? "bell-ring-outline"
                    : "bell-outline"
                }
                size={25}
                color={WHITE}
              />
            </View>
          </View>

          <Text style={styles.pageTitle}>
            Stay on track
          </Text>

          <Text style={styles.pageDescription}>
            Set one simple reminder to support mindful
            disposal choices every day.
          </Text>
        </View>

        <View
          style={[
            styles.statusCard,
            dailyReminder
              ? styles.statusCardActive
              : styles.statusCardInactive,
          ]}
        >
          <View
            style={[
              styles.statusIcon,
              dailyReminder
                ? styles.statusIconActive
                : styles.statusIconInactive,
            ]}
          >
            <MaterialCommunityIcons
              name={
                dailyReminder
                  ? "check-circle-outline"
                  : "information-outline"
              }
              size={19}
              color={
                dailyReminder
                  ? FOREST
                  : MUTED
              }
            />
          </View>

          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>
              {isLoading
                ? "Checking reminder settings..."
                : dailyReminder
                ? "Daily reminder is active"
                : "No daily reminder is scheduled"}
            </Text>

            <Text style={styles.statusText}>
              {dailyReminder
                ? `You will receive a reminder every day at ${formattedReminderTime}.`
                : "Turn on reminders whenever you want a gentle nudge."}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          DAILY REMINDER
        </Text>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons
                name="bell-ring-outline"
                size={18}
                color={FOREST}
              />
            </View>

            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>
                Sorting reminder
              </Text>

              <Text style={styles.settingSubtitle}>
                Receive one reminder each day.
              </Text>
            </View>

            <Switch
              value={dailyReminder}
              onValueChange={handleReminderToggle}
              disabled={isLoading || isSaving}
              trackColor={{
                false: "#D7E1D9",
                true: "#91D5A7",
              }}
              thumbColor={
                dailyReminder
                  ? FOREST
                  : WHITE
              }
              ios_backgroundColor="#D7E1D9"
            />
          </View>

          <Divider />

          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              !dailyReminder && styles.disabledRow,
              pressed &&
                dailyReminder &&
                styles.pressedRow,
            ]}
            onPress={() => setShowTimePicker(true)}
            disabled={
              !dailyReminder ||
              isLoading ||
              isSaving
            }
            accessibilityRole="button"
            accessibilityLabel="Change reminder time"
          >
            <View
              style={[
                styles.settingIcon,
                !dailyReminder &&
                  styles.disabledSettingIcon,
              ]}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={18}
                color={
                  dailyReminder
                    ? FOREST
                    : "#A5B1A8"
                }
              />
            </View>

            <View style={styles.settingCopy}>
              <Text
                style={[
                  styles.settingTitle,
                  !dailyReminder &&
                    styles.disabledText,
                ]}
              >
                Reminder time
              </Text>

              <Text
                style={[
                  styles.settingSubtitle,
                  !dailyReminder &&
                    styles.disabledText,
                ]}
              >
                Every day
              </Text>
            </View>

            <View
              style={[
                styles.timePill,
                !dailyReminder &&
                  styles.disabledTimePill,
              ]}
            >
              <Text
                style={[
                  styles.timePillText,
                  !dailyReminder &&
                    styles.disabledText,
                ]}
              >
                {formattedReminderTime}
              </Text>

              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={
                  dailyReminder
                    ? FOREST
                    : "#A5B1A8"
                }
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.privacyCard}>
          <View style={styles.privacyIcon}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={19}
              color={FOREST}
            />
          </View>

          <View style={styles.privacyCopy}>
            <Text style={styles.privacyTitle}>
              Private by design
            </Text>

            <Text style={styles.privacyText}>
              This reminder is scheduled locally on your device.
              You can disable it at any time.
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          Notification permission is managed in your device settings.
        </Text>
      </ScrollView>

      {showTimePicker ? (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          is24Hour={false}
          display={
            Platform.OS === "ios"
              ? "spinner"
              : "default"
          }
          onChange={handleTimeChange}
        />
      ) : null}
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

  topNavigation: {
    minHeight: 75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: BACKGROUND,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  navigationTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 14,
  },

  navigationSpace: {
    width: 42,
    height: 42,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  heroSection: {
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 24,
  },

  heroIconRing: {
    width: 67,
    height: 67,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D7F0DE",
  },

  heroIcon: {
    width: 53,
    height: 53,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },

  pageTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 22,
    marginTop: 12,
  },

  pageDescription: {
    maxWidth: 285,
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 4,
  },

  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 21,
    borderWidth: 1,
  },

  statusCardActive: {
    backgroundColor: PALE_GREEN,
    borderColor: "#D3EAD9",
  },

  statusCardInactive: {
    backgroundColor: WHITE,
    borderColor: BORDER,
  },

  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  statusIconActive: {
    backgroundColor: "#D8F1E0",
  },

  statusIconInactive: {
    backgroundColor: "#F0F3F0",
  },

  statusCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  statusTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
  },

  statusText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
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

  settingsCard: {
    paddingHorizontal: 14,
    borderRadius: 21,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  settingRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
  },

  disabledRow: {
    opacity: 0.52,
  },

  pressedRow: {
    opacity: 0.65,
  },

  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  disabledSettingIcon: {
    backgroundColor: "#F0F3F0",
  },

  settingCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  settingTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
  },

  settingSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: 2,
  },

  disabledText: {
    color: "#A5B1A8",
  },

  timePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 9,
    paddingRight: 5,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: LIGHT_GREEN,
  },

  disabledTimePill: {
    backgroundColor: "#F0F3F0",
  },

  timePillText: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 9,
    marginRight: 2,
  },

  divider: {
    height: 1,
    marginLeft: 51,
    backgroundColor: "#E7EEE8",
  },

  privacyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginTop: 23,
    borderRadius: 20,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#CBE8D3",
  },

  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  privacyCopy: {
    flex: 1,
    marginLeft: 10,
  },

  privacyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 10,
  },

  privacyText: {
    fontFamily: "Poppins_400Regular",
    color: FOREST,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },

  footerText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    textAlign: "center",
    marginTop: 20,
  },
});