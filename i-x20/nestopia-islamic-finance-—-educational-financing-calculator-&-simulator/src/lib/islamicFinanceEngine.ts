import {
  CountryCode,
  CurrencyCode,
  MARKETS
} from "./marketConfig";
import {
  FinancingInputs,
  MonthlyScheduleRow,
  YearlySummaryRow,
  MurabahaResult,
  DiminishingMusharakahResult,
  IjaraResult,
  CommercialMusharakahResult,
  AnyFinancingResult,
  OwnershipPosition,
  CommercialUnit
} from "../types";

/**
 * Validates financing inputs and returns actionable error messages if any constraint is violated.
 */
export function validateFinancingInputs(inputs: FinancingInputs): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!inputs.propertyValue || inputs.propertyValue <= 0) {
    errors.push("Property value must be greater than zero.");
  }

  if (inputs.customerContribution < 0) {
    errors.push("Your initial contribution cannot be negative.");
  }

  if (inputs.customerContribution > inputs.propertyValue) {
    errors.push("Your initial contribution cannot be greater than the total property value.");
  }

  if (inputs.financingRequired <= 0) {
    errors.push("Financing required must be greater than zero.");
  }

  const sumCapital = inputs.customerContribution + inputs.financingRequired;
  const tolerance = 1; // Allow small rounding differences
  if (Math.abs(sumCapital - inputs.propertyValue) > tolerance) {
    warnings.push(
      `Your initial contribution (${inputs.customerContribution}) plus financing required (${inputs.financingRequired}) does not equal the property value (${inputs.propertyValue}). The difference (${Math.abs(sumCapital - inputs.propertyValue)}) may represent fees, additional acquisition costs, or surplus equity.`
    );
  }

  if (!inputs.tenureYears || inputs.tenureYears < 1 || inputs.tenureYears > 40) {
    errors.push("Tenure must be between 1 and 40 years.");
  }

  if (inputs.propertyType === "COMMERCIAL" || inputs.propertyType === "COMMERCIAL_UNITS" || inputs.propertyType === "INVESTMENT") {
    if (inputs.customerProfitSharePct !== undefined && inputs.investorProfitSharePct !== undefined) {
      const totalProfitRatio = inputs.customerProfitSharePct + inputs.investorProfitSharePct;
      if (Math.abs(totalProfitRatio - 100) > 0.1) {
        errors.push("Agreed profit-sharing ratios must add up to exactly 100%.");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculates compound future property value based on annual appreciation rate.
 */
export function calculateFuturePropertyValue(
  initialValue: number,
  annualRatePct: number,
  years: number
): {
  futureValue: number;
  gain: number;
  gainPct: number;
} {
  if (annualRatePct <= 0 || years <= 0) {
    return {
      futureValue: initialValue,
      gain: 0,
      gainPct: 0
    };
  }

  const futureValue = initialValue * Math.pow(1 + annualRatePct / 100, years);
  const gain = futureValue - initialValue;
  const gainPct = (gain / initialValue) * 100;

  return {
    futureValue: Math.round(futureValue),
    gain: Math.round(gain),
    gainPct: Math.round(gainPct * 100) / 100
  };
}

/**
 * Generates yearly aggregation from monthly schedule
 */
export function generateYearlySummary(monthlySchedule: MonthlyScheduleRow[]): YearlySummaryRow[] {
  const yearlyMap = new Map<number, YearlySummaryRow>();

  for (const row of monthlySchedule) {
    const yr = row.year;
    let entry = yearlyMap.get(yr);

    if (!entry) {
      entry = {
        year: yr,
        totalPaid: 0,
        capitalAcquired: 0,
        profitOrRentPaid: 0,
        remainingFinancing: row.closingBalance,
        customerOwnershipPct: row.customerOwnershipPct,
        investorOwnershipPct: row.investorOwnershipPct,
        estimatedPropertyValue: row.estimatedPropertyValue,
        annualGrossIncome: 0,
        annualExpenses: 0,
        annualNetProfit: 0,
        customerAnnualProfit: 0,
        investorAnnualProfit: 0
      };
      yearlyMap.set(yr, entry);
    }

    entry.totalPaid += row.totalPayment;
    entry.capitalAcquired += row.capitalComponent;
    entry.profitOrRentPaid += row.profitOrRentComponent;
    // Closing values update to the end of the year
    entry.remainingFinancing = row.closingBalance;
    entry.customerOwnershipPct = row.customerOwnershipPct;
    entry.investorOwnershipPct = row.investorOwnershipPct;
    entry.estimatedPropertyValue = row.estimatedPropertyValue;

    if (row.grossIncome !== undefined) entry.annualGrossIncome = (entry.annualGrossIncome || 0) + row.grossIncome;
    if (row.expenses !== undefined) entry.annualExpenses = (entry.annualExpenses || 0) + row.expenses;
    if (row.netDistributableProfit !== undefined) entry.annualNetProfit = (entry.annualNetProfit || 0) + row.netDistributableProfit;
    if (row.customerProfitShare !== undefined) entry.customerAnnualProfit = (entry.customerAnnualProfit || 0) + row.customerProfitShare;
    if (row.investorProfitShare !== undefined) entry.investorAnnualProfit = (entry.investorAnnualProfit || 0) + row.investorProfitShare;
  }

  return Array.from(yearlyMap.values());
}

/**
 * 1. MURABAHAH (Cost-Plus Sale on Deferred Payment)
 * - Financier purchases the asset for acquisition cost (Financier Capital).
 * - Disclosed agreed profit = Financier Capital * (annualProfitRate / 100) * tenureYears.
 * - Total Murabahah Sale Price = Financier Capital + Agreed Profit (Fixed).
 * - Monthly Installment = Total Sale Price / Total Months (Fixed).
 */
export function calculateMurabaha(inputs: FinancingInputs): MurabahaResult {
  const propertyValue = inputs.propertyValue;
  const customerContrib = inputs.customerContribution;
  const financierContrib = inputs.financingRequired;
  const tenureYears = inputs.tenureYears;
  const totalMonths = tenureYears * 12;

  const profitRate = inputs.annualProfitRate ?? MARKETS[inputs.country].defaultProfitRate;
  const appreciationRate = inputs.propertyAppreciationRate ?? 0;

  // Murabahah disclosed profit calculation
  const totalAgreedProfit = financierContrib * (profitRate / 100) * tenureYears;
  const totalMurabahaSalePrice = financierContrib + totalAgreedProfit;
  const monthlyInstallment = totalMurabahaSalePrice / totalMonths;
  const monthlyCapitalComponent = financierContrib / totalMonths;
  const monthlyProfitComponent = totalAgreedProfit / totalMonths;

  const monthlySchedule: MonthlyScheduleRow[] = [];
  let remainingSalePrice = totalMurabahaSalePrice;
  let cumulativeCapital = 0;
  let cumulativeProfit = 0;
  let cumulativeTotal = 0;

  const appreciation = calculateFuturePropertyValue(propertyValue, appreciationRate, tenureYears);

  for (let m = 1; m <= totalMonths; m++) {
    const year = Math.ceil(m / 12);
    const opening = remainingSalePrice;

    // Last month precision reconciliation
    const isLastMonth = m === totalMonths;
    const currentInstallment = isLastMonth ? opening : monthlyInstallment;
    const currentCapital = isLastMonth ? (financierContrib - cumulativeCapital) : monthlyCapitalComponent;
    const currentProfit = currentInstallment - currentCapital;

    remainingSalePrice = Math.max(0, opening - currentInstallment);
    cumulativeCapital += currentCapital;
    cumulativeProfit += currentProfit;
    cumulativeTotal += currentInstallment;

    // In Murabahah, legal/beneficial title is transferred at contract conclusion with mortgage charge
    // The customer's unencumbered equity rises as the deferred debt is paid down
    const customerEquityPct = ((customerContrib + cumulativeCapital) / (customerContrib + financierContrib)) * 100;
    const investorEquityPct = 100 - customerEquityPct;

    // Monthly property appreciation progression
    const currentApprecValue = propertyValue * Math.pow(1 + appreciationRate / 100, m / 12);

    monthlySchedule.push({
      month: m,
      year,
      openingBalance: Math.round(opening),
      closingBalance: Math.round(remainingSalePrice),
      totalPayment: Math.round(currentInstallment),
      capitalComponent: Math.round(currentCapital),
      profitOrRentComponent: Math.round(currentProfit),
      cumulativeCapitalPaid: Math.round(cumulativeCapital),
      cumulativeProfitOrRentPaid: Math.round(cumulativeProfit),
      cumulativeTotalPaid: Math.round(cumulativeTotal),
      customerOwnershipPct: Math.round(customerEquityPct * 100) / 100,
      investorOwnershipPct: Math.round(investorEquityPct * 100) / 100,
      customerEquityValue: Math.round(currentApprecValue * (customerEquityPct / 100)),
      investorEquityValue: Math.round(currentApprecValue * (investorEquityPct / 100)),
      estimatedPropertyValue: Math.round(currentApprecValue)
    });
  }

  const yearlySummary = generateYearlySummary(monthlySchedule);

  const startOwnership: OwnershipPosition = {
    customerPct: Math.round((customerContrib / propertyValue) * 1000) / 10,
    customerValue: customerContrib,
    investorPct: Math.round((financierContrib / propertyValue) * 1000) / 10,
    investorValue: financierContrib
  };

  const endOwnership: OwnershipPosition = {
    customerPct: 100,
    customerValue: appreciation.futureValue,
    investorPct: 0,
    investorValue: 0
  };

  return {
    model: "MURABAHAH",
    modelName: "Murabahah",
    modelArabicName: "المرابحة للآمر بالشراء",
    tagline: "Cost-Plus Sale on Deferred Installments",
    country: inputs.country,
    currency: inputs.currency,
    propertyValue,
    customerContribution: customerContrib,
    customerContributionPct: Math.round((customerContrib / propertyValue) * 1000) / 10,
    financierContribution: financierContrib,
    financierContributionPct: Math.round((financierContrib / propertyValue) * 1000) / 10,
    tenureYears,
    tenureMonths: totalMonths,
    profitMarginPct: profitRate,
    totalMurabahaSalePrice: Math.round(totalMurabahaSalePrice),
    monthlyInstallment: Math.round(monthlyInstallment),
    monthlyPayment: Math.round(monthlyInstallment),
    monthlyPaymentNote: "Fixed monthly installment throughout the entire financing period",
    totalFinancingPayments: Math.round(totalMurabahaSalePrice),
    totalCustomerCashOutflow: Math.round(customerContrib + totalMurabahaSalePrice),
    totalCapitalPaid: Math.round(financierContrib),
    totalProfitPaid: Math.round(totalAgreedProfit),
    totalRentPaid: 0,
    appreciationRate,
    estimatedFuturePropertyValue: appreciation.futureValue,
    estimatedPropertyAppreciationGain: appreciation.gain,
    estimatedPropertyAppreciationGainPct: appreciation.gainPct,
    ownershipAtStart: startOwnership,
    ownershipAtEnd: endOwnership,
    monthlySchedule,
    yearlySummary,
    educationalSummary:
      "Instead of lending money at interest, the financier acquires the property and sells it to you at an agreed purchase price plus a clearly disclosed profit margin. Once signed, the sale price is strictly fixed and cannot increase.",
    whatHappened:
      "The financier does not lend cash. In Murabahah, the financier purchases the property from the vendor, assumes ownership risk, and subsequently sells it to you for a fixed agreed price payable over your chosen tenure. The total price and monthly installments are fixed from day one.",
    whyDifferent: {
      conventional: "Conventional Bank: Money → Loan → Compounding Interest → Repayment. Interest compounds over time and late fees become additional interest.",
      islamic: "Murabahah: Asset Identified → Financier Purchases & Takes Risk → Sells to You at Disclosed Cost + Profit → Fixed Deferred Installments. No compounding.",
      keyDifferences: [
        "Asset-backed sale contract, not a monetary loan.",
        "Profit is disclosed upfront and fixed for the entire duration.",
        "No compounding interest or price escalation upon delay.",
        "Financier bears constructive ownership risk prior to resale."
      ]
    },
    shariahPrinciples: [
      {
        title: "Genuine Ownership & Possession (Qabd)",
        explanation: "The financier must acquire legitimate ownership and constructive possession of the property before selling it to the customer. Selling what one does not own (Bay' ma la yamlik) is strictly prohibited."
      },
      {
        title: "Disclosed Profit (Bay' al-Amanah)",
        explanation: "Murabahah is a trust sale. The financier must truthfully disclose the exact acquisition cost and the agreed profit markup to the buyer."
      },
      {
        title: "Fixed Debt Principle",
        explanation: "Once the sale is executed, the deferred price becomes an absolute debt (Dayn). In Shariah, debt cannot be increased in exchange for time or delay, eliminating compounding interest."
      },
      {
        title: "Late Payment Treatment",
        explanation: "Late payment charges cannot be retained as financier income. Any Shariah-approved penalty must be donated entirely to a registered charity to prevent usurious gain."
      }
    ]
  };
}

/**
 * 2. DIMINISHING MUSHARAKAH (Shirkat-ul-Milk + Ijarah + Gradual Equity Buyout)
 * - Customer & Financier jointly purchase the property as co-owners (Shirkat-ul-Milk).
 * - Financier leases its undivided share to customer under Ijarah.
 * - Customer pays rent on remaining financier share + buys equity units each month.
 * - Unit Buyout = Financier Initial Capital / Total Months.
 * - Monthly Rent = Financier Remaining Capital * (Annual Rental Rate / 12).
 * - Total Monthly Payment = Unit Buyout + Rent.
 * - Rent declines each month as customer acquires greater equity.
 */
export function calculateDiminishingMusharakah(inputs: FinancingInputs): DiminishingMusharakahResult {
  const propertyValue = inputs.propertyValue;
  const customerContrib = inputs.customerContribution;
  const financierContrib = inputs.financingRequired;
  const tenureYears = inputs.tenureYears;
  const totalMonths = tenureYears * 12;

  const rentalRate = inputs.annualRentalRate ?? MARKETS[inputs.country].defaultRentalRate;
  const appreciationRate = inputs.propertyAppreciationRate ?? 0;

  const initialCustomerPct = (customerContrib / propertyValue) * 100;
  const initialInvestorPct = (financierContrib / propertyValue) * 100;

  // Monthly equity unit purchase
  const numberOfUnits = totalMonths;
  const unitBuyoutMonthly = financierContrib / totalMonths;
  const initialUnitValue = unitBuyoutMonthly;

  const monthlySchedule: MonthlyScheduleRow[] = [];
  let remainingInvestorCapital = financierContrib;
  let cumulativeEquityPurchased = 0;
  let cumulativeRent = 0;
  let cumulativeTotal = 0;

  let initialMonthlyRent = 0;
  let finalMonthlyRent = 0;

  const appreciation = calculateFuturePropertyValue(propertyValue, appreciationRate, tenureYears);

  for (let m = 1; m <= totalMonths; m++) {
    const year = Math.ceil(m / 12);
    const openingInvestorBalance = remainingInvestorCapital;

    // Monthly rent based on investor's remaining capital
    const monthlyRent = openingInvestorBalance * (rentalRate / 100) / 12;
    if (m === 1) initialMonthlyRent = monthlyRent;

    const isLastMonth = m === totalMonths;
    const currentEquityBuyout = isLastMonth ? openingInvestorBalance : unitBuyoutMonthly;
    const currentTotalPayment = monthlyRent + currentEquityBuyout;

    remainingInvestorCapital = Math.max(0, openingInvestorBalance - currentEquityBuyout);
    cumulativeEquityPurchased += currentEquityBuyout;
    cumulativeRent += monthlyRent;
    cumulativeTotal += currentTotalPayment;

    if (isLastMonth) finalMonthlyRent = monthlyRent;

    // Customer ownership increases as units are bought
    const currentCustomerEquity = customerContrib + cumulativeEquityPurchased;
    const currentCustomerOwnershipPct = (currentCustomerEquity / propertyValue) * 100;
    const currentInvestorOwnershipPct = Math.max(0, 100 - currentCustomerOwnershipPct);

    // Appreciation progression
    const currentApprecValue = propertyValue * Math.pow(1 + appreciationRate / 100, m / 12);

    monthlySchedule.push({
      month: m,
      year,
      openingBalance: Math.round(openingInvestorBalance),
      closingBalance: Math.round(remainingInvestorCapital),
      totalPayment: Math.round(currentTotalPayment),
      capitalComponent: Math.round(currentEquityBuyout), // Equity unit purchase
      profitOrRentComponent: Math.round(monthlyRent), // Rent on investor's share
      cumulativeCapitalPaid: Math.round(cumulativeEquityPurchased),
      cumulativeProfitOrRentPaid: Math.round(cumulativeRent),
      cumulativeTotalPaid: Math.round(cumulativeTotal),
      customerOwnershipPct: Math.round(currentCustomerOwnershipPct * 100) / 100,
      investorOwnershipPct: Math.round(currentInvestorOwnershipPct * 100) / 100,
      customerEquityValue: Math.round(currentApprecValue * (currentCustomerOwnershipPct / 100)),
      investorEquityValue: Math.round(currentApprecValue * (currentInvestorOwnershipPct / 100)),
      estimatedPropertyValue: Math.round(currentApprecValue)
    });
  }

  const yearlySummary = generateYearlySummary(monthlySchedule);

  const startOwnership: OwnershipPosition = {
    customerPct: Math.round(initialCustomerPct * 10) / 10,
    customerValue: customerContrib,
    investorPct: Math.round(initialInvestorPct * 10) / 10,
    investorValue: financierContrib
  };

  const endOwnership: OwnershipPosition = {
    customerPct: 100,
    customerValue: appreciation.futureValue,
    investorPct: 0,
    investorValue: 0
  };

  const initialTotalPayment = unitBuyoutMonthly + initialMonthlyRent;

  return {
    model: "DIMINISHING_MUSHARAKAH",
    modelName: "Diminishing Musharakah",
    modelArabicName: "المشاركة المتناقصة",
    tagline: "Co-Ownership with Gradual Equity Buyout & Diminishing Rent",
    country: inputs.country,
    currency: inputs.currency,
    propertyValue,
    customerContribution: customerContrib,
    customerContributionPct: Math.round(initialCustomerPct * 10) / 10,
    financierContribution: financierContrib,
    financierContributionPct: Math.round(initialInvestorPct * 10) / 10,
    tenureYears,
    tenureMonths: totalMonths,
    annualRentalRate: rentalRate,
    numberOfEquityUnits: numberOfUnits,
    initialUnitValue: Math.round(initialUnitValue),
    monthlyUnitBuyout: Math.round(unitBuyoutMonthly),
    initialMonthlyRent: Math.round(initialMonthlyRent),
    finalMonthlyRent: Math.round(finalMonthlyRent),
    monthlyPayment: Math.round(initialTotalPayment),
    finalMonthlyPayment: Math.round(unitBuyoutMonthly + finalMonthlyRent),
    monthlyPaymentNote: `Starts at ${formatMonthlyDisplay(initialTotalPayment, inputs.country)} and decreases over time to ${formatMonthlyDisplay(unitBuyoutMonthly + finalMonthlyRent, inputs.country)} as you buy out the investor's share.`,
    totalFinancingPayments: Math.round(cumulativeTotal),
    totalCustomerCashOutflow: Math.round(customerContrib + cumulativeTotal),
    totalCapitalPaid: Math.round(financierContrib),
    totalProfitPaid: 0,
    totalRentPaid: Math.round(cumulativeRent),
    totalEquityPurchased: Math.round(financierContrib),
    appreciationRate,
    estimatedFuturePropertyValue: appreciation.futureValue,
    estimatedPropertyAppreciationGain: appreciation.gain,
    estimatedPropertyAppreciationGainPct: appreciation.gainPct,
    ownershipAtStart: startOwnership,
    ownershipAtEnd: endOwnership,
    monthlySchedule,
    yearlySummary,
    educationalSummary:
      "You and the investor jointly own the property. Each month, you purchase a portion of the investor's equity while paying rent on the portion you don't yet own. As your ownership increases, your monthly rent decreases until you own 100% of the property.",
    whatHappened:
      "You entered into a joint ownership partnership (Shirkat-ul-Milk). Because you reside in or utilize the whole property, you pay fair rent only on the financier's remaining share. Simultaneously, you buy out their equity units each month. With every buyout payment, the financier's stake shrinks and your rent drops.",
    whyDifferent: {
      conventional: "Conventional Mortgage: Lender gives a loan secured by a charge. You owe debt from day one, and early payments are predominantly interest charges.",
      islamic: "Diminishing Musharakah: True Co-ownership → Tenant of Partner's Share → Gradual Purchase of Units → 100% Sole Ownership. Rent drops as partner's equity diminishes.",
      keyDifferences: [
        "Real co-ownership from inception (Shirkat-ul-Milk).",
        "Rent is paid strictly for the use of the financier's undivided share.",
        "As you acquire more equity, the rent payment steadily reduces.",
        "Partners share structural ownership liabilities (e.g. major property loss)."
      ]
    },
    shariahPrinciples: [
      {
        title: "Shirkat-ul-Milk (Joint Property Partnership)",
        explanation: "Both parties co-own the physical asset proportionally to their financial contributions, creating authentic joint equity rather than a debtor-creditor relationship."
      },
      {
        title: "Separation of Three Legal Contracts",
        explanation: "AAOIFI Shariah standards mandate three strictly independent contracts: (1) Partnership agreement, (2) Lease contract for usufruct, and (3) Unilateral promise (Wa'ad) by the customer to buy equity units."
      },
      {
        title: "Rent Proportional to Unowned Share",
        explanation: "Rent cannot be charged on the portion already owned by the customer. As your ownership stake rises, your rental liability mathematically declines."
      },
      {
        title: "Structural Risk Sharing",
        explanation: "In the event of total destruction or catastrophic loss not caused by customer negligence, the loss is borne strictly in proportion to capital ownership at that moment."
      }
    ]
  };
}

/**
 * 3. IJARAH / IJARAH MUNTAHIA BITTAMLEEK (Lease Ending with Ownership Transfer)
 * - Financier owns the asset and leases its usufruct (use) to customer.
 * - Customer provides security deposit / advance contribution.
 * - Net Financed Lease Capital = Property Value - Security Deposit.
 * - Monthly Principal Amortization = Net Financed Capital / Total Months.
 * - Monthly Rent Component = Remaining Asset Balance * (Annual Rental Rate / 12).
 * - Total Monthly Payment = Principal Amortization + Rent Component.
 * - Transfer of ownership is conducted via separate unilateral promise / deed of gift at maturity.
 */
export function calculateIjara(inputs: FinancingInputs): IjaraResult {
  const propertyValue = inputs.propertyValue;
  const securityDeposit = inputs.customerContribution;
  const financierCapital = inputs.financingRequired;
  const tenureYears = inputs.tenureYears;
  const totalMonths = tenureYears * 12;

  const rentalRate = inputs.annualRentalRate ?? MARKETS[inputs.country].defaultRentalRate;
  const appreciationRate = inputs.propertyAppreciationRate ?? 0;

  const netFinancedLeaseCapital = financierCapital;
  const monthlyPrincipalAmortization = netFinancedLeaseCapital / totalMonths;

  const monthlySchedule: MonthlyScheduleRow[] = [];
  let remainingAssetBalance = netFinancedLeaseCapital;
  let cumulativePrincipalPaid = 0;
  let cumulativeRent = 0;
  let cumulativeTotal = 0;

  let initialMonthlyRent = 0;
  let finalMonthlyRent = 0;

  const appreciation = calculateFuturePropertyValue(propertyValue, appreciationRate, tenureYears);

  for (let m = 1; m <= totalMonths; m++) {
    const year = Math.ceil(m / 12);
    const openingBalance = remainingAssetBalance;

    const currentRentComponent = openingBalance * (rentalRate / 100) / 12;
    if (m === 1) initialMonthlyRent = currentRentComponent;

    const isLastMonth = m === totalMonths;
    const currentPrincipal = isLastMonth ? openingBalance : monthlyPrincipalAmortization;
    const currentTotalPayment = currentPrincipal + currentRentComponent;

    remainingAssetBalance = Math.max(0, openingBalance - currentPrincipal);
    cumulativePrincipalPaid += currentPrincipal;
    cumulativeRent += currentRentComponent;
    cumulativeTotal += currentTotalPayment;

    if (isLastMonth) finalMonthlyRent = currentRentComponent;

    // In Ijarah Muntahia Bittamleek, customer builds beneficial entitlement
    const customerEconomicStakePct = ((securityDeposit + cumulativePrincipalPaid) / propertyValue) * 100;
    const investorEconomicStakePct = Math.max(0, 100 - customerEconomicStakePct);

    const currentApprecValue = propertyValue * Math.pow(1 + appreciationRate / 100, m / 12);

    monthlySchedule.push({
      month: m,
      year,
      openingBalance: Math.round(openingBalance),
      closingBalance: Math.round(remainingAssetBalance),
      totalPayment: Math.round(currentTotalPayment),
      capitalComponent: Math.round(currentPrincipal), // Capital amortization
      profitOrRentComponent: Math.round(currentRentComponent), // Rental component
      cumulativeCapitalPaid: Math.round(cumulativePrincipalPaid),
      cumulativeProfitOrRentPaid: Math.round(cumulativeRent),
      cumulativeTotalPaid: Math.round(cumulativeTotal),
      customerOwnershipPct: Math.round(customerEconomicStakePct * 100) / 100,
      investorOwnershipPct: Math.round(investorEconomicStakePct * 100) / 100,
      customerEquityValue: Math.round(currentApprecValue * (customerEconomicStakePct / 100)),
      investorEquityValue: Math.round(currentApprecValue * (investorEconomicStakePct / 100)),
      estimatedPropertyValue: Math.round(currentApprecValue)
    });
  }

  const yearlySummary = generateYearlySummary(monthlySchedule);

  const startOwnership: OwnershipPosition = {
    customerPct: Math.round((securityDeposit / propertyValue) * 1000) / 10,
    customerValue: securityDeposit,
    investorPct: Math.round((financierCapital / propertyValue) * 1000) / 10,
    investorValue: financierCapital
  };

  const endOwnership: OwnershipPosition = {
    customerPct: 100,
    customerValue: appreciation.futureValue,
    investorPct: 0,
    investorValue: 0
  };

  const initialTotal = monthlyPrincipalAmortization + initialMonthlyRent;

  return {
    model: "IJARAH",
    modelName: "Ijarah Muntahia Bittamleek",
    modelArabicName: "الإجارة المنتهية بالتمليك",
    tagline: "Lease of Usufruct Ending in Transfer of Ownership",
    country: inputs.country,
    currency: inputs.currency,
    propertyValue,
    customerContribution: securityDeposit,
    customerContributionPct: Math.round((securityDeposit / propertyValue) * 1000) / 10,
    financierContribution: financierCapital,
    financierContributionPct: Math.round((financierCapital / propertyValue) * 1000) / 10,
    tenureYears,
    tenureMonths: totalMonths,
    annualRentalRate: rentalRate,
    securityDeposit,
    netFinancedLeaseCapital: Math.round(netFinancedLeaseCapital),
    monthlyPrincipalAmortization: Math.round(monthlyPrincipalAmortization),
    initialMonthlyRent: Math.round(initialMonthlyRent),
    finalMonthlyRent: Math.round(finalMonthlyRent),
    finalTransferMechanism: "Separate Gift (Hibah) or Nominal Sale upon fulfillment of all lease payments",
    monthlyPayment: Math.round(initialTotal),
    finalMonthlyPayment: Math.round(monthlyPrincipalAmortization + finalMonthlyRent),
    monthlyPaymentNote: `Starts at ${formatMonthlyDisplay(initialTotal, inputs.country)} and decreases to ${formatMonthlyDisplay(monthlyPrincipalAmortization + finalMonthlyRent, inputs.country)} as lease capital amortizes.`,
    totalFinancingPayments: Math.round(cumulativeTotal),
    totalCustomerCashOutflow: Math.round(securityDeposit + cumulativeTotal),
    totalCapitalPaid: Math.round(financierCapital),
    totalProfitPaid: 0,
    totalRentPaid: Math.round(cumulativeRent),
    appreciationRate,
    estimatedFuturePropertyValue: appreciation.futureValue,
    estimatedPropertyAppreciationGain: appreciation.gain,
    estimatedPropertyAppreciationGainPct: appreciation.gainPct,
    ownershipAtStart: startOwnership,
    ownershipAtEnd: endOwnership,
    monthlySchedule,
    yearlySummary,
    educationalSummary:
      "The financier purchases and holds the property, leasing the right to use it (usufruct) to you in return for rent. Each month, you pay rent plus a capital amortization payment. At the end of the term, ownership is transferred to you through a separate legal deed.",
    whatHappened:
      "Unlike a conventional hire-purchase loan, Ijarah legally separates asset ownership from the right of use (usufruct). The lessor retains ownership responsibilities (such as major structural maintenance and Takaful) while you enjoy uninterrupted occupancy. Upon completing all payments, title passes to you via an independent transfer agreement.",
    whyDifferent: {
      conventional: "Finance Lease / Loan: Borrower is treated as immediate owner for liabilities while lender charges compounding interest on the balance.",
      islamic: "Ijarah: Lessor retains legal ownership & structural risk → Customer pays for actual usufruct → Independent promise of title transfer at conclusion.",
      keyDifferences: [
        "Separation of ownership (Raqabah) from right to use (Manfa'ah).",
        "Lessor is responsible for major structural maintenance and property Takaful.",
        "Rent is only due if the property remains usable and habitable.",
        "Final ownership transfer cannot be tied into the lease contract itself (separate Wa'ad)."
      ]
    },
    shariahPrinciples: [
      {
        title: "Usufruct-Based Rent (Manfa'ah)",
        explanation: "Rent is legally justified because the tenant enjoys real economic utility (usufruct) from the physical asset. If the property becomes uninhabitable through no fault of the tenant, rent must cease."
      },
      {
        title: "Owner's Fundamental Liabilities",
        explanation: "The lessor/financier must bear major structural repairs and property insurance/Takaful, while ordinary tenant maintenance is the customer's responsibility."
      },
      {
        title: "Two Contracts in One Prohibition (Safqatayn fi Safqah)",
        explanation: "Shariah prohibits combining a lease contract and an immediate sale contract into a single document. Therefore, ownership transfer occurs through a separate unilateral promise (Wa'ad) or deed of gift (Hibah)."
      },
      {
        title: "Security Deposit (Hamish Jiddiyyah)",
        explanation: "The customer's initial contribution serves as an earnest money deposit to confirm intent and secures the transaction according to Shariah standards."
      }
    ]
  };
}

/**
 * 4. MUSHARAKAH (Commercial Property Partnership)
 * - Distinct from Diminishing Musharakah.
 * - Designed for commercial assets / multi-unit commercial buildings.
 * - Both partners contribute capital and become equity partners.
 * - Property generates rental/business income, minus operating expenses.
 * - Net distributable income is shared according to agreed profit-sharing ratio.
 * - Shariah rule: Capital loss MUST strictly match ownership/capital ratio.
 * - Supports modeling individual commercial units or the entire commercial building.
 */
export function calculateMusharakah(
  inputs: FinancingInputs,
  customUnits?: CommercialUnit[]
): CommercialMusharakahResult {
  const propertyValue = inputs.propertyValue;
  const customerCapital = inputs.customerContribution;
  const investorCapital = inputs.financingRequired;
  const tenureYears = inputs.tenureYears;
  const totalMonths = tenureYears * 12;

  const customerOwnershipPct = (customerCapital / propertyValue) * 100;
  const investorOwnershipPct = (investorCapital / propertyValue) * 100;

  // Agreed profit sharing ratios (defaults to capital ownership if not customized)
  const customerProfitSharePct = inputs.customerProfitSharePct ?? Math.round(customerOwnershipPct);
  const investorProfitSharePct = inputs.investorProfitSharePct ?? Math.round(100 - customerProfitSharePct);

  // Capital loss sharing ratio MUST strictly equal capital ratio under Shariah
  const customerLossSharePct = customerOwnershipPct;
  const investorLossSharePct = investorOwnershipPct;

  let warningNotice: string | undefined = undefined;
  if (Math.abs(customerProfitSharePct - customerOwnershipPct) > 10) {
    warningNotice =
      "Shariah Note: While profit sharing may be agreed flexibly by mutual consent, capital losses must strictly follow the capital contribution ratio (You: " +
      customerLossSharePct.toFixed(1) +
      "%, Investor: " +
      investorLossSharePct.toFixed(1) +
      "%).";
  }

  // Commercial revenue and expense modeling
  // If units are provided, calculate from units; otherwise use aggregate estimates
  let monthlyGrossIncome = 0;
  let monthlyExpenses = 0;
  const units: CommercialUnit[] = customUnits && customUnits.length > 0 ? customUnits : (inputs.commercialUnits || []);

  if (units.length > 0) {
    monthlyGrossIncome = units.reduce((acc, u) => acc + (u.isOccupied ? u.monthlyRent : 0), 0);
    monthlyExpenses = units.reduce((acc, u) => acc + u.monthlyExpenses, 0);
  } else {
    // Standard baseline for commercial property: ~7-9% gross yield, 20% expenses
    const defaultAnnualGross = inputs.rentalIncome || (propertyValue * 0.08);
    monthlyGrossIncome = defaultAnnualGross / 12;

    const opExpenses = inputs.operatingExpenses || (monthlyGrossIncome * 0.15);
    const mgmtFees = inputs.managementFees || (monthlyGrossIncome * 0.05);
    const maint = inputs.maintenanceCosts || (monthlyGrossIncome * 0.03);
    const takaful = inputs.takafulInsurance || (monthlyGrossIncome * 0.02);
    const taxes = inputs.propertyTaxes || (monthlyGrossIncome * 0.02);

    monthlyExpenses = opExpenses + mgmtFees + maint + takaful + taxes;
  }

  const monthlyNetProfit = Math.max(0, monthlyGrossIncome - monthlyExpenses);
  const annualGrossIncome = monthlyGrossIncome * 12;
  const annualExpenses = monthlyExpenses * 12;
  const annualNetProfit = monthlyNetProfit * 12;

  const customerMonthlyProfit = monthlyNetProfit * (customerProfitSharePct / 100);
  const investorMonthlyProfit = monthlyNetProfit * (investorProfitSharePct / 100);

  const appreciationRate = inputs.propertyAppreciationRate ?? 0;
  const appreciation = calculateFuturePropertyValue(propertyValue, appreciationRate, tenureYears);

  const monthlySchedule: MonthlyScheduleRow[] = [];
  let cumulativeCustomerProfit = 0;
  let cumulativeInvestorProfit = 0;
  let cumulativeGross = 0;
  let cumulativeExpenses = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const year = Math.ceil(m / 12);
    // Optional inflation / rent growth factor
    const rentGrowthFactor = Math.pow(1 + (inputs.annualRentGrowthPct || 0) / 100, Math.floor((m - 1) / 12));
    const currentGross = monthlyGrossIncome * rentGrowthFactor;
    const currentExp = monthlyExpenses * rentGrowthFactor;
    const currentNet = Math.max(0, currentGross - currentExp);

    const custProfit = currentNet * (customerProfitSharePct / 100);
    const invProfit = currentNet * (investorProfitSharePct / 100);

    cumulativeGross += currentGross;
    cumulativeExpenses += currentExp;
    cumulativeCustomerProfit += custProfit;
    cumulativeInvestorProfit += invProfit;

    const currentApprecValue = propertyValue * Math.pow(1 + appreciationRate / 100, m / 12);

    monthlySchedule.push({
      month: m,
      year,
      openingBalance: Math.round(propertyValue),
      closingBalance: Math.round(propertyValue), // In pure commercial partnership, capital remains invested
      totalPayment: Math.round(currentNet), // Net distributable cashflow
      capitalComponent: 0,
      profitOrRentComponent: Math.round(currentNet),
      cumulativeCapitalPaid: 0,
      cumulativeProfitOrRentPaid: Math.round(cumulativeCustomerProfit + cumulativeInvestorProfit),
      cumulativeTotalPaid: Math.round(cumulativeCustomerProfit + cumulativeInvestorProfit),
      customerOwnershipPct: Math.round(customerOwnershipPct * 100) / 100,
      investorOwnershipPct: Math.round(investorOwnershipPct * 100) / 100,
      customerEquityValue: Math.round(currentApprecValue * (customerOwnershipPct / 100)),
      investorEquityValue: Math.round(currentApprecValue * (investorOwnershipPct / 100)),
      estimatedPropertyValue: Math.round(currentApprecValue),
      grossIncome: Math.round(currentGross),
      expenses: Math.round(currentExp),
      netDistributableProfit: Math.round(currentNet),
      customerProfitShare: Math.round(custProfit),
      investorProfitShare: Math.round(invProfit)
    });
  }

  const yearlySummary = generateYearlySummary(monthlySchedule);

  const startOwnership: OwnershipPosition = {
    customerPct: Math.round(customerOwnershipPct * 10) / 10,
    customerValue: customerCapital,
    investorPct: Math.round(investorOwnershipPct * 10) / 10,
    investorValue: investorCapital
  };

  const endOwnership: OwnershipPosition = {
    customerPct: Math.round(customerOwnershipPct * 10) / 10,
    customerValue: Math.round(appreciation.futureValue * (customerOwnershipPct / 100)),
    investorPct: Math.round(investorOwnershipPct * 10) / 10,
    investorValue: Math.round(appreciation.futureValue * (investorOwnershipPct / 100))
  };

  const totalDistributable = cumulativeCustomerProfit + cumulativeInvestorProfit;
  const customerTotalReturn = customerCapital + cumulativeCustomerProfit + (appreciation.gain * (customerOwnershipPct / 100));
  const investorTotalReturn = investorCapital + cumulativeInvestorProfit + (appreciation.gain * (investorOwnershipPct / 100));

  return {
    model: "MUSHARAKAH",
    modelName: "Musharakah — Commercial Partnership",
    modelArabicName: "شركة العقد التجارية",
    tagline: "Commercial Equity Joint Venture with Shared Operational Income",
    country: inputs.country,
    currency: inputs.currency,
    propertyValue,
    customerContribution: customerCapital,
    customerContributionPct: Math.round(customerOwnershipPct * 10) / 10,
    financierContribution: investorCapital,
    financierContributionPct: Math.round(investorOwnershipPct * 10) / 10,
    tenureYears,
    tenureMonths: totalMonths,
    monthlyGrossIncome: Math.round(monthlyGrossIncome),
    annualGrossIncome: Math.round(annualGrossIncome),
    monthlyExpenses: Math.round(monthlyExpenses),
    annualExpenses: Math.round(annualExpenses),
    monthlyNetProfit: Math.round(monthlyNetProfit),
    annualNetProfit: Math.round(annualNetProfit),
    customerProfitSharePct: customerProfitSharePct,
    investorProfitSharePct: investorProfitSharePct,
    customerLossSharePct: customerLossSharePct,
    investorLossSharePct: investorLossSharePct,
    customerMonthlyProfit: Math.round(customerMonthlyProfit),
    investorMonthlyProfit: Math.round(investorMonthlyProfit),
    totalDistributableProfit: Math.round(totalDistributable),
    totalCustomerCumulativeProfit: Math.round(cumulativeCustomerProfit),
    totalInvestorCumulativeProfit: Math.round(cumulativeInvestorProfit),
    customerTotalEconomicReturn: Math.round(customerTotalReturn),
    investorTotalEconomicReturn: Math.round(investorTotalReturn),
    monthlyPayment: Math.round(customerMonthlyProfit), // Distributable income to customer
    monthlyPaymentNote: `Generates approx. ${formatMonthlyDisplay(customerMonthlyProfit, inputs.country)}/mo net commercial profit for your share.`,
    totalFinancingPayments: 0, // In pure commercial partnership, it's an equity investment, not a loan repayment
    totalCustomerCashOutflow: customerCapital,
    totalCapitalPaid: 0,
    totalProfitPaid: Math.round(cumulativeCustomerProfit),
    totalRentPaid: 0,
    appreciationRate,
    estimatedFuturePropertyValue: appreciation.futureValue,
    estimatedPropertyAppreciationGain: appreciation.gain,
    estimatedPropertyAppreciationGainPct: appreciation.gainPct,
    ownershipAtStart: startOwnership,
    ownershipAtEnd: endOwnership,
    monthlySchedule,
    yearlySummary,
    unitsBreakdown: units,
    warningNotice,
    educationalSummary:
      "You and the investor are genuine commercial equity partners. You jointly own the commercial asset, collect rental/business revenue, deduct legitimate operational expenses, and share net profits according to your agreed ratio while sharing capital risk.",
    whatHappened:
      "This is not a loan or financing debt. You created an equity joint venture (Shirkat-ul-'Aqd) for a revenue-generating commercial property. Capital remains invested in the asset throughout the partnership term, and operational profits are distributed monthly. If the property appreciates, both partners share in the capital gain.",
    whyDifferent: {
      conventional: "Commercial Bank Loan: Bank charges fixed or variable interest regardless of tenant occupancy or whether your commercial building makes a profit or loss.",
      islamic: "Musharakah Partnership: True Equity Sharing → Real Commercial Revenues & Expenses → Profit Shared by Agreement → Capital Loss Shared by Ownership. Aligned incentives.",
      keyDifferences: [
        "True equity joint venture with no debt obligation.",
        "Financier shares commercial operational risks, tenant vacancies, and maintenance.",
        "Profits are earned only from real generated business/rental cashflows.",
        "Losses of capital are borne strictly according to capital contribution."
      ]
    },
    shariahPrinciples: [
      {
        title: "Al-Ghunm bi-l-Ghurm (Gain with Risk)",
        explanation: "A fundamental Islamic jurisprudence maxim: entitlement to profit is justified by assuming the corresponding risk of financial loss. Guaranteed returns on capital are prohibited."
      },
      {
        title: "Ownership vs Profit Ratio Flexibility",
        explanation: "Partners may mutually agree on a profit-sharing ratio that differs from their capital contributions (for example, rewarding management expertise), but capital losses must strictly mirror capital ownership."
      },
      {
        title: "Legitimate Operating Expenses",
        explanation: "Only genuine operational costs (property management, maintenance, municipal taxes, and Shariah-compliant Takaful) may be deducted before calculating distributable profit."
      },
      {
        title: "No Principal Guarantee",
        explanation: "In Shariah partnership, neither partner can legally guarantee the nominal capital of the other partner against market risk."
      }
    ]
  };
}

/**
 * Universal dispatcher function that calculates any chosen model using the central engine.
 */
export function calculateModel(inputs: FinancingInputs): AnyFinancingResult {
  switch (inputs.propertyType === "COMMERCIAL" || inputs.propertyType === "COMMERCIAL_UNITS" || inputs.propertyType === "INVESTMENT" ? "MUSHARAKAH" : "DIMINISHING_MUSHARAKAH") {
    // Handled below based on explicit model or inputs
  }

  // If specific model is requested via helper or default:
  return calculateDiminishingMusharakah(inputs);
}

/**
 * Calculates all 4 models simultaneously for a unified comparison matrix.
 */
export function calculateAllModels(inputs: FinancingInputs, commercialUnits?: CommercialUnit[]): {
  murabahah: MurabahaResult;
  diminishingMusharakah: DiminishingMusharakahResult;
  ijarah: IjaraResult;
  musharakah: CommercialMusharakahResult;
} {
  return {
    murabahah: calculateMurabaha(inputs),
    diminishingMusharakah: calculateDiminishingMusharakah(inputs),
    ijarah: calculateIjara(inputs),
    musharakah: calculateMusharakah(inputs, commercialUnits)
  };
}

/**
 * Early settlement calculator
 * Evaluates remaining financier capital and educational note on discretionary Ibra' (rebate).
 */
export function calculateEarlySettlement(
  result: AnyFinancingResult,
  settlementMonth: number
): {
  settlementMonth: number;
  settlementYear: number;
  remainingCapitalBalance: number;
  totalPaidSoFar: number;
  capitalPaidSoFar: number;
  profitOrRentPaidSoFar: number;
  customerOwnershipAtSettlement: number;
  estimatedPropertyValueAtSettlement: number;
  educationalNote: string;
} {
  const row = result.monthlySchedule.find((r) => r.month === settlementMonth) || result.monthlySchedule[result.monthlySchedule.length - 1];

  let remainingCapital = row.closingBalance;
  let educationalNote = "";

  if (result.model === "MURABAHAH") {
    educationalNote =
      "Under Murabahah, the agreed sale price is a fixed debt obligation. Shariah standards (AAOIFI Standard 8) allow the financier at its sole discretion to grant a rebate (Ibra') on unearned profit for early payment, provided it is not contractually stipulated as a mandatory condition.";
  } else if (result.model === "DIMINISHING_MUSHARAKAH") {
    educationalNote =
      "Under Diminishing Musharakah, early settlement simply means purchasing all remaining investor equity units at once. Future rental obligations terminate immediately because the customer becomes the 100% owner of the property.";
  } else if (result.model === "IJARAH") {
    educationalNote =
      "Under Ijarah Muntahia Bittamleek, early settlement entails paying the remaining net financed lease capital balance to trigger the separate title transfer (Wa'ad/Hibah). Future lease rentals cease.";
  } else {
    educationalNote =
      "Under commercial Musharakah, early exit is executed through an agreed buyout of the partner's equity units at prevailing mutual valuation or contractual dissolution terms.";
  }

  return {
    settlementMonth: row.month,
    settlementYear: row.year,
    remainingCapitalBalance: remainingCapital,
    totalPaidSoFar: row.cumulativeTotalPaid,
    capitalPaidSoFar: row.cumulativeCapitalPaid,
    profitOrRentPaidSoFar: row.cumulativeProfitOrRentPaid,
    customerOwnershipAtSettlement: row.customerOwnershipPct,
    estimatedPropertyValueAtSettlement: row.estimatedPropertyValue,
    educationalNote
  };
}

/**
 * Helper to format monthly payments cleanly
 */
function formatMonthlyDisplay(amount: number, country: CountryCode): string {
  const symbol = MARKETS[country].symbol;
  if (country === "INDIA") {
    return `${symbol}${Math.round(amount).toLocaleString("en-IN")}`;
  }
  return `${symbol}${Math.round(amount).toLocaleString("en-GB")}`;
}
