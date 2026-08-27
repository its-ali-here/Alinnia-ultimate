export interface MockFood {
  id: string;
  name: string;
  variant?: string;
  calories: number;
  carbsG: number;
  fatG: number;
  proteinG: number;
  emoji: string;
  color: string;
  defaultAmount: number;
  defaultUnit: string;
  gramWeight: number;
  units?: string[];
}

export const USDA_FOODS: MockFood[] = [
  { id: "salt", name: "Salt", variant: "table", calories: 0, carbsG: 0, fatG: 0, proteinG: 0, emoji: "🧂", color: "#EDEDED", defaultAmount: 1, defaultUnit: "tbsp", gramWeight: 18, units: ["tbsp", "tsp", "dash", "g"] },
  { id: "black-pepper", name: "Black pepper", variant: "ground", calories: 16, carbsG: 4, fatG: 0.2, proteinG: 0.7, emoji: "⚫", color: "#3A3A3A", defaultAmount: 1, defaultUnit: "tbsp", gramWeight: 6, units: ["tbsp", "tsp", "dash", "g"] },
  { id: "olive-oil", name: "Olive oil", calories: 119, carbsG: 0, fatG: 13.5, proteinG: 0, emoji: "🫒", color: "#DCE8A0", defaultAmount: 1, defaultUnit: "tbsp", gramWeight: 14, units: ["tbsp", "tsp", "cup", "g"] },
  { id: "egg", name: "Egg", variant: "whole", calories: 72, carbsG: 0.4, fatG: 4.8, proteinG: 6.3, emoji: "🥚", color: "#F5E6C8", defaultAmount: 1, defaultUnit: "large", gramWeight: 50, units: ["large", "extra large", "g"] },
  { id: "onion", name: "Onion", variant: "raw", calories: 64, carbsG: 15, fatG: 0.2, proteinG: 1.8, emoji: "🧅", color: "#E8C9A0", defaultAmount: 1, defaultUnit: "cup, chopped", gramWeight: 160, units: ["cup, chopped", "whole", "g"] },
  { id: "yellow-onion", name: "Yellow onion", variant: "raw", calories: 64, carbsG: 15, fatG: 0.2, proteinG: 1.8, emoji: "🧅", color: "#F0DFA8", defaultAmount: 1, defaultUnit: "cup, chopped", gramWeight: 160, units: ["cup, chopped", "whole", "g"] },
  { id: "red-onion", name: "Red onion", variant: "raw", calories: 64, carbsG: 15, fatG: 0.2, proteinG: 1.8, emoji: "🧅", color: "#C9A0C0", defaultAmount: 1, defaultUnit: "cup, chopped", gramWeight: 160, units: ["cup, chopped", "whole", "g"] },
  { id: "garlic", name: "Garlic", variant: "raw", calories: 13, carbsG: 3, fatG: 0, proteinG: 0.6, emoji: "🧄", color: "#EDEDED", defaultAmount: 1, defaultUnit: "tbsp, minced", gramWeight: 9, units: ["tbsp, minced", "clove", "g"] },

  { id: "egg-white", name: "Egg white", calories: 17, carbsG: 0.2, fatG: 0, proteinG: 3.6, emoji: "🥚", color: "#FBFAF2", defaultAmount: 1, defaultUnit: "large", gramWeight: 33, units: ["large", "cup", "g"] },
  { id: "spinach", name: "Spinach", variant: "raw", calories: 7, carbsG: 1.1, fatG: 0.1, proteinG: 0.9, emoji: "🥬", color: "#B7D98C", defaultAmount: 1, defaultUnit: "cup", gramWeight: 30, units: ["cup", "g"] },
  { id: "swiss-cheese", name: "Swiss cheese", calories: 106, carbsG: 1.5, fatG: 7.8, proteinG: 7.6, emoji: "🧀", color: "#F5E1A4", defaultAmount: 1, defaultUnit: "slice", gramWeight: 28, units: ["slice", "cup, shredded", "g"] },
  { id: "banana", name: "Banana", calories: 105, carbsG: 27, fatG: 0.4, proteinG: 1.3, emoji: "🍌", color: "#F2E19A", defaultAmount: 1, defaultUnit: "medium", gramWeight: 118, units: ["medium", "cup, sliced", "g"] },
  { id: "coconut-milk", name: "Coconut milk", calories: 76, carbsG: 1.6, fatG: 8, proteinG: 0.5, emoji: "🥥", color: "#F2EFE3", defaultAmount: 0.5, defaultUnit: "cup", gramWeight: 120, units: ["cup", "tbsp", "g"] },
  { id: "honey", name: "Honey", calories: 64, carbsG: 17, fatG: 0, proteinG: 0.1, emoji: "🍯", color: "#F2C14E", defaultAmount: 1, defaultUnit: "tbsp", gramWeight: 21, units: ["tbsp", "tsp", "g"] },
  { id: "ground-beef", name: "Ground beef", variant: "85/15", calories: 215, carbsG: 0, fatG: 15, proteinG: 18, emoji: "🥩", color: "#D9A6A0", defaultAmount: 100, defaultUnit: "g", gramWeight: 100, units: ["g", "oz"] },
  { id: "white-rice", name: "White rice", variant: "cooked", calories: 205, carbsG: 45, fatG: 0.4, proteinG: 4.3, emoji: "🍚", color: "#F5F0E1", defaultAmount: 1, defaultUnit: "cup", gramWeight: 158, units: ["cup", "g"] },
  { id: "soy-sauce", name: "Soy sauce", calories: 8, carbsG: 0.8, fatG: 0, proteinG: 1.3, emoji: "🍶", color: "#8C5A3C", defaultAmount: 1, defaultUnit: "tbsp", gramWeight: 16, units: ["tbsp", "tsp", "g"] },
  { id: "sesame-oil", name: "Sesame oil", calories: 40, carbsG: 0, fatG: 4.5, proteinG: 0, emoji: "🫙", color: "#D9C08A", defaultAmount: 1, defaultUnit: "tsp", gramWeight: 4.5, units: ["tsp", "tbsp", "g"] },
  { id: "chicken-breast", name: "Chicken breast", variant: "skinless", calories: 165, carbsG: 0, fatG: 3.6, proteinG: 31, emoji: "🍗", color: "#E8C39E", defaultAmount: 100, defaultUnit: "g", gramWeight: 100, units: ["g", "oz", "breast"] },
  { id: "romaine-lettuce", name: "Romaine lettuce", calories: 8, carbsG: 1.5, fatG: 0.1, proteinG: 0.6, emoji: "🥬", color: "#C3E0A0", defaultAmount: 1, defaultUnit: "cup, chopped", gramWeight: 47, units: ["cup, chopped", "g"] },
  { id: "caesar-dressing", name: "Caesar dressing", calories: 78, carbsG: 0.7, fatG: 8.3, proteinG: 0.5, emoji: "🥗", color: "#EDEBD9", defaultAmount: 1, defaultUnit: "tbsp", gramWeight: 15, units: ["tbsp", "g"] },
  { id: "parmesan-cheese", name: "Parmesan cheese", variant: "grated", calories: 22, carbsG: 0.2, fatG: 1.5, proteinG: 2, emoji: "🧀", color: "#F2E7C9", defaultAmount: 1, defaultUnit: "tbsp", gramWeight: 5, units: ["tbsp", "cup, grated", "g"] },
  { id: "butter", name: "Butter", calories: 102, carbsG: 0, fatG: 11.5, proteinG: 0.1, emoji: "🧈", color: "#F2D98A", defaultAmount: 1, defaultUnit: "tbsp", gramWeight: 14, units: ["tbsp", "tsp", "g"] },
  { id: "teriyaki-sauce", name: "Teriyaki sauce", calories: 30, carbsG: 6, fatG: 0, proteinG: 1, emoji: "🍶", color: "#8C5A3C", defaultAmount: 1, defaultUnit: "tbsp", gramWeight: 18, units: ["tbsp", "g"] },
  { id: "sweet-potato-raw", name: "Sweet potato", variant: "raw", calories: 112, carbsG: 26, fatG: 0.1, proteinG: 2, emoji: "🍠", color: "#E3A469", defaultAmount: 1, defaultUnit: "medium", gramWeight: 130, units: ["medium", "cup, cubed", "g"] },
  { id: "canned-tuna", name: "Tuna", variant: "canned in water", calories: 73, carbsG: 0, fatG: 0.8, proteinG: 16, emoji: "🐟", color: "#C9C4B8", defaultAmount: 1, defaultUnit: "can", gramWeight: 85, units: ["can", "oz", "g"] },
  { id: "mayo", name: "Mayonnaise", calories: 94, carbsG: 0.1, fatG: 10.3, proteinG: 0.1, emoji: "🥄", color: "#F5F0E1", defaultAmount: 1, defaultUnit: "tbsp", gramWeight: 14, units: ["tbsp", "tsp", "g"] },
  { id: "white-bread", name: "White bread", calories: 79, carbsG: 15, fatG: 1, proteinG: 2.7, emoji: "🍞", color: "#EAD9B0", defaultAmount: 1, defaultUnit: "slice", gramWeight: 30, units: ["slice", "g"] },
  { id: "celery", name: "Celery", variant: "raw", calories: 6, carbsG: 1.2, fatG: 0.1, proteinG: 0.3, emoji: "🥬", color: "#CDE8B0", defaultAmount: 1, defaultUnit: "stalk", gramWeight: 40, units: ["stalk", "cup, chopped", "g"] },
];

export function getFoodById(id: string): MockFood | undefined {
  return USDA_FOODS.find((f) => f.id === id);
}
