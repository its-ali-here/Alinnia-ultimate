import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Button } from "../../components/Button";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useTheme } from "../../contexts/ThemeContext";
import { fontFamily, fontSize, spacing, type ThemeColors } from "../../lib/theme";

// This splash is always a dramatic dark hero, in both app themes — in dark
// mode that's just the theme's own background/text; in light mode it borrows
// the theme's own dark-green text color as a stand-in "dark surface" (a
// one-off inversion, not a real dark-mode branch).
export default function Welcome() {
  const { colors, mode } = useTheme();
  const heroBg = mode === "dark" ? colors.background : colors.text;
  const heroFg = mode === "dark" ? colors.text : colors.background;
  const heroMuted = mode === "dark" ? colors.textMuted : "rgba(251,250,242,0.66)";
  const heroFaint = mode === "dark" ? colors.textMuted : "rgba(251,250,242,0.5)";
  const styles = getStyles(colors, heroBg, heroFg, heroMuted, heroFaint);

  return (
    <ScreenContainer style={styles.container} topSpacing={0}>
      <View style={styles.hero}>
        <View style={styles.mark}>
          <View style={styles.markCore} />
          <View style={[styles.markDot, styles.markDotTop]} />
          <View style={[styles.markDot, styles.markDotLeft]} />
          <View style={[styles.markDot, styles.markDotRight]} />
        </View>
        <Text style={styles.headline}>Alinnia decides dinner for your whole household.</Text>
        <Text style={styles.subtext}>Familiar food, balanced across the week, sized for everyone at your table.</Text>
      </View>

      <View style={styles.footer}>
        <Button title="Set up my kitchen" onPress={() => router.push("/(setup)/cuisine")} style={styles.button} />
        <Button
          title="I already have an account"
          variant="secondary"
          onPress={() => router.push("/(auth)/sign-in")}
          style={styles.button}
        />
        <Text style={styles.skip}>Takes about a minute · no account needed</Text>
      </View>
    </ScreenContainer>
  );
}

const MARK_SIZE = 78;

function getStyles(colors: ThemeColors, heroBg: string, heroFg: string, heroMuted: string, heroFaint: string) {
  return StyleSheet.create({
    container: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, justifyContent: "space-between", backgroundColor: heroBg },
    hero: { flex: 1, justifyContent: "center", alignItems: "center" },
    mark: {
      width: MARK_SIZE,
      height: MARK_SIZE,
      borderRadius: MARK_SIZE / 2,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.xl,
    },
    markCore: { width: 30, height: 30, borderRadius: 15, backgroundColor: heroBg },
    markDot: { position: "absolute", width: 7, height: 7, borderRadius: 3.5, backgroundColor: heroBg },
    markDotTop: { top: 12 },
    markDotLeft: { bottom: 16, left: 16, backgroundColor: colors.accent },
    markDotRight: { bottom: 16, right: 16 },
    headline: {
      fontSize: fontSize.display,
      fontFamily: fontFamily.displayBold,
      color: heroFg,
      textAlign: "center",
      lineHeight: 36,
    },
    subtext: {
      fontSize: fontSize.md,
      fontFamily: fontFamily.bodyMedium,
      color: heroMuted,
      textAlign: "center",
      marginTop: spacing.md,
      lineHeight: 21,
    },
    footer: { paddingBottom: spacing.md },
    button: { marginBottom: spacing.md },
    skip: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.bodyBold,
      color: heroFaint,
      textAlign: "center",
      marginTop: spacing.xs,
    },
  });
}
