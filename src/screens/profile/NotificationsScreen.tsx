import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
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
const DISABLED = "#A5B1A8";
const DISABLED_BACKGROUND = "#F0F3F0";
const OVERLAY = "rgba(10, 25, 16, 0.44)";

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

  const [showTimeSheet, setShowTimeSheet] =
    useState(false);

  const [reminderTime, setReminderTime] =
    useState(createDefaultReminderTime);

  const [draftReminderTime, setDraftReminderTime] =
    useState(createDefaultReminderTime);

  const formattedReminderTime = useMemo(
    () => formatTime(reminderTime),
    [reminderTime]
  );

  const formattedDraftTime = useMemo(
    () => formatTime(draftReminderTime),
    [draftReminderTime]
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

      let restoredTime = createDefaultReminderTime();

      if (savedTime) {
        const parsedTime = new Date(savedTime);

        if (!Number.isNaN(parsedTime.getTime())) {
          restoredTime = parsedTime;
        }
      }

      setReminderTime(restoredTime);
      setDraftReminderTime(restoredTime);

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

  const saveReminderTime = async (time: Date) => {
    await AsyncStorage.setItem(
      REMINDER_TIME_STORAGE_KEY,
      time.toISOString()
    );
  };

  const ensureNotificationPermission = async () => {
    const currentPermission =
      await Notifications.getPermissionsAsync();

    if (
      currentPermission.granted ||
      currentPermission.status === "granted"
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

  const enableReminder = async () => {
    if (isLoading || isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      const permissionGranted =
        await ensureNotificationPermission();

      if (!permissionGranted) {
        Alert.alert(
          "Notifications are disabled",
          "Allow notifications in your device settings to receive daily SnapSort reminders."
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
        `SnapSort AI will remind you every day at ${formattedReminderTime}.`
      );
    } catch {
      Alert.alert(
        "Could not enable reminder",
        "Please try again and check notification permissions in device settings."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const disableReminder = () => {
    if (isLoading || isSaving) {
      return;
    }

    Alert.alert(
      "Turn off reminder?",
      "You will no longer receive your daily SnapSort reminder.",
      [
        {
          text: "Keep reminder",
          style: "cancel",
        },
        {
          text: "Turn off",
          style: "destructive",
          onPress: async () => {
            try {
              setIsSaving(true);

              await cancelExistingReminder();

              setDailyReminder(false);
              await saveReminderEnabled(false);
            } catch {
              Alert.alert(
                "Could not update reminder",
                "Please try again."
              );
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  const openTimeSheet = () => {
    if (
      !dailyReminder ||
      isLoading ||
      isSaving
    ) {
      return;
    }

    setDraftReminderTime(reminderTime);
    setShowTimeSheet(true);
  };

  const closeTimeSheet = () => {
    if (isSaving) {
      return;
    }

    setShowTimeSheet(false);
    setDraftReminderTime(reminderTime);
  };

  const handleTimeChange = (
    _event: unknown,
    selectedTime?: Date
  ) => {
    if (!selectedTime) {
      return;
    }

    const nextTime = new Date(draftReminderTime);

    nextTime.setHours(selectedTime.getHours());
    nextTime.setMinutes(selectedTime.getMinutes());
    nextTime.setSeconds(0);
    nextTime.setMilliseconds(0);

    setDraftReminderTime(nextTime);
  };

  const saveNewReminderTime = async () => {
    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      const updatedTime = new Date(draftReminderTime);

      updatedTime.setSeconds(0);
      updatedTime.setMilliseconds(0);

      await saveReminderTime(updatedTime);

      if (dailyReminder) {
        await scheduleReminder(updatedTime);
      }

      setReminderTime(updatedTime);
      setShowTimeSheet(false);

      Alert.alert(
        "Reminder time updated",
        `Your daily reminder is now set for ${formatTime(
          updatedTime
        )}.`
      );
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
                size={24}
                color={WHITE}
              />
            </View>
          </View>

          <Text style={styles.pageTitle}>
            Stay on track
          </Text>

          <Text style={styles.pageDescription}>
            Set a daily reminder for thoughtful
            disposal choices.
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
                isLoading
                  ? "clock-outline"
                  : dailyReminder
                  ? "check"
                  : "bell-off-outline"
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
                : "Daily reminder is off"}
            </Text>

            <Text style={styles.statusText}>
              {dailyReminder
                ? `Scheduled every day at ${formattedReminderTime}.`
                : "Enable it whenever you want a helpful reminder."}
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
                Receive one reminder every day.
              </Text>
            </View>
          </View>

          <View style={styles.reminderActionArea}>
            {isSaving ? (
              <View style={styles.loadingAction}>
                <ActivityIndicator
                  size="small"
                  color={FOREST}
                />

                <Text style={styles.loadingActionText}>
                  Updating reminder...
                </Text>
              </View>
            ) : dailyReminder ? (
              <View style={styles.activeReminderArea}>
                <View style={styles.activeReminderBadge}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={15}
                    color={FOREST}
                  />

                  <Text style={styles.activeReminderText}>
                    Reminder on
                  </Text>
                </View>

                <Pressable
                  style={styles.turnOffButton}
                  onPress={disableReminder}
                  accessibilityRole="button"
                  accessibilityLabel="Turn off daily reminder"
                >
                  <Text style={styles.turnOffButtonText}>
                    Turn off
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.enableButton}
                onPress={enableReminder}
                accessibilityRole="button"
                accessibilityLabel="Enable daily reminder"
              >
                <MaterialCommunityIcons
                  name="bell-plus-outline"
                  size={17}
                  color={WHITE}
                />

                <Text style={styles.enableButtonText}>
                  Enable reminder
                </Text>
              </Pressable>
            )}
          </View>

          <View style={styles.divider} />

          <Pressable
            style={({ pressed }) => [
              styles.timeRow,
              !dailyReminder && styles.disabledRow,
              pressed &&
                dailyReminder &&
                styles.pressedRow,
            ]}
            onPress={openTimeSheet}
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
                    : DISABLED
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
                size={15}
                color={
                  dailyReminder
                    ? FOREST
                    : DISABLED
                }
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.privacyCard}>
          <View style={styles.privacyIcon}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={18}
              color={FOREST}
            />
          </View>

          <View style={styles.privacyCopy}>
            <Text style={styles.privacyTitle}>
              Private by design
            </Text>

            <Text style={styles.privacyText}>
              Your reminder is scheduled locally on your device.
              You can disable it whenever you want.
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          Notification permission is controlled in device settings.
        </Text>
      </ScrollView>

      <Modal
        visible={showTimeSheet}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeTimeSheet}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeTimeSheet}
            accessibilityRole="button"
            accessibilityLabel="Close time picker"
          />

          <View
            style={[
              styles.timeSheet,
              {
                paddingBottom: Math.max(
                  insets.bottom + 15,
                  25
                ),
              },
            ]}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>
                  DAILY REMINDER
                </Text>

                <Text style={styles.sheetTitle}>
                  Choose reminder time
                </Text>
              </View>

              <Pressable
                style={styles.sheetCloseButton}
                onPress={closeTimeSheet}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel="Close reminder time picker"
              >
                <MaterialCommunityIcons
                  name="close"
                  size={18}
                  color={MUTED}
                />
              </Pressable>
            </View>

            <View style={styles.timePreview}>
              <View style={styles.timePreviewIcon}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={19}
                  color={FOREST}
                />
              </View>

              <View style={styles.timePreviewCopy}>
                <Text style={styles.timePreviewLabel}>
                  SELECTED TIME
                </Text>

                <Text style={styles.timePreviewValue}>
                  {formattedDraftTime}
                </Text>
              </View>
            </View>

            <View style={styles.pickerArea}>
              <DateTimePicker
                value={draftReminderTime}
                mode="time"
                is24Hour={false}
                display={
                  Platform.OS === "ios"
                    ? "spinner"
                    : "clock"
                }
                onChange={handleTimeChange}
                accentColor={FOREST}
              />
            </View>

            <View style={styles.sheetActionRow}>
              <Pressable
                style={styles.cancelButton}
                onPress={closeTimeSheet}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel="Cancel reminder time changes"
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.saveButton,
                  isSaving && styles.saveButtonDisabled,
                ]}
                onPress={saveNewReminderTime}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel="Save reminder time"
              >
                {isSaving ? (
                  <ActivityIndicator
                    size="small"
                    color={WHITE}
                  />
                ) : (
                  <>
                    <Text style={styles.saveButtonText}>
                      Save time
                    </Text>

                    <MaterialCommunityIcons
                      name="check"
                      size={17}
                      color={WHITE}
                    />
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function createDefaultReminderTime() {
  const date = new Date();

  date.setHours(19);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
}

function formatTime(time: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(time);
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
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D7F0DE",
  },

  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    maxWidth: 280,
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
    width: 41,
    height: 41,
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
    overflow: "hidden",
    borderRadius: 21,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  settingRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  timeRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
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
    backgroundColor: DISABLED_BACKGROUND,
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
    color: DISABLED,
  },

  reminderActionArea: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },

  enableButton: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    backgroundColor: FOREST,
  },

  enableButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 11,
    marginLeft: 7,
  },

  loadingAction: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    backgroundColor: PALE_GREEN,
  },

  loadingActionText: {
    fontFamily: "Poppins_500Medium",
    color: FOREST,
    fontSize: 10,
    marginLeft: 7,
  },

  activeReminderArea: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 12,
    paddingRight: 5,
    borderRadius: 23,
    backgroundColor: PALE_GREEN,
    borderWidth: 1,
    borderColor: "#D3EAD9",
  },

  activeReminderBadge: {
    flexDirection: "row",
    alignItems: "center",
  },

  activeReminderText: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 10,
    marginLeft: 5,
  },

  turnOffButton: {
    height: 36,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "#D3EAD9",
  },

  turnOffButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: MUTED,
    fontSize: 9,
  },

  divider: {
    height: 1,
    marginLeft: 65,
    backgroundColor: "#E7EEE8",
  },

  disabledRow: {
    opacity: 0.52,
  },

  pressedRow: {
    opacity: 0.68,
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
    backgroundColor: DISABLED_BACKGROUND,
  },

  timePillText: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 9,
    marginRight: 2,
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

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: OVERLAY,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  timeSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 11,
    backgroundColor: WHITE,
  },

  sheetHandle: {
    width: 39,
    height: 4,
    alignSelf: "center",
    borderRadius: 2,
    backgroundColor: "#D9E3DB",
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
  },

  sheetEyebrow: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
    letterSpacing: 1.15,
  },

  sheetTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 18,
    marginTop: 2,
  },

  sheetCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F6F2",
  },

  timePreview: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    marginTop: 17,
    borderRadius: 18,
    backgroundColor: PALE_GREEN,
    borderWidth: 1,
    borderColor: "#D8ECDD",
  },

  timePreviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  timePreviewCopy: {
    marginLeft: 10,
  },

  timePreviewLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
    letterSpacing: 1.1,
  },

  timePreviewValue: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 18,
    marginTop: 1,
  },

  pickerArea: {
    minHeight: Platform.OS === "ios" ? 185 : 270,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  sheetActionRow: {
    flexDirection: "row",
    marginTop: 8,
  },

  cancelButton: {
    flex: 1,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    borderRadius: 25,
    backgroundColor: "#F2F6F2",
  },

  cancelButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: MUTED,
    fontSize: 11,
  },

  saveButton: {
    flex: 1,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    borderRadius: 25,
    backgroundColor: FOREST,
  },

  saveButtonDisabled: {
    opacity: 0.62,
  },

  saveButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 11,
    marginRight: 6,
  },
});