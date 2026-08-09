export interface MealCategory {
  key: string;
  label: string;
  emoji: string;
  gradient: [string, string];
}

// Category photography isn't available, so tiles use an emoji over a themed gradient as a stand-in.
export const MEAL_CATEGORIES: Record<string, MealCategory[]> = {
  breakfast: [
    { key: "shakes-smoothies", label: "Shakes and smoothies", emoji: "🥤", gradient: ["#8E7CC3", "#5B4B8A"] },
    { key: "oatmeals-cereals", label: "Oatmeals and cereals", emoji: "🥣", gradient: ["#D9B98A", "#8A6A3D"] },
    { key: "omelets-scrambles", label: "Omelets and scrambles", emoji: "🍳", gradient: ["#F0D27A", "#C9A23D"] },
    { key: "toast-toppings", label: "Toast with toppings and spreads", emoji: "🍞", gradient: ["#A8C97A", "#6B8A3D"] },
  ],
  lunch: [
    { key: "sandwiches-wraps", label: "Sandwiches and wraps", emoji: "🥪", gradient: ["#E0B080", "#A87C4D"] },
    { key: "soups-stews", label: "Soups and stews", emoji: "🍲", gradient: ["#D97757", "#A8503A"] },
    { key: "rice-grain-bowls", label: "Rice and grain bowls", emoji: "🍚", gradient: ["#C9C9A0", "#8A8A5D"] },
    { key: "salads-lunch", label: "Salads", emoji: "🥗", gradient: ["#A8D97A", "#6B9A3D"] },
  ],
  dinner: [
    { key: "roasted-vegetables", label: "Roasted vegetables", emoji: "🥕", gradient: ["#E0985A", "#A85C2D"] },
    { key: "noodles-pastas", label: "Noodles and pastas", emoji: "🍜", gradient: ["#E0C97A", "#A88A3D"] },
    { key: "salads-dinner", label: "Salads", emoji: "🥗", gradient: ["#A8D97A", "#6B9A3D"] },
    { key: "hearty-meat", label: "Hearty meat dishes", emoji: "🍗", gradient: ["#C97A5A", "#8A4A2D"] },
  ],
  snack: [
    { key: "fruit-nut-mixes", label: "Fruit and nut mixes", emoji: "🥜", gradient: ["#D9A85A", "#A8703D"] },
    { key: "bars-granola", label: "Bars and granola", emoji: "🍫", gradient: ["#A8785A", "#6B4A2D"] },
    { key: "yogurt-dips", label: "Yogurt and dips", emoji: "🍦", gradient: ["#E0E0E0", "#A8A8A8"] },
    { key: "crackers-chips", label: "Crackers and chips", emoji: "🍿", gradient: ["#E0C97A", "#A8873D"] },
  ],
};
