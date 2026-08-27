export interface CuisineOption {
  name: string;
  subtitle: string;
  emoji?: string;
}

export interface RegionCountry {
  id: string;
  name: string;
  flag: string;
  shortLabel: string;
  cuisines: CuisineOption[];
}

export const REGIONS_AND_COUNTRIES: RegionCountry[] = [
  // 1. Pakistan
  {
    id: "pakistan",
    name: "Pakistan",
    shortLabel: "Pakistan",
    flag: "🇵🇰",
    cuisines: [
      { name: "Punjabi", subtitle: "Karahi, saag, daal makhani" },
      { name: "Sindhi", subtitle: "Sindhi biryani, sai bhaji" },
      { name: "Karachi", subtitle: "Nihari, haleem, bun kebab" },
      { name: "Pashtun", subtitle: "Chapli kebab, kabuli pulao" },
      { name: "Balochi", subtitle: "Sajji, dampukht, rosh" },
      { name: "Continental", subtitle: "Pasta, cutlets, roasts" },
    ],
  },

  // 2. Saudi Arabia
  {
    id: "saudi",
    name: "Saudi Arabia",
    shortLabel: "Saudi Arabia",
    flag: "🇸🇦",
    cuisines: [
      { name: "Najdi & Central", subtitle: "Kabsa, jareesh, gursan" },
      { name: "Hejazi (Western)", subtitle: "Saleeg, roz bukhari, mantu" },
      { name: "Southern & Eastern", subtitle: "Mandi, mathbi, hasawi rice" },
    ],
  },

  // 3. UAE
  {
    id: "uae",
    name: "United Arab Emirates",
    shortLabel: "UAE",
    flag: "🇦🇪",
    cuisines: [
      { name: "Emirati Classics", subtitle: "Machboos deyay, harees, saloona" },
      { name: "Coastal & Grills", subtitle: "Jasheed, grilled hammour, biryani" },
    ],
  },
];

export function getCuisineFlag(cuisineName: string | null | undefined): string {
  if (!cuisineName) return "🍽️";
  const lower = cuisineName.toLowerCase();
  for (const country of REGIONS_AND_COUNTRIES) {
    if (
      country.cuisines.some(
        (c) => c.name.toLowerCase() === lower || lower.includes(c.name.toLowerCase())
      )
    ) {
      return country.flag;
    }
  }
  if (
    lower.includes("punjabi") ||
    lower.includes("sindhi") ||
    lower.includes("karachi") ||
    lower.includes("pashtun") ||
    lower.includes("balochi")
  ) {
    return "🇵🇰";
  }
  if (
    lower.includes("saudi") ||
    lower.includes("najdi") ||
    lower.includes("hejazi")
  ) {
    return "🇸🇦";
  }
  if (
    lower.includes("uae") ||
    lower.includes("emirati") ||
    lower.includes("coastal")
  ) {
    return "🇦🇪";
  }
  return "🇵🇰";
}
