import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { FormInput } from "../../components/FormInput";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useAuth } from "../../lib/auth";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";
import { fontFamily, fontSize, spacing, type ThemeColors } from "../../lib/theme";

export default function CreateAccount() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateAccount() {
    if (session) {
      router.push("/(setup)/reminders");
      return;
    }

    if (!email || !password) {
      Alert.alert("Almost there", "Enter an email and password to finish.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert("Couldn't sign up", error.message);
      return;
    }

    if (!data.session) {
      // Email confirmation is required — a session doesn't exist yet, so
      // onboarding can't finish until they confirm and sign in.
      Alert.alert(
        "Check your email",
        "Confirm your email address, then sign in — we'll pick up right where you left off."
      );
      return;
    }

    router.push("/(setup)/reminders");
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Save your plan</Text>
        <Text style={styles.subtitle}>An email and password — that's it.</Text>
        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 6 characters"
        />
      </View>

      <View style={styles.footer}>
        <Button title="Sign Up" onPress={handleCreateAccount} loading={loading} />
      </View>
    </ScreenContainer>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    header: { paddingHorizontal: spacing.lg },
    content: { paddingHorizontal: spacing.lg, marginTop: spacing.lg, flex: 1 },
    title: { fontSize: fontSize.xxl, fontFamily: fontFamily.displayBold, color: colors.text, marginBottom: 4 },
    subtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.textMuted, marginBottom: spacing.xl },
    footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  });
}
