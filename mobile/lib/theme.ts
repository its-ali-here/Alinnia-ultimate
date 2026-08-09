export const colors = {
  background: "#FBFAF2",
  surface: "#FFFFFF",
  border: "rgba(4,42,28,0.10)",
  text: "#042A1C",
  textMuted: "#67796E",
  primary: "#14A85C",
  primaryDark: "#0C8747",
  primaryTint: "#EAF7EE",
  sprout: "#8FE64B",
  accent: "#FFC233",
  accentTint: "#FFF3D6",
  danger: "#F0563E",
  primaryText: "#FBFAF2",
  progressTrack: "rgba(4,42,28,0.07)",
};

// Eat-This-Much-style dark onboarding screens (welcome, meal-plan, diet-type).
// Kept separate from `colors` above, which the rest of the app (light, green) still uses.
export const darkColors = {
  background: "#000000",
  surface: "#141414",
  surfaceAlt: "#1C1C1C",
  border: "rgba(255,255,255,0.14)",
  text: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.6)",
  coral: "#E2825D",
  coralDark: "#C96A46",
  coralTint: "rgba(226,130,93,0.14)",
  blue: "#1F4C6B",
  blueDark: "#183D57",
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
