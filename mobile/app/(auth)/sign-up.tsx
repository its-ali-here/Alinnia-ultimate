import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/Button";
import { FormInput } from "../../components/FormInput";
import { colors, spacing } from "../../lib/theme";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert("Couldn't sign up", error.message);
      return;
    }
    if (!data.session) {
      Alert.alert("Check your email", "Confirm your email address, then sign in.");
    }
    // If email confirmation is disabled in your Supabase project, the session
    // is created immediately and the root layout will route to onboarding.
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Takes less than a minute</Text>

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

      <Button title="Sign up" onPress={handleSignUp} loading={loading} disabled={!email || !password} />

      <Link href="/(auth)/sign-in" style={styles.link}>
        Already have an account? Sign in
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "700", color: colors.text, textAlign: "center" },
  subtitle: { fontSize: 16, color: colors.textMuted, textAlign: "center", marginBottom: spacing.xl },
  link: { marginTop: spacing.lg, textAlign: "center", color: colors.primary, fontSize: 14 },
});
