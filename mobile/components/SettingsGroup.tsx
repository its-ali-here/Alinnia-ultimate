import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { darkColors, fontFamily, fontSize, radius, spacing } from "../lib/theme";

export function SettingsSection({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  last?: boolean;
}

export function SettingsRow({ icon, label, value, onPress, last }: SettingsRowProps) {
  return (
    <Pressable style={[styles.row, !last && styles.rowDivider]} onPress={onPress}>
      <Ionicons name={icon} size={20} color={darkColors.text} style={styles.rowIcon} />
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={18} color={darkColors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.bodyMedium,
    color: darkColors.textMuted,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: { backgroundColor: darkColors.surface, borderRadius: radius.lg, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, paddingHorizontal: spacing.md, gap: spacing.md },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: darkColors.border },
  rowIcon: { width: 22 },
  rowLabel: { flex: 1, fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text },
  rowValue: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.coral },
});
