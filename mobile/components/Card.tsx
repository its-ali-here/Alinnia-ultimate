import type { PropsWithChildren } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { radius, shadow, spacing, type ThemeColors } from "../lib/theme";

interface CardProps {
  style?: ViewStyle;
}

export function Card({ children, style }: PropsWithChildren<CardProps>) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return <View style={[styles.card, style]}>{children}</View>;
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.lg,
      ...shadow.card,
    },
  });
}
