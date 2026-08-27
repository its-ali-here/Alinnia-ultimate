import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../lib/theme";

interface PillButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PillButton({ title, onPress, loading, disabled, style }: PillButtonProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.base, (disabled || loading) && styles.disabled, style]}
    >
      {loading ? <ActivityIndicator color={colors.primaryText} /> : <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    base: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },
    disabled: { opacity: 0.5 },
    text: { color: colors.primaryText, fontSize: fontSize.md, fontFamily: fontFamily.bodyBold },
  });
}
