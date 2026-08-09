import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "../../components/ScreenContainer";
import { SettingsRow, SettingsSection } from "../../components/SettingsGroup";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { supabase } from "../../lib/supabase";
import { getDietType } from "../../lib/dietTypes";
import { darkColors, fontFamily, spacing } from "../../lib/theme";

function notImplemented(what: string) {
  Alert.alert("Coming soon", `${what} isn't built yet.`);
}

export default function Preferences() {
  const { dietType } = useOnboardingDraft();
  const diet = getDietType(dietType);

  return (
    <ScreenContainer topSpacing={spacing.lg}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Preferences</Text>

        <SettingsSection title="Your Library">
          <SettingsRow icon="star-outline" label="Collections" onPress={() => notImplemented("Collections")} />
          <SettingsRow icon="bookmark-outline" label="Saved Plans" onPress={() => notImplemented("Saved Plans")} last />
        </SettingsSection>

        <SettingsSection title="Plan Settings">
          <SettingsRow icon="restaurant-outline" label="Meal Settings" onPress={() => notImplemented("Meal Settings")} />
          <SettingsRow icon="layers-outline" label="Meal Layout" onPress={() => notImplemented("Meal Layout")} />
          <SettingsRow icon="file-tray-stacked-outline" label="Leftovers" onPress={() => notImplemented("Leftovers")} />
          <SettingsRow icon="options-outline" label="Generator Settings" onPress={() => notImplemented("Generator Settings")} />
          <SettingsRow icon="alarm-outline" label="Reminders" onPress={() => notImplemented("Reminders")} last />
        </SettingsSection>

        <SettingsSection title="Food Preferences">
          <SettingsRow icon="nutrition-outline" label="Primary Diet Type" value={diet.label} onPress={() => router.push("/(setup)/diet-type")} />
          <SettingsRow icon="ban-outline" label="Food Exclusions" onPress={() => notImplemented("Food Exclusions")} last />
        </SettingsSection>

        <SettingsSection title="Account">
          <SettingsRow icon="log-out-outline" label="Sign Out" onPress={() => supabase.auth.signOut()} last />
        </SettingsSection>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  title: { fontSize: 34, fontFamily: fontFamily.bodyBold, color: darkColors.text, marginBottom: spacing.xl },
});
