import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import type { ThemeColors } from "../lib/theme";

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  accessibilityLabel?: string;
}

export function IconButton({
  icon,
  onPress,
  size = 34,
  color,
  backgroundColor,
  accessibilityLabel,
}: IconButtonProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <Pressable
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2 },
        backgroundColor ? { backgroundColor } : null,
      ]}
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Ionicons name={icon} size={16} color={color ?? colors.text} />
    </Pressable>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: { backgroundColor: colors.surfaceAlt, alignItems: "center", justifyContent: "center" },
  });
}
