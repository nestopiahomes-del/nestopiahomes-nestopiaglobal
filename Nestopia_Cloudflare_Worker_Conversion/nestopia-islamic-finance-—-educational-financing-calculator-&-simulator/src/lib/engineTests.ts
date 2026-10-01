import {
  calculateMurabaha,
  calculateDiminishingMusharakah,
  calculateIjara,
  calculateMusharakah
} from "./islamicFinanceEngine";
import { FinancingInputs } from "../types";

export interface TestResult {
  testName: string;
  passed: boolean;
  expected: Record<string, any>;
  actual: Record<string, any>;
  notes: string;
}

export function runAllEngineVerificationTests(): {
  allPassed: boolean;
  results: TestResult[];
} {
  const results: TestResult[] = [];

  // TEST 1: Murabahah (₹1 Crore, 20% contribution, 80% financing, 10-year tenure)
  {
    const inputs: FinancingInputs = {
      country: "INDIA",
      currency: "INR",
      propertyValue: 10000000,
      customerContribution: 2000000,
      customerContributionPct: 20,
      financingRequired: 8000000,
      financingRequiredPct: 80,
      tenureYears: 10,
      tenureMonths: 120,
      annualProfitRate: 7.5,
      propertyAppreciationRate: 5,
      propertyType: "RESIDENTIAL"
    };

    const res = calculateMurabaha(inputs);
    const expectedProfit = 8000000 * 0.075 * 10; // ₹60,00,000
    const expectedSalePrice = 8000000 + expectedProfit; // ₹1,40,00,000
    const finalScheduleRow = res.monthlySchedule[res.monthlySchedule.length - 1];

    const passed =
      res.totalCapitalPaid === 8000000 &&
      res.totalProfitPaid === expectedProfit &&
      res.totalMurabahaSalePrice === expectedSalePrice &&
      res.monthlySchedule.length === 120 &&
      finalScheduleRow.closingBalance === 0 &&
      res.ownershipAtEnd.customerPct === 100;

    results.push({
      testName: "Model 1: Murabahah ₹1 Crore (10-Year, 7.5% profit rate)",
      passed,
      expected: {
        totalCapital: 8000000,
        agreedProfit: expectedProfit,
        salePrice: expectedSalePrice,
        finalClosingBalance: 0,
        finalOwnership: 100
      },
      actual: {
        totalCapital: res.totalCapitalPaid,
        agreedProfit: res.totalProfitPaid,
        salePrice: res.totalMurabahaSalePrice,
        finalClosingBalance: finalScheduleRow.closingBalance,
        finalOwnership: res.ownershipAtEnd.customerPct
      },
      notes: "Verified Murabahah fixed cost-plus sale price, zero final balance, and 120-month schedule reconciliation."
    });
  }

  // TEST 2: Diminishing Musharakah (₹1 Crore, 20/80 ownership, 7.5% rental rate, 120 months)
  {
    const inputs: FinancingInputs = {
      country: "INDIA",
      currency: "INR",
      propertyValue: 10000000,
      customerContribution: 2000000,
      customerContributionPct: 20,
      financingRequired: 8000000,
      financingRequiredPct: 80,
      tenureYears: 10,
      tenureMonths: 120,
      annualRentalRate: 7.5,
      propertyAppreciationRate: 0,
      propertyType: "RESIDENTIAL"
    };

    const res = calculateDiminishingMusharakah(inputs);
    const finalRow = res.monthlySchedule[res.monthlySchedule.length - 1];
    const firstRow = res.monthlySchedule[0];

    // Unit buyout = 8000000 / 120 = 66,666.67
    // First month rent = 8000000 * 0.075 / 12 = 50,000
    const expectedFirstMonthRent = Math.round((8000000 * 0.075) / 12);
    const passed =
      res.totalEquityPurchased === 8000000 &&
      finalRow.closingBalance === 0 &&
      finalRow.customerOwnershipPct === 100 &&
      finalRow.investorOwnershipPct === 0 &&
      res.monthlySchedule.length === 120 &&
      Math.abs(firstRow.profitOrRentComponent - expectedFirstMonthRent) <= 1;

    results.push({
      testName: "Model 2: Diminishing Musharakah ₹1 Crore (20/80, 120 months, 7.5% rent)",
      passed,
      expected: {
        totalEquityPurchased: 8000000,
        finalInvestorBalance: 0,
        finalCustomerOwnership: 100,
        firstMonthRent: expectedFirstMonthRent
      },
      actual: {
        totalEquityPurchased: res.totalEquityPurchased,
        finalInvestorBalance: finalRow.closingBalance,
        finalCustomerOwnership: finalRow.customerOwnershipPct,
        firstMonthRent: firstRow.profitOrRentComponent
      },
      notes: "Verified Shirkat-ul-Milk co-ownership buyout, monthly rent reduction, and final 100% customer ownership."
    });
  }

  // TEST 3: Ijarah Muntahia Bittamleek (₹1 Crore, 20% deposit, 80% financed, 7.5% rental rate, 120 months)
  {
    const inputs: FinancingInputs = {
      country: "INDIA",
      currency: "INR",
      propertyValue: 10000000,
      customerContribution: 2000000,
      customerContributionPct: 20,
      financingRequired: 8000000,
      financingRequiredPct: 80,
      tenureYears: 10,
      tenureMonths: 120,
      annualRentalRate: 7.5,
      propertyAppreciationRate: 0,
      propertyType: "RESIDENTIAL"
    };

    const res = calculateIjara(inputs);
    const finalRow = res.monthlySchedule[res.monthlySchedule.length - 1];

    const passed =
      res.totalCapitalPaid === 8000000 &&
      finalRow.closingBalance === 0 &&
      res.monthlySchedule.length === 120 &&
      res.ownershipAtEnd.customerPct === 100;

    results.push({
      testName: "Model 3: Ijarah Muntahia Bittamleek ₹1 Crore (120 months, 7.5% rental rate)",
      passed,
      expected: {
        totalCapitalRepaid: 8000000,
        finalBalance: 0,
        finalOwnership: 100
      },
      actual: {
        totalCapitalRepaid: res.totalCapitalPaid,
        finalBalance: finalRow.closingBalance,
        finalOwnership: res.ownershipAtEnd.customerPct
      },
      notes: "Verified usufruct lease amortization, remaining balance clearance, and separate title transfer."
    });
  }

  // TEST 4: Musharakah Commercial Partnership (₹1 Crore, 30/70 ownership, defined income and expenses)
  {
    const inputs: FinancingInputs = {
      country: "INDIA",
      currency: "INR",
      propertyValue: 10000000,
      customerContribution: 3000000,
      customerContributionPct: 30,
      financingRequired: 7000000,
      financingRequiredPct: 70,
      tenureYears: 5,
      tenureMonths: 60,
      propertyType: "COMMERCIAL",
      rentalIncome: 1200000, // ₹12 Lakhs annual gross
      operatingExpenses: 200000, // ₹2 Lakhs annual expenses
      customerProfitSharePct: 40, // 40% agreed profit share (different from 30% capital)
      investorProfitSharePct: 60,
      propertyAppreciationRate: 5
    };

    const res = calculateMusharakah(inputs);
    const passed =
      res.customerProfitSharePct === 40 &&
      res.investorProfitSharePct === 60 &&
      res.customerLossSharePct === 30 &&
      res.investorLossSharePct === 70 &&
      res.monthlySchedule.length === 60 &&
      res.totalDistributableProfit > 0;

    results.push({
      testName: "Model 4: Commercial Musharakah (30/70 Capital, 40/60 Profit Agreement)",
      passed,
      expected: {
        ownership: { customer: 30, investor: 70 },
        profitShare: { customer: 40, investor: 60 },
        lossShare: { customer: 30, investor: 70 }
      },
      actual: {
        ownership: { customer: res.customerContributionPct, investor: res.financierContributionPct },
        profitShare: { customer: res.customerProfitSharePct, investor: res.investorProfitSharePct },
        lossShare: { customer: res.customerLossSharePct, investor: res.investorLossSharePct }
      },
      notes: "Verified distinction between Ownership %, Profit-sharing %, and Capital Loss-sharing %."
    });
  }

  const allPassed = results.every((r) => r.passed);
  return { allPassed, results };
}
