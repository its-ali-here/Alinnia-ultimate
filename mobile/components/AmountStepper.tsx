import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../lib/theme";

interface AmountStepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
}

export function AmountStepper({ value, onChange, step = 1, min = 0 }: AmountStepperProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.button}
        hitSlop={8}
        onPress={() => onChange(Math.max(min, roundStep(value - step)))}
      >
        <Text style={styles.buttonText}>−</Text>
      </Pressable>
      <View style={styles.divider} />
      <Pressable style={styles.button} hitSlop={8} onPress={() => onChange(roundStep(value + step))}>
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

function roundStep(value: number) {
  return Math.round(value * 100) / 100;
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: radius.pill,
      overflow: "hidden",
    },
    button: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
    buttonText: { fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold, color: colors.primary },
    divider: { width: 1, alignSelf: "stretch", backgroundColor: colors.primary },
  });
}
