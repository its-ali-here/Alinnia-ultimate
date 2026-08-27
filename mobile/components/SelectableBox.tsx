import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../lib/theme";

interface SelectableBoxProps {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function SelectableBox({ label, description, selected, onPress, style }: SelectableBoxProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <Pressable style={[styles.box, selected && styles.boxSelected, style]} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </Pressable>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    box: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
    },
    boxSelected: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
    label: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: colors.text },
    description: { fontSize: fontSize.xs, fontFamily: fontFamily.body, color: colors.textMuted, marginTop: 2 },
  });
}
