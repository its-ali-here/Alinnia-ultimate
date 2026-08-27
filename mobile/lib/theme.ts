export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryDark: string;
  primaryTint: string;
  primaryText: string;
  sprout: string;
  accent: string;
  accentTint: string;
  danger: string;
  progressTrack: string;
  carbs: string;
  fat: string;
  protein: string;
}

// Alinnia's original light/green brand palette — the app-wide light mode.
export const lightTheme: ThemeColors = {
  background: "#FBFAF2",
  surface: "#FFFFFF",
  surfaceAlt: "#EFEEE2",
  border: "rgba(4,42,28,0.10)",
  text: "#042A1C",
  textMuted: "#67796E",
  primary: "#14A85C",
  primaryDark: "#0C8747",
  primaryTint: "#EAF7EE",
  primaryText: "#FBFAF2",
  sprout: "#8FE64B",
  accent: "#FFC233",
  accentTint: "#FFF3D6",
  danger: "#F0563E",
  progressTrack: "rgba(4,42,28,0.07)",
  carbs: "#D98C2B",
  fat: "#1F9E8E",
  protein: "#6B5FD1",
};

// The "Eat-This-Much-style" black/coral palette — the app-wide dark mode.
export const darkTheme: ThemeColors = {
  background: "#000000",
  surface: "#141414",
  surfaceAlt: "#1C1C1C",
  border: "rgba(255,255,255,0.14)",
  text: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.6)",
  primary: "#E2825D",
  primaryDark: "#C96A46",
  primaryTint: "rgba(226,130,93,0.14)",
  primaryText: "#FFFFFF",
  sprout: "#8FE6B0",
  accent: "#F0C244",
  accentTint: "rgba(240,194,68,0.16)",
  danger: "#F0563E",
  progressTrack: "rgba(255,255,255,0.12)",
  carbs: "#F0A83C",
  fat: "#2FBFAE",
  protein: "#8A7FE8",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const fontFamily = {
  display: "Baloo2_600SemiBold",
  displayBold: "Baloo2_700Bold",
  body: "Nunito_400Regular",
  bodyMedium: "Nunito_600SemiBold",
  bodyBold: "Nunito_800ExtraBold",
  tagline: "PTSerif_400Regular",
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 34,
};

export const shadow = {
  card: {
    shadowColor: "#042A1C",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
};
