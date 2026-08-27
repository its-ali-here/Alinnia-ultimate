export const NEEDS = [
  { key: "diabetic", label: "Diabetic", tone: "accent" as const },
  { key: "pregnant", label: "Pregnant", tone: "accent" as const },
  { key: "training_hard", label: "Training hard", tone: "primary" as const },
  { key: "fussy_eater", label: "Fussy eater", tone: "primary" as const },
  { key: "high_blood_pressure", label: "High blood pressure", tone: "accent" as const },
];

export function getNeedLabel(key: string) {
  return NEEDS.find((n) => n.key === key)?.label ?? key;
}
