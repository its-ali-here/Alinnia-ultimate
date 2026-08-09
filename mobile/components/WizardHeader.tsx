import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { darkColors, fontFamily, fontSize, spacing } from "../lib/theme";

interface WizardHeaderProps {
  title: string;
  actionLabel: string;
  onAction: () => void;
}

export function WizardHeader({ title, actionLabel, onAction }: WizardHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Ionicons name="chevron-back" size={26} color={darkColors.text} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={onAction} hitSlop={12}>
        <Text style={styles.action}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: { fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold, color: darkColors.text },
  action: { fontSize: fontSize.md, fontFamily: fontFamily.bodyBold, color: darkColors.coral },
});
