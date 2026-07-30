import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/Button";
import { FormInput } from "../../components/FormInput";
import { colors, spacing } from "../../lib/theme";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert("Couldn't sign in", error.message);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NutriKitchen</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

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
        placeholder="••••••••"
      />

      <Button title="Sign in" onPress={handleSignIn} loading={loading} disabled={!email || !password} />

      <Link href="/(auth)/sign-up" style={styles.link}>
        Don't have an account? Sign up
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", color: colors.text, textAlign: "center" },
  subtitle: { fontSize: 16, color: colors.textMuted, textAlign: "center", marginBottom: spacing.xl },
  link: { marginTop: spacing.lg, textAlign: "center", color: colors.primary, fontSize: 14 },
});
