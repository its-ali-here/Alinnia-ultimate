import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import type { Profile } from "../types/database";

export interface HouseholdMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  portion: "small" | "standard" | "large";
  spiceLevel: number;
  needs: string[];
  avoids: string[];
  favoriteCategory: string;
  bgColor: string;
  textColor?: string;
}

const STORAGE_PREFIX = "@alinnia_household_v1_";

const AVATAR_COLORS = [
  { bg: "#14A85C", text: "#FFFFFF" },
  { bg: "#FFC233", text: "#042A1C" },
  { bg: "#F0563E", text: "#FFFFFF" },
  { bg: "#0A4029", text: "#FFFFFF" },
  { bg: "#8FE64B", text: "#042A1C" },
  { bg: "#67796E", text: "#FFFFFF" },
];

const SPICE_SHORT_LABELS: Record<number, string> = {
  1: "Mild",
  2: "Med-Mild",
  3: "Medium",
  4: "Spicy",
  5: "Teekha",
};

const NEED_SHORT_LABELS: Record<string, string> = {
  diabetic: "Diabetic",
  training_hard: "High protein",
  high_blood_pressure: "Less salt",
  pregnant: "Nutrient-rich",
  fussy_eater: "Fussy eater",
};

const CATEGORY_LABELS: Record<string, string> = {
  curries: "Curries",
  rice: "Biryani & Rice",
  daal: "Daal & Sabzi",
  bbq: "Tikka & BBQ",
};

export function formatMemberSubtitle(member: HouseholdMember): string {
  const portionStr =
    member.portion === "small" ? "0.75x" : member.portion === "large" ? "1.5x" : "1x";
  const spiceStr = SPICE_SHORT_LABELS[member.spiceLevel] ?? "Medium";

  const extras: string[] = [];
  if (member.needs.length > 0) {
    extras.push(member.needs.map((n) => NEED_SHORT_LABELS[n] ?? n).join(", "));
  } else if (member.favoriteCategory) {
    extras.push(CATEGORY_LABELS[member.favoriteCategory] ?? member.favoriteCategory);
  } else if (member.role) {
    extras.push(member.role);
  }

  return `${portionStr} · 🌶️ ${spiceStr}${extras.length > 0 ? " · " + extras.join(" · ") : ""}`;
}

export function getMemberTag(member: HouseholdMember): string | undefined {
  if (member.needs.includes("diabetic")) return "DIABETIC";
  if (member.needs.includes("training_hard")) return "HIGH PROTEIN";
  if (member.needs.includes("high_blood_pressure")) return "LOW SALT";
  if (member.needs.includes("pregnant")) return "PREGNANT";
  if (member.needs.includes("fussy_eater")) return "FUSSY EATER";
  if (member.spiceLevel === 1) return "MILD SPICE";
  if (member.spiceLevel === 5) return "EXTRA HOT 🔥";
  return undefined;
}

export function generateDefaultHousehold(
  profile: Profile | null,
  adultsCount = 2,
  childrenCount = 0
): HouseholdMember[] {
  const members: HouseholdMember[] = [];
  const totalAdults = profile?.adults_count ?? adultsCount ?? 2;
  const totalKids = profile?.children_count ?? childrenCount ?? 0;
  const userSpice = profile?.spice_level ?? 3;
  const userNeeds = (profile?.household_needs as string[]) ?? [];
  const userAvoids = (profile?.avoids as string[]) ?? [];

  // 1. Primary User / Household Cook
  members.push({
    id: "member-1",
    name: "Ammi",
    avatar: "A",
    role: "You · Household Cook",
    portion: "standard",
    spiceLevel: userSpice,
    needs: userNeeds.filter((n) => n === "pregnant" || n === "diabetic"),
    avoids: userAvoids,
    favoriteCategory: "curries",
    bgColor: AVATAR_COLORS[0].bg,
    textColor: AVATAR_COLORS[0].text,
  });

  // 2. Second Adult (if present)
  if (totalAdults >= 2) {
    const hasDiabetic = userNeeds.includes("diabetic") || userNeeds.includes("high_blood_pressure");
    members.push({
      id: "member-2",
      name: "Abbu",
      avatar: "B",
      role: "Partner",
      portion: "standard",
      spiceLevel: Math.max(1, userSpice - 1),
      needs: hasDiabetic
        ? userNeeds.filter((n) => n === "diabetic" || n === "high_blood_pressure")
        : [],
      avoids: userAvoids,
      favoriteCategory: "daal",
      bgColor: AVATAR_COLORS[1].bg,
      textColor: AVATAR_COLORS[1].text,
    });
  }

  // 3. Third Adult (if present)
  if (totalAdults >= 3) {
    const hasFitness = userNeeds.includes("training_hard");
    members.push({
      id: "member-3",
      name: "Hamza",
      avatar: "H",
      role: "Family Member",
      portion: "large",
      spiceLevel: Math.min(5, userSpice + 1),
      needs: hasFitness ? ["training_hard"] : [],
      avoids: [],
      favoriteCategory: "bbq",
      bgColor: AVATAR_COLORS[2].bg,
      textColor: AVATAR_COLORS[2].text,
    });
  }

  // Additional Adults if > 3
  for (let i = 4; i <= totalAdults; i++) {
    const color = AVATAR_COLORS[(i - 1) % AVATAR_COLORS.length];
    members.push({
      id: `member-${i}`,
      name: `Adult ${i}`,
      avatar: String(i),
      role: "Family Member",
      portion: "standard",
      spiceLevel: userSpice,
      needs: [],
      avoids: [],
      favoriteCategory: "curries",
      bgColor: color.bg,
      textColor: color.text,
    });
  }

  // Children
  if (totalKids > 0) {
    members.push({
      id: `member-kids`,
      name: totalKids === 1 ? "Child" : "Children",
      avatar: String(totalKids),
      role: `Kids (${totalKids})`,
      portion: "small",
      spiceLevel: 1,
      needs: ["fussy_eater"],
      avoids: [],
      favoriteCategory: "rice",
      bgColor: AVATAR_COLORS[3].bg,
      textColor: AVATAR_COLORS[3].text,
    });
  }

  return members;
}

export async function getHouseholdMembers(
  userId: string,
  profile: Profile | null,
  adultsCount = 2,
  childrenCount = 0
): Promise<HouseholdMember[]> {
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load household members from storage:", e);
  }

  // Generate and persist defaults
  const defaults = generateDefaultHousehold(profile, adultsCount, childrenCount);
  await saveHouseholdMembers(userId, defaults);
  return defaults;
}

export async function saveHouseholdMembers(
  userId: string,
  members: HouseholdMember[]
): Promise<void> {
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(members));

    // Sync counts & aggregated needs/avoids to Supabase in the background
    const adults = members.filter((m) => m.portion !== "small").length;
    const kids = members.filter((m) => m.portion === "small").length;
    const allNeeds = Array.from(new Set(members.flatMap((m) => m.needs)));
    const allAvoids = Array.from(new Set(members.flatMap((m) => m.avoids)));

    supabase
      .from("profiles")
      .update({
        household_size: members.length,
        adults_count: Math.max(1, adults),
        children_count: kids,
        household_needs: allNeeds,
        avoids: allAvoids,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .then();
  } catch (e) {
    console.warn("Failed to save household members:", e);
  }
}

export function createNewMember(name: string, index: number): HouseholdMember {
  const trimmed = name.trim();
  const avatarChar = trimmed.charAt(0).toUpperCase() || "F";
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return {
    id: `member-${Date.now()}`,
    name: trimmed,
    avatar: avatarChar,
    role: "Family Member",
    portion: "standard",
    spiceLevel: 3,
    needs: [],
    avoids: [],
    favoriteCategory: "curries",
    bgColor: color.bg,
    textColor: color.text,
  };
}

