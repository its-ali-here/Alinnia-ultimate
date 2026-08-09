import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { darkColors, fontFamily, fontSize, radius, spacing } from "../lib/theme";

interface SearchResultRowProps {
  emoji: string;
  color: string;
  title: string;
  subtitleLines: string[];
  onAdd: () => void;
}

export function SearchResultRow({ emoji, color, title, subtitleLines, onAdd }: SearchResultRowProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.thumb, { backgroundColor: color }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.title}>{title}</Text>
        {subtitleLines.map((line, i) => (
          <Text key={i} style={styles.subtitle}>
            {line}
          </Text>
        ))}
      </View>
      <Pressable onPress={onAdd} hitSlop={12}>
        <Ionicons name="add" size={24} color={darkColors.text} />
      </Pressable>
    </View>
  );
}

export function CreateRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.thumb, styles.createThumb]}>
        <Ionicons name="add" size={24} color={darkColors.coral} />
      </View>
      <Text style={styles.title}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm },
  thumb: { width: 64, height: 64, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  createThumb: { backgroundColor: darkColors.surfaceAlt },
  emoji: { fontSize: 30 },
  textColumn: { flex: 1 },
  title: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: darkColors.text },
  subtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: darkColors.textMuted },
});
