import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, spacing, type ThemeColors } from "../lib/theme";

interface Tab {
  key: string;
  label: string;
}

interface UnderlineTabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function UnderlineTabs({ tabs, activeKey, onChange }: UnderlineTabsProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.row}>
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable key={tab.key} onPress={() => onChange(tab.key)} style={styles.tab}>
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            {active ? <View style={styles.underline} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: { flexDirection: "row", gap: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
    tab: { paddingBottom: spacing.sm },
    label: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: colors.textMuted },
    labelActive: { color: colors.primary },
    underline: { height: 2, backgroundColor: colors.primary, marginTop: spacing.xs, borderRadius: 1 },
  });
}
