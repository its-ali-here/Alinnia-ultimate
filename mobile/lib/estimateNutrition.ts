export type UnitSystem = "us" | "metric";
export type BioSex = "female" | "male" | "other";
export type BodyFat = "low" | "medium" | "high";
export type GoalMode = "general" | "exact";
export type GeneralGoal = "lose_fat" | "maintain" | "build_muscle";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "very" | "extreme";

export interface EstimateInput {
  unitSystem: UnitSystem;
  heightFeet: number;
  heightInches: number;
  heightCm: number;
  weightLb: number;
  weightKg: number;
  bioSex: BioSex;
  age: number;
  bodyFat: BodyFat;
  goalMode: GoalMode;
  goalGeneral: GeneralGoal;
  goalWeight: number;
  weightChangeRate: number;
  activityLevel: ActivityLevel;
}

export interface EstimateResult {
  calories: number;
  carbsG: number;
  fatG: number;
  proteinG: number;
}

const LB_PER_KG = 0.453592;

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extreme: 1.9,
};

// Leaner bodies carry more metabolically active lean mass per pound; rough heuristic nudge, not clinical.
const BODY_FAT_ADJUST: Record<BodyFat, number> = { low: 1.05, medium: 1, high: 0.95 };

function toKg(lb: number) {
  return lb * LB_PER_KG;
}

function toCm(feet: number, inches: number) {
  return (feet * 12 + inches) * 2.54;
}

// Mifflin-St Jeor RMR. "Other" uses the midpoint of the male/female offsets.
function restingRate(weightKg: number, heightCm: number, age: number, sex: BioSex) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === "male") return base + 5;
  if (sex === "female") return base - 161;
  return base - 78;
}

export function estimateNutrition(input: EstimateInput): EstimateResult {
  const weightKg = input.unitSystem === "metric" ? input.weightKg : toKg(input.weightLb);
  const weightLb = input.unitSystem === "metric" ? input.weightKg / LB_PER_KG : input.weightLb;
  const heightCm = input.unitSystem === "metric" ? input.heightCm : toCm(input.heightFeet, input.heightInches);

  const rmr = restingRate(weightKg, heightCm, input.age, input.bioSex) * BODY_FAT_ADJUST[input.bodyFat];
  const tdee = rmr * ACTIVITY_MULTIPLIER[input.activityLevel];

  let calories: number;
  if (input.goalMode === "exact") {
    const goalWeightKg = input.unitSystem === "metric" ? input.goalWeight : toKg(input.goalWeight);
    const direction = goalWeightKg < weightKg ? -1 : goalWeightKg > weightKg ? 1 : 0;
    const ratePerWeekLb = input.unitSystem === "metric" ? input.weightChangeRate / LB_PER_KG : input.weightChangeRate;
    calories = tdee + direction * ratePerWeekLb * 500; // ~3500 kcal per lb, spread over 7 days
  } else if (input.goalGeneral === "lose_fat") {
    calories = tdee - 500;
  } else if (input.goalGeneral === "build_muscle") {
    calories = tdee + 300;
  } else {
    calories = tdee;
  }
  calories = Math.max(1000, Math.round(calories));

  // Minimum floors (matching the app's "at least Xg" framing), not a full macro split —
  // the rest of each day's calories stay flexible across whatever the diet type allows.
  const proteinG = Math.round(weightLb * 0.6);
  const fatG = Math.round(weightLb * 0.3);
  const carbsG = Math.max(5, Math.round((calories * 0.03) / 4));

  return { calories, carbsG, fatG, proteinG };
}
