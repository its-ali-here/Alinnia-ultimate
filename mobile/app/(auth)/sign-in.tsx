import { useRef, useState } from "react";
import { Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { PillButton } from "../../components/PillButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useTheme } from "../../contexts/ThemeContext";
import { fontFamily, fontSize, spacing, type ThemeColors } from "../../lib/theme";

export default function SignIn() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

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
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
      ) : null}

      <View style={styles.hero}>
        <Text style={styles.title}>Alinnia</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            ref={passwordRef}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>

        <PillButton
          title="Sign In"
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

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { padding: spacing.lg },
    back: { marginBottom: spacing.lg },
    hero: { flex: 1, justifyContent: "center" },
    title: { fontSize: fontSize.xxl, fontFamily: fontFamily.displayBold, color: colors.primary, textAlign: "center" },
    subtitle: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: colors.textMuted, textAlign: "center", marginBottom: spacing.xl },
    field: { marginBottom: spacing.xl },
    label: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.text, marginBottom: spacing.xs },
    input: {
      fontSize: fontSize.md,
      fontFamily: fontFamily.body,
      color: colors.text,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: spacing.sm,
    },
    signInButton: { marginTop: spacing.md },
    link: { marginTop: spacing.lg, textAlign: "center", color: colors.primary, fontFamily: fontFamily.bodyMedium, fontSize: fontSize.sm },
  });
}
