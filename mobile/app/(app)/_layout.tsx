import { Stack } from "expo-router";
import { colors, fontFamily, fontSize } from "../../lib/theme";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fontFamily.bodyBold, fontSize: fontSize.lg },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="home" options={{ title: "This week" }} />
      <Stack.Screen name="suggestion" options={{ title: "Today's suggestion" }} />
      <Stack.Screen name="ingredients" options={{ title: "Shopping list" }} />
      <Stack.Screen name="summary" options={{ title: "Weekly summary" }} />
    </Stack>
  );
}
