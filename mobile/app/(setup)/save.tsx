import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useAuth } from "../../lib/auth";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../../lib/theme";

const ROWS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "google", label: "Continue with Google", icon: "logo-google" },
  { key: "apple", label: "Continue with Apple", icon: "logo-apple" },
  { key: "email", label: "Continue with Email", icon: "mail-outline" },
];

export default function Save() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);

  function chooseRow() {
    // No Google/Apple/phone auth is wired up yet — every row leads to the
    // same real signup path (email + password) on the next screen.
    router.push("/(setup)/create-account");
  }

  async function notNow() {
    if (session) {
      router.push("/(setup)/reminders");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInAnonymously();
    setLoading(false);
    if (error) {
      Alert.alert("Couldn't continue", error.message);
      return;
    }
    router.push("/(setup)/reminders");
  }

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.iconBadge}>
          <Ionicons name="document-lock-outline" size={30} color={colors.primary} />
        </View>
        <Text style={styles.title}>Save your plan?</Text>
        <Text style={styles.subtitle}>So your kitchen, your list, and what you've cooked stay with you.</Text>

        <View style={styles.rows}>
          {ROWS.map((row) => (
            <Pressable key={row.key} style={styles.row} onPress={chooseRow}>
              <Ionicons name={row.icon} size={20} color={colors.text} />
              <Text style={styles.rowLabel}>{row.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={notNow} disabled={loading} hitSlop={8}>
          {loading ? (
            <ActivityIndicator color={colors.textMuted} />
          ) : (
            <Text style={styles.notNow}>Not now — keep looking around</Text>
          )}
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
    rows: { alignSelf: "stretch", marginTop: spacing.xl, gap: spacing.sm },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
    },
    rowLabel: { fontSize: fontSize.md, fontFamily: fontFamily.bodyBold, color: colors.text },
    footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, alignItems: "center" },
    notNow: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold, color: colors.textMuted },
  });
}
