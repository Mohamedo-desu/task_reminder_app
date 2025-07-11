import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { Platform, TouchableOpacity } from "react-native";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";

import { SystemBars } from "react-native-edge-to-edge";
// 1) Global handler for how notifications show
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const CHANNEL_ID = "daily-reminder-channel";

export default function RootLayout() {
  const { theme } = useUnistyles();

  useEffect(() => {
    async function setupChannelsAndPermissions() {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
          name: "Daily Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          sound: "default",
        });
      }
    }

    setupChannelsAndPermissions().catch((err) => {
      console.error("Error setting up notification channels:", err);
    });
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "Your Notes",
            headerTitleStyle: {
              fontSize: 24,
              fontWeight: "bold",
            },
            headerTintColor: theme.colors.typography,
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerShadowVisible: false,
            headerRight: (props) => (
              <TouchableOpacity
                onPress={() => router.navigate("/settings")}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  {...props}
                  name="cog-outline"
                  size={24}
                  color={theme.colors.tint}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="create_note"
          options={{
            headerTitle: "Create Note",
            headerTitleStyle: {
              fontSize: 24,
              fontWeight: "bold",
            },
            headerTintColor: theme.colors.typography,
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerShadowVisible: false,
            presentation: "fullScreenModal",
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerTitle: "Settings",
            headerTitleStyle: {
              fontSize: 24,
              fontWeight: "bold",
            },
            headerTintColor: theme.colors.typography,
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerShadowVisible: false,
          }}
        />
      </Stack>
      <SystemBars
        style={UnistylesRuntime.themeName === "dark" ? "light" : "dark"}
      />
    </>
  );
}
