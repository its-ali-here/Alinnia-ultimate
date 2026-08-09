import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { PillButton } from "../../components/PillButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { WizardHeader } from "../../components/WizardHeader";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { darkColors, fontFamily, fontSize, spacing } from "../../lib/theme";

const CUISINE = "Pakistani";

export default function CreateAccount() {
  const { householdSize, avoidMeat, avoidSpicy, allergies, reset } = useOnboardingDraft();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateAccount() {
    if (!email || !password) {
      Alert.alert("Almost there", "Enter an email and password to finish.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      Alert.alert("Couldn't sign up", error.message);
      return;
    }

    if (!data.session) {
      // Email confirmation is required — the profile exists but onboarding can't
      // be saved until a real session exists. Finish it after they confirm and sign in.
      setLoading(false);
      Alert.alert(
        "Check your email",
        "Confirm your email address, then sign in — we'll finish setting up your kitchen right after."
      );
      return;
    }

    const { error: onboardError } = await supabase.rpc("complete_onboarding", {
      p_household_size: householdSize,
      p_cuisine: CUISINE,
      p_avoid_meat: avoidMeat,
      p_avoid_spicy: avoidSpicy,
      p_allergies: allergies,
    });
    setLoading(false);

    if (onboardError) {
      Alert.alert("Account created, but setup failed", onboardError.message);
      return;
    }

    reset();
    await refreshProfile();
  }

  return (
    <ScreenContainer>
      <WizardHeader title="Create your account" actionLabel="Sign Up" onAction={handleCreateAccount} />

      <View style={styles.content}>
        <Text style={styles.subtitle}>Last step — this saves your plan.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={darkColors.textMuted}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 6 characters"
            placeholderTextColor={darkColors.textMuted}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <PillButton title="Sign Up" variant="coral" onPress={handleCreateAccount} loading={loading} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  subtitle: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.textMuted, marginBottom: spacing.xl },
  field: { marginBottom: spacing.xl },
  label: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: darkColors.text, marginBottom: spacing.xs },
  input: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.body,
    color: darkColors.text,
    borderBottomWidth: 1,
    borderBottomColor: darkColors.border,
    paddingBottom: spacing.sm,
  },
  footer: { marginTop: "auto", paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
});
