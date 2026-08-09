import { Pressable, StyleSheet, Text, View } from "react-native";
import { darkColors, fontFamily, fontSize, spacing } from "../lib/theme";

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

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.lg, borderBottomWidth: 1, borderBottomColor: darkColors.border },
  tab: { paddingBottom: spacing.sm },
  label: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: darkColors.textMuted },
  labelActive: { color: darkColors.coral },
  underline: { height: 2, backgroundColor: darkColors.coral, marginTop: spacing.xs, borderRadius: 1 },
});
