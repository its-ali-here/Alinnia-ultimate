import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_DATA_DIR = join(__dirname, "seed-data");
const foods = JSON.parse(readFileSync(join(SEED_DATA_DIR, "foods.json"), "utf8"));

// Pricing directory for Foodpanda (PKR average rates)
const PRICE_MAP = {
  // Meats & Seafood
  "Chicken breast, skinless": { package_price: 850, package_size: 1000, package_unit: "g" },
  "Chicken thigh, skinless": { package_price: 650, package_size: 1000, package_unit: "g" },
  "Egg, whole": { package_price: 300, package_size: 600, package_unit: "g" },
  "Salmon, Atlantic": { package_price: 1500, package_size: 500, package_unit: "g" },
  "Ground beef, 80/20": { package_price: 1100, package_size: 1000, package_unit: "g" },
  "Beef, boneless chuck, raw": { package_price: 1200, package_size: 1000, package_unit: "g" },
  "Mutton (lamb), lean, raw": { package_price: 2200, package_size: 1000, package_unit: "g" },
  "Shrimp (prawns), raw": { package_price: 950, package_size: 500, package_unit: "g" },
  "Paneer": { package_price: 300, package_size: 200, package_unit: "g" },
  "Tofu, firm": { package_price: 350, package_size: 250, package_unit: "g" },
  "Halloumi cheese": { package_price: 650, package_size: 250, package_unit: "g" },

  // Grains & Flours
  "White rice, cooked": { package_price: 360, package_size: 1000, package_unit: "g" },
  "Brown rice, cooked": { package_price: 450, package_size: 1000, package_unit: "g" },
  "Roti, whole wheat": { package_price: 130, package_size: 1000, package_unit: "g" },
  "Naan": { package_price: 40, package_size: 100, package_unit: "g" },
  "Oats, rolled, dry": { package_price: 420, package_size: 500, package_unit: "g" },
  "White bread": { package_price: 160, package_size: 400, package_unit: "g" },
  "Pita bread, whole wheat": { package_price: 180, package_size: 300, package_unit: "g" },
  "Pasta, cooked": { package_price: 220, package_size: 400, package_unit: "g" },
  "Egg noodles, cooked": { package_price: 190, package_size: 300, package_unit: "g" },
  "Semolina (sooji), dry": { package_price: 140, package_size: 500, package_unit: "g" },
  "Besan (chickpea/gram flour)": { package_price: 180, package_size: 500, package_unit: "g" },
  "All-purpose flour (maida)": { package_price: 150, package_size: 1000, package_unit: "g" },
  "Bulgur wheat, cooked": { package_price: 320, package_size: 500, package_unit: "g" },
  "Oats Original": { package_price: 520, package_size: 500, package_unit: "g" },

  // Pulses & Legumes (Daal)
  "Chickpeas, cooked": { package_price: 190, package_size: 500, package_unit: "g" },
  "Red lentils (daal), cooked": { package_price: 170, package_size: 500, package_unit: "g" },
  "Channa dal (split chickpea lentils), cooked": { package_price: 180, package_size: 500, package_unit: "g" },
  "Maash dal (split black gram/urad), cooked": { package_price: 280, package_size: 500, package_unit: "g" },
  "Moong dal (split mung bean), cooked": { package_price: 180, package_size: 500, package_unit: "g" },
  "Fava beans (foul), cooked": { package_price: 220, package_size: 400, package_unit: "g" },
  "White cannellini beans, cooked": { package_price: 260, package_size: 500, package_unit: "g" },

  // Produce (Vegetables & Aromatics)
  "Tomato, raw": { package_price: 120, package_size: 1000, package_unit: "g" },
  "Onion, raw": { package_price: 140, package_size: 1000, package_unit: "g" },
  "Potato, boiled": { package_price: 90, package_size: 1000, package_unit: "g" },
  "Sweet potato, baked": { package_price: 160, package_size: 1000, package_unit: "g" },
  "Garlic, raw": { package_price: 200, package_size: 250, package_unit: "g" },
  "Ginger, raw": { package_price: 220, package_size: 250, package_unit: "g" },
  "Green chili pepper, raw": { package_price: 50, package_size: 100, package_unit: "g" },
  "Coriander (cilantro) leaves, raw": { package_price: 40, package_size: 100, package_unit: "g" },
  "Mint leaves, fresh": { package_price: 40, package_size: 100, package_unit: "g" },
  "Parsley, fresh flat leaf": { package_price: 60, package_size: 100, package_unit: "g" },
  "Spinach, raw": { package_price: 80, package_size: 1000, package_unit: "g" },
  "Okra (bhindi), raw": { package_price: 110, package_size: 500, package_unit: "g" },
  "Bell pepper, red": { package_price: 120, package_size: 500, package_unit: "g" },
  "Cabbage, raw": { package_price: 90, package_size: 1000, package_unit: "g" },
  "Cauliflower, raw": { package_price: 110, package_size: 1000, package_unit: "g" },
  "Broccoli, fresh raw": { package_price: 250, package_size: 500, package_unit: "g" },
  "Mushrooms, white button": { package_price: 280, package_size: 200, package_unit: "g" },
  "Cucumber": { package_price: 90, package_size: 1000, package_unit: "g" },
  "Carrot, raw": { package_price: 100, package_size: 1000, package_unit: "g" },
  "Green peas (matar), cooked": { package_price: 180, package_size: 500, package_unit: "g" },
  "Eggplant (baingan), raw": { package_price: 100, package_size: 1000, package_unit: "g" },
  "Apple": { package_price: 260, package_size: 1000, package_unit: "g" },
  "Banana": { package_price: 180, package_size: 1000, package_unit: "g" },
  "Mango": { package_price: 280, package_size: 1000, package_unit: "g" },
  "Strawberry": { package_price: 320, package_size: 500, package_unit: "g" },
  "Lemon juice, fresh": { package_price: 80, package_size: 250, package_unit: "g" },

  // Dairy & Fats
  "Milk, whole": { package_price: 260, package_size: 1000, package_unit: "ml" },
  "Milk, skim": { package_price: 280, package_size: 1000, package_unit: "ml" },
  "UHT Milk": { package_price: 290, package_size: 1000, package_unit: "ml" },
  "Yogurt (dahi), plain whole milk": { package_price: 140, package_size: 500, package_unit: "g" },
  "Greek yogurt, plain whole milk": { package_price: 380, package_size: 400, package_unit: "g" },
  "Butter": { package_price: 420, package_size: 200, package_unit: "g" },
  "Ghee": { package_price: 950, package_size: 500, package_unit: "g" },
  "Cheddar cheese": { package_price: 450, package_size: 200, package_unit: "g" },
  "Parmesan cheese, grated": { package_price: 680, package_size: 150, package_unit: "g" },
  "Olive oil": { package_price: 1650, package_size: 500, package_unit: "g" },
  "Vegetable oil": { package_price: 520, package_size: 1000, package_unit: "g" },
  "Peanut butter": { package_price: 480, package_size: 350, package_unit: "g" },

  // Spices, Sauces & Pantry
  "Salt": { package_price: 60, package_size: 800, package_unit: "g" },
  "Black pepper, ground": { package_price: 180, package_size: 100, package_unit: "g" },
  "Cumin seed": { package_price: 180, package_size: 100, package_unit: "g" },
  "Turmeric, ground": { package_price: 120, package_size: 100, package_unit: "g" },
  "Garam masala, ground": { package_price: 140, package_size: 100, package_unit: "g" },
  "Red chili powder": { package_price: 130, package_size: 100, package_unit: "g" },
  "Coriander seed, ground": { package_price: 110, package_size: 100, package_unit: "g" },
  "Cardamom, ground": { package_price: 250, package_size: 50, package_unit: "g" },
  "Sumac, ground": { package_price: 220, package_size: 100, package_unit: "g" },
  "Za'atar spice blend": { package_price: 240, package_size: 100, package_unit: "g" },
  "Dried black lime (loomi), crushed": { package_price: 150, package_size: 100, package_unit: "g" },
  "Tahini (sesame paste)": { package_price: 650, package_size: 250, package_unit: "g" },
  "Basil pesto sauce": { package_price: 680, package_size: 190, package_unit: "g" },
  "Pomegranate molasses": { package_price: 450, package_size: 250, package_unit: "g" },
  "Soy sauce, light": { package_price: 180, package_size: 300, package_unit: "g" },
  "Sugar, white granulated": { package_price: 160, package_size: 1000, package_unit: "g" },
  "Zinger Burger": { package_price: 650, package_size: 230, package_unit: "g" },
};

const lines = [];
lines.push("-- ============================================================================");
lines.push("-- Foodpanda Groceries (Pakistan) Average Pricing Seed");
lines.push("-- Matches foods by name so it works with any existing database food IDs");
lines.push("-- ============================================================================");
lines.push("");

for (const f of foods) {
  const p = PRICE_MAP[f.name] || {
    package_price: 200,
    package_size: 500,
    package_unit: "g",
  };
  const pricePerGram = (p.package_price / p.package_size).toFixed(4);
  const escapedName = f.name.replace(/'/g, "''");

  lines.push(
    `insert into public.food_prices (food_id, country_code, currency, package_price, package_size, package_unit, price_per_gram, store_name, updated_at) select id, 'PK', 'PKR', ${p.package_price.toFixed(2)}, ${p.package_size.toFixed(2)}, '${p.package_unit}', ${pricePerGram}, 'Foodpanda Pandamart', now() from public.foods where name = '${escapedName}' on conflict (food_id, country_code) do update set package_price = excluded.package_price, package_size = excluded.package_size, price_per_gram = excluded.price_per_gram, updated_at = now();`
  );
}

const outSql = lines.join("\n") + "\n";
const OUT_PATH = join(__dirname, "..", "supabase", "migrations", "0006_seed_food_prices.sql");
writeFileSync(OUT_PATH, outSql);
console.log(`Saved dynamic name-matching SQL to ${OUT_PATH}`);

