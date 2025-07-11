import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import * as Notifications from "expo-notifications";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useTaskStore } from "../store/useTaskStore";

const CHANNEL_ID = "daily-reminder-channel";

async function scheduleDailyNotification(
  title: string,
  body: string,
  date: Date,
  repeats: boolean,
  isPinned: boolean
): Promise<string | null> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission Required", "Notification permissions not granted.");
    return null;
  }

  let trigger: Notifications.NotificationTriggerInput;
  if (repeats) {
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: date.getHours(),
      minute: date.getMinutes(),
      channelId: CHANNEL_ID,
    };
  } else {
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: CHANNEL_ID,
    };
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: "default",
        sticky: isPinned,
      },
      trigger,
    });

    return id;
  } catch (error) {
    console.error("Failed to schedule notification:", error);
    return null;
  }
}

// Reusable button for date/time selection
const DateTimeButton = ({
  iconName,
  label,
  value,
  onPress,
  theme,
}: {
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
  theme: any;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.dateTimeButton(theme),
      { flexDirection: "row", alignItems: "center", gap: 8 },
    ]}
    activeOpacity={0.8}
  >
    <MaterialCommunityIcons
      name={iconName}
      size={20}
      color={theme.colors.tint}
    />
    <Text
      style={{
        color: theme.colors.typography,
        fontWeight: "500",
        fontSize: 15,
      }}
    >
      {label}
    </Text>
    <Text
      style={{
        color: theme.colors.tint,
        marginLeft: "auto",
        fontWeight: "600",
        fontSize: 15,
      }}
    >
      {value}
    </Text>
  </TouchableOpacity>
);

const CreateNoteScreen = () => {
  const { theme } = useUnistyles();
  const { addTask } = useTaskStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);
  const [dateTime, setDateTime] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<"date" | "time">("date");

  const showDateTimePicker = (selectedMode: "date" | "time") => {
    setMode(selectedMode);
    setShowPicker(true);
  };

  const onChangeDateTime = (_event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDateTime(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing Fields", "Please enter both title and description.");
      return;
    }

    const date = dayjs(dateTime).format("DD/MM/YYYY");
    const time = dayjs(dateTime).format("hh:mm A");

    let notificationId: string | null = null;
    if (isPinned || isRepeated) {
      notificationId = await scheduleDailyNotification(
        title,
        description,
        dateTime,
        isRepeated,
        isPinned
      );
    }

    addTask({
      id: `${Date.now()}`,
      title,
      description,
      isPinned,
      isRepeated,
      date,
      time,
      repeatedFrequency: isRepeated ? "daily" : null,
      notificationId,
    });

    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container(theme)}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.tint,
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: 50,
                gap: 5,
              }}
            >
              <MaterialCommunityIcons
                name="content-save"
                size={18}
                color="white"
              />
              <Text style={{ fontSize: 14, fontWeight: "500", color: "white" }}>
                Save
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Title & Description */}
      <View style={styles.card(theme)}>
        <Text style={styles.label(theme)}>Title</Text>
        <TextInput
          style={[styles.input(theme), { color: theme.colors.typography }]}
          placeholder="..."
          placeholderTextColor={theme.colors.typography}
          value={title}
          onChangeText={setTitle}
          cursorColor={theme.colors.tint}
        />
        <Text style={styles.label(theme)}>Description</Text>
        <TextInput
          style={[
            styles.input(theme),
            styles.textArea,
            { color: theme.colors.typography },
          ]}
          placeholder="..."
          placeholderTextColor={theme.colors.typography}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          cursorColor={theme.colors.tint}
          textAlignVertical="top"
        />
      </View>

      {/* Pin & Repeat */}
      <View style={styles.card(theme)}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel(theme)}>📌 Pin to Notification</Text>
          <Switch
            value={isPinned}
            onValueChange={setIsPinned}
            trackColor={{
              false: theme.colors.foreground,
              true: theme.colors.accents.storm,
            }}
            thumbColor={isPinned ? "white" : theme.colors.secondaryText}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel(theme)}>🔁 Repeat Daily</Text>
          <Switch
            value={isRepeated}
            onValueChange={setIsRepeated}
            trackColor={{
              false: theme.colors.foreground,
              true: theme.colors.accents.storm,
            }}
            thumbColor={isRepeated ? "white" : theme.colors.secondaryText}
          />
        </View>
      </View>

      {/* Schedule */}
      <View style={styles.card(theme)}>
        <Text style={styles.label(theme)}>⏰ Schedule</Text>
        <View
          style={{
            flexDirection: "row",
            gap: theme.gap(1),
            marginTop: theme.gap(0.5),
          }}
        >
          <DateTimeButton
            iconName="calendar"
            label="Date"
            value={dayjs(dateTime).format("DD/MM/YYYY")}
            onPress={() => showDateTimePicker("date")}
            theme={theme}
          />
          <DateTimeButton
            iconName="clock-outline"
            label="Time"
            value={dayjs(dateTime).format("hh:mm A")}
            onPress={() => showDateTimePicker("time")}
            theme={theme}
          />
        </View>
      </View>

      {showPicker && (
        <DateTimePicker
          value={dateTime}
          mode={mode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeDateTime}
        />
      )}
    </ScrollView>
  );
};

export default CreateNoteScreen;

const styles = StyleSheet.create({
  container: (theme: any) => ({
    flexGrow: 1,
    backgroundColor: theme.colors.foreground,
    padding: theme.gap(2),
    gap: theme.gap(2),
  }),
  card: (theme: any) => ({
    backgroundColor: theme.colors.background,
    borderRadius: theme.gap(1),
    padding: theme.gap(2),
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
    gap: theme.gap(1.5),
  }),
  label: (theme: any) => ({
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.typography,
  }),
  input: (theme: any) => ({
    backgroundColor: theme.colors.foreground,
    paddingHorizontal: theme.gap(1.2),
    paddingVertical: theme.gap(0.9),
    borderRadius: theme.gap(0.5),
    fontSize: 16,
  }),
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: (theme: any) => ({
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.typography,
  }),
  dateTimeButton: (theme: any) => ({
    flex: 1,
    backgroundColor: theme.colors.foreground,
    borderRadius: theme.gap(0.7),
    paddingVertical: theme.gap(1.1),
    paddingHorizontal: theme.gap(1.5),
    borderWidth: 1,
    borderColor: theme.colors.tint,
    shadowColor: theme.colors.tint,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  }),
});
