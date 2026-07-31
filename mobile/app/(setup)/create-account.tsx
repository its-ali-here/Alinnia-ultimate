import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/Button";
import { FormInput } from "../../components/FormInput";
import { StepProgress } from "../../components/StepProgress";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { colors, fontFamily, fontSize, spacing } from "../../lib/theme";

const CUISINE = "Pakistani";

export default function CreateAccount() {
  const { householdSize, avoidMeat, avoidSpicy, allergiesText, reset } = useOnboardingDraft();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateAccount() {
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

    const allergies = allergiesText.split(",").map((a) => a.trim()).filter(Boolean);
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
    <View style={styles.container}>
      <StepProgress step={3} total={3} />

      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Last step — this saves your kitchen setup.</Text>

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

      <View style={styles.footer}>
        <Button
          title="Start cooking"
          icon="checkmark"
          onPress={handleCreateAccount}
          loading={loading}
          disabled={!email || !password}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: spacing.xxl },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.displayBold, color: colors.text },
  subtitle: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  footer: { marginTop: "auto", paddingBottom: spacing.md },
});
