export interface MockFood {
  id: string;
  name: string;
  variant?: string;
  calories: number;
  emoji: string;
  color: string;
}

export const USDA_FOODS: MockFood[] = [
  { id: "salt", name: "Salt", variant: "table", calories: 0, emoji: "🧂", color: "#EDEDED" },
  { id: "black-pepper", name: "Black pepper", variant: "ground", calories: 16, emoji: "⚫", color: "#3A3A3A" },
  { id: "olive-oil", name: "Olive oil", calories: 119, emoji: "🫒", color: "#DCE8A0" },
  { id: "egg", name: "Egg", variant: "whole", calories: 72, emoji: "🥚", color: "#F5E6C8" },
  { id: "onion", name: "Onion", variant: "raw", calories: 44, emoji: "🧅", color: "#E8C9A0" },
  { id: "yellow-onion", name: "Yellow onion", variant: "raw", calories: 44, emoji: "🧅", color: "#F0DFA8" },
  { id: "red-onion", name: "Red onion", variant: "raw", calories: 70, emoji: "🧅", color: "#C9A0C0" },
  { id: "garlic", name: "Garlic", variant: "raw", calories: 42, emoji: "🧄", color: "#EDEDED" },
];
