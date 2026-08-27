import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, spacing, type ThemeColors } from "../lib/theme";

// Like/Save/Add/Recur action row shared by the recipe and food detail
// screens. Deliberately has no fifth "More" (•••) action.
const ACTIONS = [
  { key: "like", label: "Like", icon: "thumbs-up-outline" as const },
  { key: "save", label: "Save", icon: "star-outline" as const },
  { key: "add", label: "Add", icon: "calendar-outline" as const },
  { key: "recur", label: "Recur", icon: "repeat-outline" as const },
];

export function DetailActionRow() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.row}>
      {ACTIONS.map((action) => (
        <Pressable
          key={action.key}
          style={styles.action}
          onPress={() => Alert.alert("Coming soon", `${action.label} isn't built yet.`)}
        >
          <Ionicons name={action.icon} size={22} color={colors.primary} />
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: { flexDirection: "row", justifyContent: "space-around", paddingVertical: spacing.md },
    action: { alignItems: "center", gap: spacing.xs },
    label: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyMedium, color: colors.primary },
  });
}
