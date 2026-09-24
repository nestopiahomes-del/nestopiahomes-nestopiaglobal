export type CountryCode = "UK" | "INDIA";
export type CurrencyCode = "GBP" | "INR";
export type PropertyType = "RESIDENTIAL" | "COMMERCIAL" | "COMMERCIAL_UNITS" | "INVESTMENT";
export type FinancingModel = "MURABAHAH" | "MUSHARAKAH" | "DIMINISHING_MUSHARAKAH" | "IJARAH";

export interface MarketInfo {
  code: CountryCode;
  name: string;
  flag: string;
  company: string;
  tagline: string;
  registeredOffice: string;
  jurisdiction: string;
  currency: CurrencyCode;
  symbol: string;
  defaultPropertyValue: number;
  defaultCustomerContributionPct: number;
  defaultTenureYears: number;
  defaultAppreciationRate: number;
  defaultProfitRate: number;
  defaultRentalRate: number;
  regulatoryNotice: string;
  shariahAdvisoryNotice: string;
  taxContextNotice: string;
}

export const MARKETS: Record<CountryCode, MarketInfo> = {
  UK: {
    code: "UK",
    name: "United Kingdom",
    flag: "🇬🇧",
    company: "Nestopia Homes Limited",
    tagline: "Ethical & Shariah-Compliant Property Financing",
    registeredOffice: "London, United Kingdom",
    jurisdiction: "Governed under English Law & UK Alternative Finance Tax Rules",
    currency: "GBP",
    symbol: "£",
    defaultPropertyValue: 350000,
    defaultCustomerContributionPct: 20,
    defaultTenureYears: 15,
    defaultAppreciationRate: 3.5,
    defaultProfitRate: 5.8,
    defaultRentalRate: 5.5,
    regulatoryNotice: "Nestopia Homes Limited is an educational and structuring platform. Financing models are presented for simulation and educational purposes under UK alternative property finance concepts (including SDLT alternative finance relief rules).",
    shariahAdvisoryNotice: "Calculations reflect established Shariah governance principles including AAOIFI standards. Transactions require formal contractual documentation, genuine asset acquisition, and approval by independent Shariah supervisory boards.",
    taxContextNotice: "UK tax law recognizes Alternative Finance Arrangements to ensure equitable Stamp Duty Land Tax (SDLT) and capital gains treatment without punitive double-taxation."
  },
  INDIA: {
    code: "INDIA",
    name: "India",
    flag: "🇮🇳",
    company: "Nestopia Global Private Limited",
    tagline: "Asset-Backed Ethical Property Solutions",
    registeredOffice: "Mumbai, Maharashtra, India",
    jurisdiction: "Governed under Indian Contract Act, 1872 & Property Co-Ownership Framework",
    currency: "INR",
    symbol: "₹",
    defaultPropertyValue: 10000000, // 1 Crore
    defaultCustomerContributionPct: 20, // 20 Lakhs
    defaultTenureYears: 15,
    defaultAppreciationRate: 5.0,
    defaultProfitRate: 7.5,
    defaultRentalRate: 7.5,
    regulatoryNotice: "Nestopia Global Private Limited operates within the Indian legal and regulatory framework for co-ownership, joint venture partnerships, and asset-leasing arrangements.",
    shariahAdvisoryNotice: "Calculations demonstrate Shariah-compliant co-ownership (Shirkat-ul-Milk), sale-on-deferred-payment (Murabahah), and leasing (Ijarah). Consult qualified Shariah advisors for local execution.",
    taxContextNotice: "Co-ownership and partnership distributions are structured according to Indian property registration, Stamp Duty, and income distribution norms."
  }
};

/**
 * Format currency according to the market's standard notation.
 * India: ₹1,00,00,000 (Crores & Lakhs)
 * UK: £350,000 (Thousands & Millions)
 */
export function formatCurrency(amount: number, country: CountryCode = "INDIA", showDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "—";
  const market = MARKETS[country];
  const rounded = showDecimals ? Math.round(amount * 100) / 100 : Math.round(amount);

  if (country === "INDIA") {
    // Format with Indian number system (Lakhs, Crores)
    const isNegative = rounded < 0;
    const absVal = Math.abs(rounded);
    const parts = absVal.toFixed(showDecimals ? 2 : 0).split(".");
    let intPart = parts[0];
    const decPart = parts[1] ? `.${parts[1]}` : "";

    let formattedInt = "";
    if (intPart.length > 3) {
      const lastThree = intPart.substring(intPart.length - 3);
      const remaining = intPart.substring(0, intPart.length - 3);
      formattedInt = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
    } else {
      formattedInt = intPart;
    }

    return `${isNegative ? "-" : ""}${market.symbol}${formattedInt}${decPart}`;
  } else {
    // UK format: standard commas every 3 digits
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: showDecimals ? 2 : 0,
      minimumFractionDigits: showDecimals ? 2 : 0
    }).format(rounded);
  }
}

/**
 * Format a readable Indian verbal denomination if helpful (e.g. ₹1 Crore, ₹25 Lakhs)
 */
export function formatVerbalAmount(amount: number, country: CountryCode): string {
  if (country === "UK") {
    if (amount >= 1000000) {
      return `£${(amount / 1000000).toFixed(2).replace(/\.00$/, "")}M`;
    } else if (amount >= 1000) {
      return `£${(amount / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    }
    return formatCurrency(amount, "UK");
  }

  // India
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr.toFixed(2).replace(/\.00$/, "")} Crore`;
  } else if (amount >= 100000) {
    const lakh = amount / 100000;
    return `₹${lakh.toFixed(2).replace(/\.00$/, "")} Lakh`;
  } else if (amount >= 1000) {
    const k = amount / 1000;
    return `₹${k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return formatCurrency(amount, "INDIA");
}

export function formatPercentage(pct: number, decimals: number = 1): string {
  if (isNaN(pct) || pct === null || pct === undefined) return "0%";
  return `${pct.toFixed(decimals).replace(/\.0$/, "")}%`;
}
