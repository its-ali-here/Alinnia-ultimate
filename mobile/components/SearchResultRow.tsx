import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CatalogThumb } from "./CatalogThumb";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../lib/theme";

interface SearchResultRowProps {
  imageUrl: string | null;
  emoji: string;
  color: string;
  title: string;
  subtitleLines: string[];
  onAdd: () => void;
  onPress?: () => void;
}

export function SearchResultRow({ imageUrl, emoji, color, title, subtitleLines, onAdd, onPress }: SearchResultRowProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <CatalogThumb imageUrl={imageUrl} emoji={emoji} color={color} size={64} emojiSize={30} />
      <View style={styles.textColumn}>
        <Text style={styles.title}>{title}</Text>
        {subtitleLines.map((line, i) => (
          <Text key={i} style={styles.subtitle}>
            {line}
          </Text>
        ))}
      </View>
      <Pressable onPress={onAdd} hitSlop={12}>
        <Ionicons name="add" size={24} color={colors.text} />
      </Pressable>
    </Pressable>
  );
}

export function CreateRow({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.thumb, styles.createThumb]}>
        <Ionicons name="add" size={24} color={colors.primary} />
      </View>
      <Text style={styles.title}>{label}</Text>
    </Pressable>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm },
    thumb: { width: 64, height: 64, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
    createThumb: { backgroundColor: colors.surfaceAlt },
    textColumn: { flex: 1 },
    title: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: colors.text },
    subtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: colors.textMuted },
  });
}
