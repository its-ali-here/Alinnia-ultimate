export interface DietType {
  key: string;
  label: string;
  icon: string;
  excludes: string[];
}

export const DIET_TYPES: DietType[] = [
  { key: "anything", label: "Anything", icon: "🥪", excludes: [] },
  { key: "keto", label: "Keto", icon: "🌾", excludes: ["High-carb Grains", "Refined Starches", "Sugar"] },
  { key: "vegetarian", label: "Vegetarian", icon: "🥦", excludes: ["Red Meat", "Poultry", "Fish", "Shellfish"] },
  {
    key: "vegan",
    label: "Vegan",
    icon: "💚",
    excludes: ["Red Meat", "Poultry", "Fish", "Shellfish", "Dairy", "Eggs", "Mayo", "Honey"],
  },
  { key: "paleo", label: "Paleo", icon: "🍖", excludes: ["Dairy", "Grains", "Legumes", "Soy", "Refined Starches", "Sugar"] },
  {
    key: "mediterranean",
    label: "Mediterranean",
    icon: "🫐",
    excludes: ["Red Meat", "Processed Meats", "Fruit Juices", "Refined Starches", "Sugar"],
  },
];

export function excludesText(excludes: string[]) {
  return excludes.length ? excludes.join(", ") : "Nothing";
}

export function getDietType(key: string) {
  return DIET_TYPES.find((d) => d.key === key) ?? DIET_TYPES[0];
}
