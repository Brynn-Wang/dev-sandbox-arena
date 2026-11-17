"use client";

import { useEffect } from "react";
import { usePreferencesSnapshot } from "@/lib/use-preferences";

export function PreferencesBootstrap() {
  const preferences = usePreferencesSnapshot();

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.lang =
      preferences.language === "zh" ? "zh-CN" : "en";
  }, [preferences]);

  return null;
}
