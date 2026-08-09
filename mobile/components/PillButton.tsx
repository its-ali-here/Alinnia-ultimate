import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { darkColors, fontFamily, fontSize, radius, spacing } from "../lib/theme";

interface PillButtonProps {
  title: string;
  onPress: () => void;
  variant?: "coral" | "blue";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PillButton({ title, onPress, variant = "coral", loading, disabled, style }: PillButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.base, variant === "blue" ? styles.blue : styles.coral, (disabled || loading) && styles.disabled, style]}
    >
      {loading ? <ActivityIndicator color={darkColors.text} /> : <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  coral: { backgroundColor: darkColors.coral },
  blue: { backgroundColor: darkColors.blue },
  disabled: { opacity: 0.5 },
  text: { color: darkColors.text, fontSize: fontSize.md, fontFamily: fontFamily.bodyBold },
});
