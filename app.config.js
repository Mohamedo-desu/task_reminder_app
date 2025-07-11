export default {
  expo: {
    name: "Remind Me!",
    slug: "task_reminder_app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "taskreminderapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.mohamedodesu.task_reminder_app",
      softwareKeyboardLayoutMode: "pan",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "expo-notifications",
        {
          icon: "",
          color: "#ffffff",
          defaultChannel: "default",
          enableBackgroundRemoteNotifications: true,
        },
      ],
      "react-native-edge-to-edge",
      "./plugins/custom-android-styles.js",
    ],
    experiments: {
      typedRoutes: true,
      buildCacheProvider: "eas",
    },
    extra: {
      router: {},
      eas: {
        projectId: "1e8a7068-863a-4ea7-8d7a-5374abc220d3",
      },
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/1e8a7068-863a-4ea7-8d7a-5374abc220d3",
    },
  },
};
