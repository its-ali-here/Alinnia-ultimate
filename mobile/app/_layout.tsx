import type { PropsWithChildren } from "react";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Baloo2_600SemiBold, Baloo2_700Bold } from "@expo-google-fonts/baloo-2";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { PTSerif_400Regular } from "@expo-google-fonts/pt-serif";
import { AuthProvider, useAuth } from "../lib/auth";
import { OnboardingDraftProvider } from "../contexts/OnboardingDraft";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

function RootNavigator() {
  const { session, profile, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const isOnboarded = !!profile?.onboarded;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Guarded on !isOnboarded (not !session): the new flow creates a session
          partway through (setup) — at Save — but Reminder and Trial still come
          after it, still inside (setup). onboarded only flips true once Trial's
          complete_onboarding_v3 call finishes, so (setup) stays mounted for the
          whole session-creation → Reminder → Trial sequence. This also doubles
          as the resume path for a signed-in-but-incomplete user (e.g. force-quit
          between Save and Trial) — they land back in (setup) on relaunch instead
          of a missing route. */}
      <Stack.Protected guard={!isOnboarded}>
        <Stack.Screen name="(setup)" />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={!!session && isOnboarded}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="recipe/[id]" />
        <Stack.Screen name="food/[id]" />
        <Stack.Screen name="household-preferences" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="premium" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="search" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      </Stack.Protected>
    </Stack>
  );
}

function FontGate({ children }: PropsWithChildren) {
  const [fontsLoaded] = useFonts({
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
    PTSerif_400Regular,
  });
  const { colors } = useTheme();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <FontGate>
        <SafeAreaProvider>
          <AuthProvider>
            <OnboardingDraftProvider>
              <RootNavigator />
            </OnboardingDraftProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </FontGate>
    </ThemeProvider>
  );
}
