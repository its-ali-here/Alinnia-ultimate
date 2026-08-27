import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../lib/theme";

interface SelectTileArt {
  emoji: string;
  color: string;
  gradientEnd?: string;
}

interface SelectTileProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  /** When provided, renders an art-block tile (e.g. "Dishes you love"); otherwise a plain text card (e.g. "Cuisine"). */
  art?: SelectTileArt;
  style?: ViewStyle;
}

export function SelectTile({ title, subtitle, selected, onPress, art, style }: SelectTileProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  if (art) {
    return (
      <Pressable
        style={[styles.artCard, selected && styles.artCardSelected, style]}
        onPress={onPress}
      >
        <LinearGradient
          colors={[art.color, art.gradientEnd ?? colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.artBlock}
        >
          <Text style={styles.artEmoji}>{art.emoji}</Text>
        </LinearGradient>
        <Text style={styles.artTitle} numberOfLines={1}>
          {title}
        </Text>
        {selected ? (
          <View style={styles.badge}>
            <Ionicons name="checkmark" size={12} color={colors.primaryText} />
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Pressable style={[styles.pick, selected && styles.pickSelected, style]} onPress={onPress}>
      <Text style={[styles.pickTitle, selected && styles.pickTitleSelected]}>{title}</Text>
      {subtitle ? <Text style={[styles.pickSubtitle, selected && styles.pickSubtitleSelected]}>{subtitle}</Text> : null}
    </Pressable>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    // Text-only card (Cuisine screen)
    pick: {
      flex: 1,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.sm + 4,
      backgroundColor: colors.surface,
    },
    pickSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    pickTitle: { fontSize: fontSize.md, fontFamily: fontFamily.display, color: colors.text },
    pickTitleSelected: { color: colors.primaryText },
    pickSubtitle: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, color: colors.textMuted, marginTop: 2 },
    pickSubtitleSelected: { color: colors.primaryText, opacity: 0.75 },

    // Art card (Dishes you love screen)
    artCard: {
      flex: 1,
      borderRadius: radius.md,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: "transparent",
      backgroundColor: colors.surface,
    },
    artCardSelected: { borderColor: colors.primary },
    artBlock: { height: 56, alignItems: "center", justifyContent: "center" },
    artEmoji: { fontSize: 22 },
    artTitle: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm - 2,
    },
    badge: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 19,
      height: 19,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
