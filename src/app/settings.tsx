import { useVersion } from "@/hooks/useVersion";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import { useTaskStore } from "../store/useTaskStore";

const THEME_OPTIONS = [
  { label: "Light", value: "light", icon: "white-balance-sunny" },
  { label: "Dark", value: "dark", icon: "weather-night" },
  { label: "Auto", value: "auto", icon: "theme-light-dark" },
];

const ICON_SIZE = 20;
const SECTION_ICON_SIZE = 22;
const CHECK_ICON_SIZE = 16;
const GAP = 12;

const SettingsScreen = () => {
  const { currentVersion } = useVersion();
  const { theme } = useUnistyles();
  const [selectedTheme, setSelectedTheme] = useState(
    UnistylesRuntime.themeName === "light" ||
      UnistylesRuntime.themeName === "dark"
      ? UnistylesRuntime.themeName
      : "auto"
  );

  const clearAllTasks = useTaskStore((s) => s.clearAllTasks);
  const clearPastTasks = useTaskStore((s) => s.clearPastTasks);
  const clearFutureTasks = useTaskStore((s) => s.clearFutureTasks);

  const handleThemeChange = useCallback((value: string) => {
    setSelectedTheme(value);
    if (value === "auto") {
      UnistylesRuntime.setAdaptiveThemes(true);
    } else {
      UnistylesRuntime.setAdaptiveThemes(false);
      UnistylesRuntime.setTheme(value as any);
    }
  }, []);

  const confirmClear = useCallback(
    (type: "all" | "past" | "future") => {
      let title = "";
      let message = "";
      let onConfirm = () => {};
      if (type === "all") {
        title = "Clear All Tasks";
        message =
          "Are you sure you want to delete ALL tasks? This cannot be undone.";
        onConfirm = clearAllTasks;
      } else if (type === "past") {
        title = "Clear Past Tasks";
        message = "Delete all past tasks? This cannot be undone.";
        onConfirm = clearPastTasks;
      } else if (type === "future") {
        title = "Clear Future Tasks";
        message = "Delete all future tasks? This cannot be undone.";
        onConfirm = clearFutureTasks;
      }
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onConfirm },
      ]);
    },
    [clearAllTasks, clearPastTasks, clearFutureTasks]
  );

  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.screen}>
        <View style={styles.themeCard(theme)}>
          <View style={styles.themeHeaderRow}>
            <MaterialCommunityIcons
              name="palette"
              size={SECTION_ICON_SIZE}
              color={theme.colors.tint}
              style={styles.sectionIcon}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Text
              style={styles.themeCardTitle(theme)}
              accessibilityRole="header"
            >
              Theme
            </Text>
          </View>
          <Text style={styles.themeCardDesc(theme)}>
            Choose your preferred appearance for the app.
          </Text>
          <View style={styles.themeBtnCol}>
            {THEME_OPTIONS.map((option) => {
              const isSelected = selectedTheme === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.themeCardBtn(theme),
                    isSelected
                      ? styles.themeCardBtnSelected(theme)
                      : styles.themeCardBtnUnselected(theme),
                  ]}
                  onPress={() => handleThemeChange(option.value)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${option.label} theme`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={ICON_SIZE}
                    color={isSelected ? "#fff" : theme.colors.tint}
                    style={styles.themeCardBtnIcon}
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  />
                  <Text
                    style={[
                      styles.themeCardBtnText(theme),
                      isSelected && styles.themeCardBtnTextSelected(theme),
                    ]}
                    accessible={false}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={CHECK_ICON_SIZE}
                      color="#fff"
                      style={styles.themeCardCheckIcon}
                      accessibilityElementsHidden
                      importantForAccessibility="no"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={styles.dangerZoneCard(theme)}>
          <View style={styles.dangerZoneHeaderRow}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={SECTION_ICON_SIZE}
              color={theme.colors.accents.apple}
              style={styles.sectionIcon}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Text
              style={styles.dangerZoneTitle(theme)}
              accessibilityRole="header"
            >
              Danger Zone
            </Text>
          </View>
          <Text style={styles.dangerZoneDesc(theme)}>
            These actions are irreversible. Please proceed with caution.
          </Text>
          <View style={styles.dangerZoneBtnCol}>
            <TouchableOpacity
              style={styles.dangerBtn(theme)}
              onPress={() => confirmClear("all")}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Clear all tasks"
            >
              <MaterialCommunityIcons
                name="delete-forever"
                size={ICON_SIZE}
                color="#fff"
                style={styles.dangerBtnIcon}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <Text style={styles.dangerBtnText(theme)} accessible={false}>
                Clear All Tasks
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dangerBtn(theme)}
              onPress={() => confirmClear("past")}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Clear past tasks"
            >
              <MaterialCommunityIcons
                name="history"
                size={ICON_SIZE}
                color="#fff"
                style={styles.dangerBtnIcon}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <Text style={styles.dangerBtnText(theme)} accessible={false}>
                Clear Past Tasks
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dangerBtn(theme)}
              onPress={() => confirmClear("future")}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Clear future tasks"
            >
              <MaterialCommunityIcons
                name="calendar-clock"
                size={ICON_SIZE}
                color="#fff"
                style={styles.dangerBtnIcon}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <Text style={styles.dangerBtnText(theme)} accessible={false}>
                Clear Future Tasks
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.versionCardDistinct(theme)}>
          <Text
            style={styles.versionCardTextDistinct(theme)}
            accessible={false}
          >
            Version {currentVersion}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create((theme) => ({
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.foreground,
  },
  scrollContent: {
    flexGrow: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.foreground,
    padding: theme.gap(2),
  },
  sectionIcon: {
    marginRight: 8,
  },
  themeCard: (theme) => ({
    marginTop: 0,
    backgroundColor: theme.colors.background + "F8",
    borderRadius: theme.gap(2),
    borderWidth: 1.5,
    borderColor: theme.colors.tint,
    padding: theme.gap(2),
    shadowColor: theme.colors.tint,
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: theme.gap(4),
  }),
  themeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  themeCardTitle: (theme) => ({
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.tint,
    letterSpacing: 0.2,
  }),
  themeCardDesc: (theme) => ({
    color: theme.colors.secondaryText,
    fontSize: 13,
    marginBottom: theme.gap(2),
    marginTop: 2,
  }),
  themeBtnCol: {
    gap: GAP,
    marginTop: 2,
  },
  themeCardBtn: (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minHeight: 44,
    paddingVertical: theme.gap(1.2),
    paddingHorizontal: theme.gap(1.5),
    borderRadius: theme.gap(1.2),
    backgroundColor: theme.colors.background,
    borderWidth: 1.2,
    borderColor: theme.colors.tint,
    marginBottom: 0,
    shadowColor: theme.colors.tint,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  }),
  themeCardBtnSelected: (theme) => ({
    backgroundColor: theme.colors.tint,
    borderColor: theme.colors.tint,
  }),
  themeCardBtnUnselected: (theme) => ({
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.tint,
  }),
  themeCardBtnIcon: {
    marginRight: 10,
  },
  themeCardCheckIcon: {
    marginLeft: 10,
  },
  themeCardBtnText: (theme) => ({
    color: theme.colors.tint,
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.1,
  }),
  themeCardBtnTextSelected: (theme) => ({
    color: "#fff",
  }),
  dangerZoneCard: (theme) => ({
    marginTop: theme.gap(4),
    backgroundColor: theme.colors.background + "F8",
    borderRadius: theme.gap(2),
    borderWidth: 1.5,
    borderColor: theme.colors.accents.apple,
    padding: theme.gap(2),
    shadowColor: theme.colors.accents.apple,
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  }),
  dangerZoneHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  dangerZoneTitle: (theme) => ({
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.accents.apple,
    letterSpacing: 0.2,
  }),
  dangerZoneDesc: (theme) => ({
    color: theme.colors.secondaryText,
    fontSize: 13,
    marginBottom: theme.gap(2),
    marginTop: 2,
  }),
  dangerZoneBtnCol: {
    gap: GAP,
    marginTop: 2,
  },
  dangerBtn: (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minHeight: 44,
    paddingVertical: theme.gap(1.2),
    paddingHorizontal: theme.gap(1.5),
    borderRadius: theme.gap(1.2),
    backgroundColor: theme.colors.accents.apple,
    borderWidth: 1.2,
    borderColor: theme.colors.accents.apple,
    marginBottom: 0,
    shadowColor: theme.colors.accents.apple,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  }),
  dangerBtnIcon: {
    marginRight: 10,
  },
  dangerBtnText: (theme) => ({
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.1,
  }),
  versionCard: (theme) => ({
    marginTop: theme.gap(4),
    backgroundColor: theme.colors.background + "F8",
    borderRadius: theme.gap(2),
    borderWidth: 1.5,
    borderColor: theme.colors.accents.apple,
    padding: theme.gap(2),
  }),
  versionCardText: (theme) => ({
    color: theme.colors.accents.apple,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.1,
  }),
  versionCardDistinct: (theme) => ({
    marginTop: theme.gap(4),
    backgroundColor: theme.colors.tint,
    borderRadius: theme.gap(2),
    borderWidth: 2,
    borderColor: theme.colors.accents.apple,
    padding: theme.gap(2),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.tint,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  }),
  versionCardTextDistinct: (theme) => ({
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.2,
  }),
}));
