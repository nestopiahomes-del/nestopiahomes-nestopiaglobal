import { CountryCode, CurrencyCode, FinancingModel, PropertyType } from "../lib/marketConfig";

export interface FinancingInputs {
  country: CountryCode;
  currency: CurrencyCode;

  propertyValue: number;

  customerContribution: number;
  customerContributionPct: number;

  financingRequired: number;
  financingRequiredPct: number;

  tenureYears: number;
  tenureMonths: number;

  annualProfitRate?: number;
  annualRentalRate?: number;

  propertyAppreciationRate?: number;

  propertyType: PropertyType;

  // Commercial / Partnership specific inputs
  commercialUnitCount?: number;
  rentalIncome?: number;
  operatingExpenses?: number;
  managementFees?: number;
  maintenanceCosts?: number;
  takafulInsurance?: number;
  propertyTaxes?: number;
  customerProfitSharePct?: number; // agreed profit sharing ratio
  investorProfitSharePct?: number;
  vacancyRatePct?: number;
  annualRentGrowthPct?: number;
  annualExpenseGrowthPct?: number;
  commercialUnits?: CommercialUnit[];

  // Optional transaction / fees
  transactionFees?: number;
}

export interface CommercialUnit {
  id: string;
  name: string;
  unitValue: number;
  monthlyRent: number;
  monthlyExpenses: number;
  isOccupied: boolean;
  tenantType: string;
}

export interface MonthlyScheduleRow {
  month: number;
  year: number;

  // Opening & Closing
  openingBalance: number;
  closingBalance: number;

  // Payments
  totalPayment: number;
  capitalComponent: number; // Unit buyout or principal amortization
  profitOrRentComponent: number; // Disclosed profit or rent for usufruct

  // Cumulative
  cumulativeCapitalPaid: number;
  cumulativeProfitOrRentPaid: number;
  cumulativeTotalPaid: number;

  // Ownership shares
  customerOwnershipPct: number;
  investorOwnershipPct: number;
  customerEquityValue: number;
  investorEquityValue: number;

  // Property value progression if appreciation enabled
  estimatedPropertyValue: number;

  // Commercial specific
  grossIncome?: number;
  expenses?: number;
  netDistributableProfit?: number;
  customerProfitShare?: number;
  investorProfitShare?: number;
}

export interface YearlySummaryRow {
  year: number;
  totalPaid: number;
  capitalAcquired: number;
  profitOrRentPaid: number;
  remainingFinancing: number;
  customerOwnershipPct: number;
  investorOwnershipPct: number;
  estimatedPropertyValue: number;

  // Commercial
  annualGrossIncome?: number;
  annualExpenses?: number;
  annualNetProfit?: number;
  customerAnnualProfit?: number;
  investorAnnualProfit?: number;
}

export interface OwnershipPosition {
  customerPct: number;
  customerValue: number;
  investorPct: number;
  investorValue: number;
}

export interface BaseFinancingResult {
  model: FinancingModel;
  modelName: string;
  modelArabicName: string;
  tagline: string;

  country: CountryCode;
  currency: CurrencyCode;

  propertyValue: number;
  customerContribution: number;
  customerContributionPct: number;
  financierContribution: number;
  financierContributionPct: number;

  tenureYears: number;
  tenureMonths: number;

  // Payments & Costs
  monthlyPayment: number; // Representative or first month payment
  monthlyPaymentNote?: string;
  finalMonthlyPayment?: number;
  totalFinancingPayments: number;
  totalCustomerCashOutflow: number; // Initial contribution + total financing payments
  totalCapitalPaid: number;
  totalProfitPaid: number;
  totalRentPaid: number;

  // Appreciation
  appreciationRate: number;
  estimatedFuturePropertyValue: number;
  estimatedPropertyAppreciationGain: number;
  estimatedPropertyAppreciationGainPct: number;

  // Ownership
  ownershipAtStart: OwnershipPosition;
  ownershipAtEnd: OwnershipPosition;

  // Schedules
  monthlySchedule: MonthlyScheduleRow[];
  yearlySummary: YearlySummaryRow[];

  // Educational
  educationalSummary: string;
  whatHappened: string;
  whyDifferent: {
    conventional: string;
    islamic: string;
    keyDifferences: string[];
  };
  shariahPrinciples: {
    title: string;
    explanation: string;
  }[];
}

export interface MurabahaResult extends BaseFinancingResult {
  model: "MURABAHAH";
  profitMarginPct: number;
  totalMurabahaSalePrice: number;
  monthlyInstallment: number;
}

export interface DiminishingMusharakahResult extends BaseFinancingResult {
  model: "DIMINISHING_MUSHARAKAH";
  annualRentalRate: number;
  numberOfEquityUnits: number;
  initialUnitValue: number;
  monthlyUnitBuyout: number;
  initialMonthlyRent: number;
  finalMonthlyRent: number;
  totalRentPaid: number;
  totalEquityPurchased: number;
}

export interface IjaraResult extends BaseFinancingResult {
  model: "IJARAH";
  annualRentalRate: number;
  securityDeposit: number;
  netFinancedLeaseCapital: number;
  monthlyPrincipalAmortization: number;
  initialMonthlyRent: number;
  finalMonthlyRent: number;
  finalTransferMechanism: string;
}

export interface CommercialMusharakahResult extends BaseFinancingResult {
  model: "MUSHARAKAH";
  monthlyGrossIncome: number;
  annualGrossIncome: number;
  monthlyExpenses: number;
  annualExpenses: number;
  monthlyNetProfit: number;
  annualNetProfit: number;
  customerProfitSharePct: number;
  investorProfitSharePct: number;
  customerLossSharePct: number;
  investorLossSharePct: number;
  customerMonthlyProfit: number;
  investorMonthlyProfit: number;
  totalDistributableProfit: number;
  totalCustomerCumulativeProfit: number;
  totalInvestorCumulativeProfit: number;
  customerTotalEconomicReturn: number;
  investorTotalEconomicReturn: number;
  unitsBreakdown?: CommercialUnit[];
  warningNotice?: string;
}

export type AnyFinancingResult =
  | MurabahaResult
  | DiminishingMusharakahResult
  | IjaraResult
  | CommercialMusharakahResult;

export interface SavedScenario {
  id: string;
  name: string;
  savedAt: string;
  country: CountryCode;
  model: FinancingModel;
  inputs: FinancingInputs;
  notes?: string;
}
