import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontFamily, fontSize, radius, spacing } from "../lib/theme";

interface ChipProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: "primary" | "accent";
  /** Filled/solid state — used for tappable toggle chips (e.g. the orbit filter bubbles). */
  active?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Chip({ label, icon, tone = "primary", active, onPress, disabled, style }: ChipProps) {
  const isAccent = tone === "accent";
  const color = active ? (isAccent ? colors.text : colors.primaryText) : isAccent ? colors.accent : colors.primaryDark;

  const body = (
    <View
      style={[
        styles.chip,
        isAccent ? (active ? styles.chipAccentActive : styles.chipAccent) : active ? styles.chipPrimaryActive : styles.chipPrimary,
        disabled && styles.chipDisabled,
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={13} color={color} style={styles.icon} /> : null}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={6}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  chipPrimary: { backgroundColor: colors.primaryTint },
  chipPrimaryActive: { backgroundColor: colors.primary },
  chipAccent: { backgroundColor: colors.accentTint },
  chipAccentActive: { backgroundColor: colors.accent },
  chipDisabled: { opacity: 0.4 },
  icon: { marginRight: 4 },
  label: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, textTransform: "capitalize" },
});
