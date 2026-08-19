export const colors = {
  light: {
    background: "#F3F4F6",
    surface: "#FFFFFF",
    foreground: "#111827",
    subtitle: "#4B5563",
    mutedForeground: "#374151",
    mutedForegroundAlt: "#9CA3AF",
    accent: "#007AFF",
    primary: "#007AFF",
    primaryDark: "#0060DF",
    primaryForeground: "#FFFFFF",
    primarySoft: "#EFF6FF",
    destructive: "#DC2626",
    destructiveForeground: "#FFFFFF",
    card: "#F9FAFB",
    border: "#E5E7EB",
  },
  dark: {
    background: "#111827",
    surface: "#1F2937",
    foreground: "#FFFFFF",
    subtitle: "#9CA3AF",
    mutedForeground: "#D1D5DB",
    mutedForegroundAlt: "#6B7280",
    accent: "#0A84FF",
    primary: "#0A84FF",
    primaryDark: "#007AFF",
    primaryForeground: "#0B1220",
    primarySoft: "#1F2937",
    destructive: "#F87171",
    destructiveForeground: "#111827",
    card: "#1F2937",
    border: "#374151",
  },
  brand: {
    primary: "#007AFF",
  },
} as const;

export type Mode = "light" | "dark";

export const getColors = (mode: Mode) => colors[mode];
