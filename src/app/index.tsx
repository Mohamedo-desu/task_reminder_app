import { MaterialCommunityIcons } from "@expo/vector-icons";
import Color from "color";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useTaskStore } from "../store/useTaskStore";
dayjs.extend(customParseFormat);

const ICON_SIZE = 24;
const PIN_ICON_SIZE = 20;
const CREATE_BTN_ICON_SIZE = 20;
const SEARCH_ICON_SIZE = 20;
const GAP = 12;

export default function TaskListScreen() {
  const { theme } = useUnistyles();
  const { bottom } = useSafeAreaInsets();

  const rawTasks = useTaskStore((s) => s.tasks);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const togglePin = useTaskStore((state) => state.togglePin);

  const now = dayjs();
  const tasks = useMemo(() => {
    return rawTasks.filter((task) => {
      if (task.isRepeated || task.isPinned) return true;
      const scheduled = dayjs(
        `${task.date} ${task.time}`,
        "DD/MM/YYYY hh:mm A"
      );
      return scheduled.isAfter(now);
    });
  }, [rawTasks, now]);

  const [searchPhrase, setSearchPhrase] = useState("");

  const MAIN_ACCENT = theme.colors.tint;
  const backgroundTint = Color(theme.colors.tint).alpha(0.3).rgb().toString();

  const ACCENT_ICONS = useMemo(
    () => ({
      bell: theme.colors.tint,
      delete: theme.colors.accents.apple,
      searchActive: theme.colors.tint,
      searchClose: theme.colors.accents.apple,
    }),
    [theme]
  );

  const searchedResults = useMemo(() => {
    const phrase = searchPhrase.trim().toLowerCase();
    const filtered = phrase
      ? tasks.filter((item) => item.title.toLowerCase().startsWith(phrase))
      : tasks;
    return filtered.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
  }, [searchPhrase, tasks]);

  const clearSearch = useCallback(() => setSearchPhrase(""), []);
  const onChangeText = useCallback((text: string) => setSearchPhrase(text), []);

  const renderItem = useCallback(
    ({ item }: { item: (typeof tasks)[0] }) => (
      <View style={styles.taskCard(theme)}>
        <View style={styles.taskTopSection}>
          <View style={styles.titleRow(theme)}>
            {item.isPinned && (
              <TouchableOpacity
                style={[
                  styles.pinBtn(theme),
                  { backgroundColor: backgroundTint },
                ]}
                onPress={() => togglePin(item.id)}
                accessibilityRole="button"
                accessibilityLabel={item.isPinned ? "Unpin task" : "Pin task"}
                activeOpacity={0.8}
              >
                <Text style={styles.pinText}>📌 Pinned</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.taskTitle(theme)} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <View style={styles.iconRow(theme)}>
            <TouchableOpacity
              onPress={() => deleteTask(item.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Delete task"
            >
              <MaterialCommunityIcons
                name="delete"
                size={ICON_SIZE}
                color={ACCENT_ICONS.delete}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.taskBodySection(theme)}>
          <Text style={styles.taskDesc(theme)}>{item.description}</Text>
        </View>
        <View style={styles.taskBottomSection(theme)}>
          <Text style={styles.taskMeta(theme)}>
            📆 {item.date} — 🕝 {item.time}
          </Text>
          {item.isRepeated && (
            <Text style={styles.taskMeta(theme)}>(repeats daily)</Text>
          )}
        </View>
      </View>
    ),
    [theme, ACCENT_ICONS, backgroundTint, togglePin, deleteTask]
  );

  return (
    <View style={styles.container(theme)}>
      <View style={styles.searchBar(theme)}>
        <MaterialCommunityIcons
          name="magnify"
          size={SEARCH_ICON_SIZE}
          color={
            searchPhrase
              ? ACCENT_ICONS.searchActive
              : theme.colors.secondaryText
          }
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <TextInput
          placeholder="Search notes..."
          placeholderTextColor={theme.colors.secondaryText}
          cursorColor={theme.colors.tint}
          style={[styles.input, { color: theme.colors.typography }]}
          onChangeText={onChangeText}
          value={searchPhrase}
          accessibilityLabel="Search notes"
        />
        {searchPhrase.length > 0 && (
          <TouchableOpacity
            onPress={clearSearch}
            hitSlop={5}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <MaterialCommunityIcons
              name="close"
              size={SEARCH_ICON_SIZE}
              color={ACCENT_ICONS.searchClose}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={searchedResults}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainerStyle(theme)}
        ListEmptyComponent={
          <Text style={styles.emptyText(theme)}>
            {searchPhrase
              ? "No notes found for your search."
              : "No notes available"}
          </Text>
        }
        accessibilityRole="list"
        accessibilityLabel="Task list"
      />
      <TouchableOpacity
        style={[
          styles.createNoteBtn(theme),
          { backgroundColor: MAIN_ACCENT, bottom: bottom + 10 },
        ]}
        onPress={() => router.navigate("/create_note")}
        accessibilityRole="button"
        accessibilityLabel="Create note"
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons
          name="plus"
          size={CREATE_BTN_ICON_SIZE}
          color={"white"}
          style={styles.createBtnIcon}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <Text style={styles.createNoteText}>Create Note</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: (theme) => ({
    flex: 1,
    backgroundColor: theme.colors.foreground,
    padding: theme.gap(2),
  }),
  searchBar: (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.gap(1.4),
    paddingVertical: theme.gap(0.5),
    borderRadius: theme.gap(1),
    marginBottom: theme.gap(1.25),
  }),
  input: {
    flex: 1,
    marginLeft: 10,
  },
  contentContainerStyle: (theme) => ({
    paddingVertical: theme.gap(2),
    gap: theme.gap(1.25),
    paddingBottom: 100,
  }),
  emptyText: (theme) => ({
    textAlign: "center",
    color: "gray",
    fontSize: 16,
    marginTop: 40,
  }),
  taskCard: (theme) => ({
    width: "100%",
    borderRadius: theme.gap(1.25),
    padding: theme.gap(1.25),
    justifyContent: "space-between",
    height: 120,
    backgroundColor: theme.colors.background,
  }),
  taskTopSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1.25),
  }),
  iconRow: (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(1.25),
  }),
  pinBtn: (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.gap(0.625),
    paddingVertical: theme.gap(0.25),
    borderRadius: theme.gap(0.625),
  }),
  pinIcon: {
    marginRight: 4,
  },
  pinText: {
    fontSize: 12,
    fontWeight: "400",
    marginLeft: 2,
    color: "white",
  },
  taskTitle: (theme) => ({
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.typography,
  }),
  taskBodySection: (theme) => ({
    marginVertical: theme.gap(0.625),
  }),
  taskDesc: (theme) => ({
    fontSize: 14,
    fontWeight: "400",
    color: theme.colors.typography,
  }),
  taskBottomSection: (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.gap(0.625),
  }),
  taskMeta: (theme) => ({
    fontSize: 12,
    fontWeight: "400",
    color: theme.colors.secondaryText,
  }),
  createNoteBtn: (theme) => ({
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    elevation: 1,
  }),
  createBtnIcon: {
    marginRight: 8,
  },
  createNoteText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
});
