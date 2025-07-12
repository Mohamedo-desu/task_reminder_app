import { fetchVersionInfo } from "@/services/versionService";
import { mmkvStorage } from "@/store/storage";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { Alert, Linking, Platform } from "react-native";
import { create } from "zustand";

// Helper to get major version
const getMajorVersion = (version: string) => version.split(".")[0];

const nativeVersion = Application.nativeApplicationVersion || "1.0.0";
const webVersion = (Constants.expoConfig as any)?.version || "1.0.0";
const localVersion = Platform.OS === "web" ? webVersion : nativeVersion;
const profile = Constants?.expoConfig?.extra?.profile;

type VersionState = {
  backendVersion: string | null;
  localVersion: string;
  isCheckingUpdates: boolean;
  currentVersion: string;
  checkVersion: () => Promise<void>;
};

export const useVersionStore = create<VersionState>((set, get) => ({
  backendVersion: null,
  localVersion,
  isCheckingUpdates: true,
  currentVersion: localVersion,
  checkVersion: async () => {
    // Only run once per app launch
    if (!get().isCheckingUpdates) return;
    let backendVersion: string | null = null;
    let isCheckingUpdates = true;
    try {
      // OTA update check
      if (Platform.OS !== "web") {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            mmkvStorage.setItem("cachedVersion", "");
            return await Updates.reloadAsync();
          }
        } catch (error) {
          console.log("[DEBUG] OTA check error:", error);
        }
      }
      // Step 2: Get local version after potential OTA update
      const localMajor = getMajorVersion(localVersion);
      // Step 3: Fetch latest backend version
      const versionInfo = await fetchVersionInfo();
      const latestVersion = versionInfo?.version || localVersion;
      const latestMajor = getMajorVersion(latestVersion);
      if (localMajor === latestMajor) {
        backendVersion = latestVersion;
        mmkvStorage.setItem("cachedVersion", latestVersion);
      } else if (parseInt(latestMajor) > parseInt(localMajor)) {
        // New major version available
        if (
          profile !== "production" &&
          versionInfo?.type === "major" &&
          versionInfo?.downloadUrl &&
          versionInfo.downloadUrl !== "https://drive.google.com/placeholder" &&
          versionInfo.downloadUrl.trim() !== ""
        ) {
          Alert.alert(
            "New Build Available",
            `A new build (${latestVersion}) is available. Would you like to download it now?`,
            [
              {
                text: "Download Now",
                onPress: () => {
                  if (versionInfo.downloadUrl) {
                    Linking.openURL(versionInfo.downloadUrl);
                  } else {
                    Alert.alert(
                      "Error",
                      "Download URL not available. Please try again later."
                    );
                  }
                },
              },
              {
                text: "Later",
                style: "cancel",
              },
            ]
          );
        }
        // Fetch compatible version for current major
        try {
          const compatibleInfo = await fetchVersionInfo(localMajor);
          if (compatibleInfo?.version) {
            backendVersion = compatibleInfo.version;
            mmkvStorage.setItem("cachedVersion", compatibleInfo.version);
          }
        } catch (error) {
          console.error("[DEBUG] Error fetching compatible version:", error);
        }
      }
    } catch (error) {
      backendVersion = localVersion;
      mmkvStorage.setItem("cachedVersion", localVersion);
    } finally {
      isCheckingUpdates = false;
      set({
        backendVersion,
        isCheckingUpdates,
        currentVersion: backendVersion || localVersion,
      });
    }
  },
}));
