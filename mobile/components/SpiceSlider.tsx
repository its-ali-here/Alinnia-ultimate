import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { radius, spacing, type ThemeColors } from "../lib/theme";

interface SpiceSliderProps {
  /** 1-5 */
  level: number;
  onChange: (level: number) => void;
}

const LEVELS = [1, 2, 3, 4, 5];

export function SpiceSlider({ level, onChange }: SpiceSliderProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.row}>
      {LEVELS.map((position) => {
        const on = position <= level;
        return (
          <Pressable key={position} style={[styles.flame, on && styles.flameOn]} onPress={() => onChange(position)}>
            <Ionicons name={on ? "flame" : "flame-outline"} size={15} color={on ? colors.primaryText : colors.textMuted} />
          </Pressable>
        );
      })}
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: { flexDirection: "row", gap: spacing.xs + 2 },
    flame: {
      flex: 1,
      height: 36,
      borderRadius: radius.sm,
      backgroundColor: colors.progressTrack,
      alignItems: "center",
      justifyContent: "center",
    },
    flameOn: { backgroundColor: colors.danger },
  });
}
