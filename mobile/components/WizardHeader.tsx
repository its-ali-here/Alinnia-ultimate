import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, spacing, type ThemeColors } from "../lib/theme";

interface WizardHeaderProps {
  title: string;
  actionLabel: string;
  onAction: () => void;
}

export function WizardHeader({ title, actionLabel, onAction }: WizardHeaderProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Ionicons name="chevron-back" size={26} color={colors.text} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={onAction} hitSlop={12}>
        <Text style={styles.action}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xl,
    },
    title: { fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold, color: colors.text },
    action: { fontSize: fontSize.md, fontFamily: fontFamily.bodyBold, color: colors.primary },
  });
}
