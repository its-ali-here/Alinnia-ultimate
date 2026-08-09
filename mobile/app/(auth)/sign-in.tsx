import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { PillButton } from "../../components/PillButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { darkColors, fontFamily, fontSize, spacing } from "../../lib/theme";

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
    <ScreenContainer style={styles.container}>
      {router.canGoBack() ? (
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={darkColors.text} />
        </Pressable>
      ) : null}

      <View style={styles.hero}>
        <Text style={styles.title}>Mealinnia</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

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
            placeholder="••••••••"
            placeholderTextColor={darkColors.textMuted}
            style={styles.input}
          />
        </View>

        <PillButton
          title="Sign In"
          variant="coral"
          onPress={handleSignIn}
          loading={loading}
          disabled={!email || !password}
          style={styles.signInButton}
        />

        <Link href="/(setup)/welcome" style={styles.link}>
          Don't have an account? Get started
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  back: { marginBottom: spacing.lg },
  hero: { flex: 1, justifyContent: "center" },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.displayBold, color: darkColors.coral, textAlign: "center" },
  subtitle: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.textMuted, textAlign: "center", marginBottom: spacing.xl },
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
  signInButton: { marginTop: spacing.md },
  link: { marginTop: spacing.lg, textAlign: "center", color: darkColors.coral, fontFamily: fontFamily.bodyMedium, fontSize: fontSize.sm },
});
