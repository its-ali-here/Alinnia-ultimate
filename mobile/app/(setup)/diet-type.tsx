import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PillButton } from "../../components/PillButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { useTheme } from "../../contexts/ThemeContext";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../../lib/theme";
import { DIET_TYPES, excludesText } from "../../lib/dietTypes";

export default function DietType() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { dietType, setDietType } = useOnboardingDraft();
  const [selected, setSelected] = useState(dietType);

  function save() {
    setDietType(selected);
    router.back();
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Primary Diet</Text>
        <Pressable onPress={save} hitSlop={12}>
          <Text style={styles.saveLink}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          We'll base your meals off this main diet type. Choose "Anything" to customize your own unique diet from
          scratch, and set specific exclusions from the "Exclusions" menu screen.
        </Text>

        {DIET_TYPES.map((diet) => {
          const isSelected = diet.key === selected;
          return (
            <Pressable
              key={diet.key}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => setSelected(diet.key)}
            >
              <Ionicons
                name={isSelected ? "radio-button-on" : "radio-button-off"}
                size={22}
                color={isSelected ? colors.primary : colors.textMuted}
              />
              <Text style={styles.optionIcon}>{diet.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>{diet.label}</Text>
                <Text style={styles.optionExcludes}>Excludes: {excludesText(diet.excludes)}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <PillButton title="Save" onPress={save} />
      </View>
    </ScreenContainer>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    },
    headerTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold, color: colors.text },
    saveLink: { fontSize: fontSize.md, fontFamily: fontFamily.bodyBold, color: colors.primary },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
    description: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.lg },
    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    optionSelected: { borderColor: colors.primary },
    optionIcon: { fontSize: 28 },
    optionLabel: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: colors.text },
    optionExcludes: { fontSize: fontSize.xs, fontFamily: fontFamily.body, color: colors.textMuted, marginTop: 2 },
    footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  });
}
