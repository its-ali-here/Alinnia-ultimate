import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { useTheme } from "../../contexts/ThemeContext";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../../lib/theme";

export default function Reminders() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { setRemindersEnabled } = useOnboardingDraft();

  function continueOn() {
    router.push("/(setup)/trial");
  }

  function enable() {
    setRemindersEnabled(true);
    continueOn();
  }

  function skip() {
    setRemindersEnabled(false);
    continueOn();
  }

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.iconBadge}>
          <Ionicons name="notifications-outline" size={30} color={colors.primary} />
        </View>
        <Text style={styles.title}>Want a nudge at 4pm?</Text>
        <Text style={styles.subtitle}>One message a day with tomorrow's dinner. Nothing else, ever.</Text>

        <View style={styles.callout}>
          <Text style={styles.calloutText}>You can pick a different time, or turn this off entirely, whenever you like.</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Remind me at 4pm" onPress={enable} />
        <Pressable onPress={skip} hitSlop={8}>
          <Text style={styles.skip}>No thanks</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    content: { paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, alignItems: "center", flex: 1 },
    iconBadge: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: colors.primaryTint,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    title: { fontSize: fontSize.xxl, fontFamily: fontFamily.displayBold, color: colors.text, textAlign: "center" },
    subtitle: {
      fontSize: fontSize.sm,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: spacing.sm,
      lineHeight: 20,
    },
    callout: { marginTop: spacing.xl, backgroundColor: colors.primaryTint, borderRadius: radius.sm, padding: spacing.md, alignSelf: "stretch" },
    calloutText: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.text, textAlign: "center", lineHeight: 20 },
    footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, alignItems: "center", gap: spacing.md },
    skip: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold, color: colors.textMuted },
  });
}
