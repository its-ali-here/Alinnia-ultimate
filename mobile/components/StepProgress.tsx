import { StyleSheet, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { radius, spacing, type ThemeColors } from "../lib/theme";

interface StepProgressProps {
  step: number;
  total: number;
}

export function StepProgress({ step, total }: StepProgressProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i < step ? styles.dotActive : styles.dotInactive]} />
      ))}
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: { flexDirection: "row", gap: spacing.xs, marginBottom: spacing.xl },
    dot: { height: 6, flex: 1, borderRadius: radius.pill },
    dotActive: { backgroundColor: colors.primary },
    dotInactive: { backgroundColor: colors.border },
  });
}
