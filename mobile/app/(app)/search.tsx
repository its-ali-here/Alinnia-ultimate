import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CreateRow, SearchResultRow } from "../../components/SearchResultRow";
import { ScreenContainer } from "../../components/ScreenContainer";
import { UnderlineTabs } from "../../components/UnderlineTabs";
import { darkColors, fontFamily, fontSize, radius, spacing } from "../../lib/theme";
import { FEATURED_RECIPES } from "../../lib/mockRecipes";
import { USDA_FOODS } from "../../lib/mockFoods";

type MainTab = "all" | "recipes" | "foods" | "collections";
type RecipesTab = "featured" | "mine";
type FoodsTab = "all" | "custom" | "usda" | "branded" | "restaurant";

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "recipes", label: "Recipes" },
  { key: "foods", label: "Foods" },
  { key: "collections", label: "Collections" },
];

function notImplemented(what: string) {
  Alert.alert("Coming soon", `${what} isn't built yet.`);
}

function matches(query: string, name: string) {
  return name.toLowerCase().includes(query.trim().toLowerCase());
}

export default function Search() {
  const [mainTab, setMainTab] = useState<MainTab>("all");
  const [recipesTab, setRecipesTab] = useState<RecipesTab>("featured");
  const [foodsTab, setFoodsTab] = useState<FoodsTab>("usda");
  const [query, setQuery] = useState("");

  const recipes = FEATURED_RECIPES.filter((r) => matches(query, r.name));
  const foods = USDA_FOODS.filter((f) => matches(query, f.name));

  const showFunnel = mainTab === "all";
  const showBarcode = mainTab === "all" || mainTab === "foods";

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.mainTabsRow}>
        {MAIN_TABS.map((tab) => (
          <Pressable key={tab.key} onPress={() => setMainTab(tab.key)}>
            <Text style={[styles.mainTabLabel, mainTab === tab.key && styles.mainTabLabelActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      {mainTab === "recipes" ? (
        <View style={styles.subTabsWrap}>
          <UnderlineTabs
            tabs={[
              { key: "featured", label: "Featured" },
              { key: "mine", label: "My Recipes" },
            ]}
            activeKey={recipesTab}
            onChange={(k) => setRecipesTab(k as RecipesTab)}
          />
        </View>
      ) : null}

      {mainTab === "foods" ? (
        <View style={styles.subTabsWrap}>
          <UnderlineTabs
            tabs={[
              { key: "all", label: "All" },
              { key: "custom", label: "Custom" },
              { key: "usda", label: "USDA" },
              { key: "branded", label: "Branded" },
              { key: "restaurant", label: "Restaurant" },
            ]}
            activeKey={foodsTab}
            onChange={(k) => setFoodsTab(k as FoodsTab)}
          />
        </View>
      ) : null}

      <View style={styles.searchBarRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={darkColors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={darkColors.textMuted}
            style={styles.searchInput}
          />
        </View>
        {showFunnel ? (
          <Pressable onPress={() => notImplemented("Filters")} hitSlop={8}>
            <Ionicons name="filter" size={22} color={darkColors.text} />
          </Pressable>
        ) : null}
        {showBarcode ? (
          <Pressable onPress={() => notImplemented("Barcode scanning")} hitSlop={8}>
            <Ionicons name="barcode-outline" size={22} color={darkColors.text} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {mainTab === "all" ? (
          <>
            <CreateRow label="Create recipe or food" onPress={() => notImplemented("Creating a recipe or food")} />
            {recipes.map((r) => (
              <SearchResultRow
                key={r.id}
                emoji={r.emoji}
                color={r.color}
                title={r.name}
                subtitleLines={[`${r.calories} Cal per serving`]}
                onAdd={() => notImplemented(`Adding ${r.name}`)}
              />
            ))}
          </>
        ) : null}

        {mainTab === "recipes" ? (
          recipesTab === "featured" ? (
            <>
              <CreateRow label="Create recipe" onPress={() => notImplemented("Creating a recipe")} />
              {recipes.map((r) => (
                <SearchResultRow
                  key={r.id}
                  emoji={r.emoji}
                  color={r.color}
                  title={r.name}
                  subtitleLines={[`${r.calories} Cal per serving`]}
                  onAdd={() => notImplemented(`Adding ${r.name}`)}
                />
              ))}
            </>
          ) : (
            <EmptyState text="You haven't created any recipes yet." />
          )
        ) : null}

        {mainTab === "foods" ? (
          foodsTab === "usda" || foodsTab === "all" ? (
            <>
              <CreateRow label="Create food" onPress={() => notImplemented("Creating a food")} />
              {foods.map((f) => (
                <SearchResultRow
                  key={f.id}
                  emoji={f.emoji}
                  color={f.color}
                  title={f.name}
                  subtitleLines={[...(f.variant ? [f.variant] : []), `${f.calories} Cal per serving`]}
                  onAdd={() => notImplemented(`Adding ${f.name}`)}
                />
              ))}
            </>
          ) : (
            <EmptyState text="No foods here yet." />
          )
        ) : null}

        {mainTab === "collections" ? <EmptyState text="You haven't created any collections yet." /> : null}
      </ScrollView>
    </ScreenContainer>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  mainTabsRow: { flexDirection: "row", gap: spacing.lg, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  mainTabLabel: { fontSize: fontSize.xl, fontFamily: fontFamily.bodyBold, color: darkColors.textMuted },
  mainTabLabelActive: { color: darkColors.coral },
  subTabsWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  searchBarRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: darkColors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  searchInput: { flex: 1, fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text, padding: 0 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  empty: { paddingVertical: spacing.xl, alignItems: "center" },
  emptyText: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: darkColors.textMuted },
});
