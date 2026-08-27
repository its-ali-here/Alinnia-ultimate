import { REGIONS_AND_COUNTRIES } from "./cuisineData";

export interface RegionPricing {
  regionId: string;
  regionName: string;
  currencyCode: string;
  monthlyPrice: string;
  annualPrice: string;
  annualPerMonth: string;
  trialCalloutText: string;
  savingsPercentage: number;
}

export const REGIONAL_PRICING: Record<string, RegionPricing> = {
  pakistan: {
    regionId: "pakistan",
    regionName: "Pakistan",
    currencyCode: "PKR",
    monthlyPrice: "PKR 499",
    annualPrice: "PKR 4,999",
    annualPerMonth: "PKR 416/mo",
    trialCalloutText: "Free for 3 days, then PKR 4,999/year.",
    savingsPercentage: 17,
  },
  saudi: {
    regionId: "saudi",
    regionName: "Saudi Arabia",
    currencyCode: "SAR",
    monthlyPrice: "SAR 19.99",
    annualPrice: "SAR 199",
    annualPerMonth: "SAR 16.58/mo",
    trialCalloutText: "Free for 3 days, then SAR 199/year.",
    savingsPercentage: 17,
  },
  uae: {
    regionId: "uae",
    regionName: "United Arab Emirates",
    currencyCode: "AED",
    monthlyPrice: "AED 19.99",
    annualPrice: "AED 199",
    annualPerMonth: "AED 16.58/mo",
    trialCalloutText: "Free for 3 days, then AED 199/year.",
    savingsPercentage: 17,
  },
  default: {
    regionId: "pakistan",
    regionName: "Pakistan",
    currencyCode: "PKR",
    monthlyPrice: "PKR 499",
    annualPrice: "PKR 4,999",
    annualPerMonth: "PKR 416/mo",
    trialCalloutText: "Free for 3 days, then PKR 4,999/year.",
    savingsPercentage: 17,
  },
};

export function getPricingForCuisines(cuisines?: string[] | null): RegionPricing {
  if (!cuisines || cuisines.length === 0) {
    return REGIONAL_PRICING.pakistan;
  }

  const cuisinesLower = cuisines.map((c) => c.toLowerCase());

  // Check UAE
  const uaeCountry = REGIONS_AND_COUNTRIES.find((r) => r.id === "uae");
  if (
    uaeCountry?.cuisines.some((c) =>
      cuisinesLower.some((userC) => userC.includes(c.name.toLowerCase()))
    )
  ) {
    return REGIONAL_PRICING.uae;
  }

  // Check Saudi
  const saudiCountry = REGIONS_AND_COUNTRIES.find((r) => r.id === "saudi");
  if (
    saudiCountry?.cuisines.some((c) =>
      cuisinesLower.some((userC) => userC.includes(c.name.toLowerCase()))
    )
  ) {
    return REGIONAL_PRICING.saudi;
  }

  // Default to Pakistan
  return REGIONAL_PRICING.pakistan;
}
