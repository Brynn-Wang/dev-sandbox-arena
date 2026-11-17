import { z } from "zod";

const KEY = "itera:preferences:v1";
let cachedRaw: string | null | undefined;
let cachedPreferences: Preferences = {
  language: "zh",
  theme: "light",
  summaryInstruction:
    "使用清晰的 Markdown 标题、短段落和行动建议总结文档。",
};

export const PreferencesSchema = z.object({
  language: z.enum(["zh", "en"]).default("zh"),
  theme: z.enum(["light", "focus"]).default("light"),
  summaryInstruction: z.string().default(""),
});

export type Preferences = z.infer<typeof PreferencesSchema>;

export const defaultPreferences: Preferences = {
  language: "zh",
  theme: "light",
  summaryInstruction:
    "使用清晰的 Markdown 标题、短段落和行动建议总结文档。",
};

export function getPreferencesSnapshot(): Preferences {
  if (typeof window === "undefined") return defaultPreferences;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cachedRaw) return cachedPreferences;
  cachedRaw = raw;
  if (!raw) {
    cachedPreferences = defaultPreferences;
    return cachedPreferences;
  }
  try {
    cachedPreferences = PreferencesSchema.parse(JSON.parse(raw));
  } catch {
    cachedPreferences = defaultPreferences;
  }
  return cachedPreferences;
}

export function subscribePreferences(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const update = () => {
    cachedRaw = undefined;
    listener();
  };
  window.addEventListener("itera:preferences-changed", update);
  window.addEventListener("storage", update);
  return () => {
    window.removeEventListener("itera:preferences-changed", update);
    window.removeEventListener("storage", update);
  };
}

export function loadPreferences(): Preferences {
  return getPreferencesSnapshot();
}

export function savePreferences(preferences: Preferences): void {
  if (typeof window === "undefined") return;
  const parsed = PreferencesSchema.parse(preferences);
  window.localStorage.setItem(KEY, JSON.stringify(parsed));
  cachedRaw = JSON.stringify(parsed);
  cachedPreferences = parsed;
  document.documentElement.dataset.theme = parsed.theme;
  document.documentElement.lang = parsed.language === "zh" ? "zh-CN" : "en";
  window.dispatchEvent(
    new CustomEvent("itera:preferences-changed", { detail: parsed }),
  );
}
