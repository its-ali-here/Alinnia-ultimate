import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, spacing, type ThemeColors } from "../lib/theme";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.wrap}>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xs,
      marginBottom: spacing.xs,
    },
    text: { flex: 1, paddingTop: 2 },
    title: {
      fontSize: fontSize.xxl,
      fontFamily: fontFamily.displayBold,
      color: colors.text,
      lineHeight: 34,
      paddingTop: 2,
    },
    subtitle: {
      fontSize: fontSize.sm,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
      marginTop: 4,
    },
    right: { flexDirection: "row", gap: spacing.sm, paddingTop: 6 },
  });
}
