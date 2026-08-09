import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { darkColors, fontFamily, fontSize } from "../../lib/theme";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: darkColors.coral,
        tabBarInactiveTintColor: darkColors.textMuted,
        tabBarStyle: { backgroundColor: darkColors.background, borderTopColor: darkColors.border },
        tabBarLabelStyle: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.xs },
      }}
    >
      <Tabs.Screen
        name="planner"
        options={{
          title: "Planner",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "search" : "search-outline"} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="preferences"
        options={{
          title: "Preferences",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
