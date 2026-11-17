"use client";

import { useSyncExternalStore } from "react";
import {
  defaultPreferences,
  getPreferencesSnapshot,
  subscribePreferences,
} from "./preferences";

export function usePreferencesSnapshot() {
  return useSyncExternalStore(
    subscribePreferences,
    getPreferencesSnapshot,
    () => defaultPreferences,
  );
}
