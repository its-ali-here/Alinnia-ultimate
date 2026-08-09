import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { darkColors, fontFamily, fontSize, radius, spacing } from "../lib/theme";

interface SelectableBoxProps {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function SelectableBox({ label, description, selected, onPress, style }: SelectableBoxProps) {
  return (
    <Pressable style={[styles.box, selected && styles.boxSelected, style]} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1.5,
    borderColor: darkColors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  boxSelected: { borderColor: darkColors.coral },
  label: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: darkColors.text },
  description: { fontSize: fontSize.xs, fontFamily: fontFamily.body, color: darkColors.textMuted, marginTop: 2 },
});
