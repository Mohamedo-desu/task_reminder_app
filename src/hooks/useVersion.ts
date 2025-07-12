import { useVersionStore } from "@/store/useVersionStore";
import { useEffect } from "react";

export const useVersion = () => {
  const {
    backendVersion,
    localVersion,
    isCheckingUpdates,
    currentVersion,
    checkVersion,
  } = useVersionStore();

  useEffect(() => {
    checkVersion(); // Only runs once per app launch
  }, [checkVersion]);

  return {
    backendVersion,
    localVersion,
    isCheckingUpdates,
    currentVersion,
  };
};
