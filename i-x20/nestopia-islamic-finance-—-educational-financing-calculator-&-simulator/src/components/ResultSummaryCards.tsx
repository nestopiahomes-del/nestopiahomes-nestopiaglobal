import React from "react";
import { AnyFinancingResult } from "../types";
import { formatCurrency, formatPercentage } from "../lib/marketConfig";
import {
  Wallet,
  Building,
  Calendar,
  PiggyBank,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Percent,
  AlertCircle
} from "lucide-react";

interface ResultSummaryCardsProps {
  result: AnyFinancingResult;
  onOpenGlossary: (term?: string) => void;
}

export const ResultSummaryCards: React.FC<ResultSummaryCardsProps> = ({
  result,
  onOpenGlossary
}) => {
  const isMurabahah = result.model === "MURABAHAH";
  const isMusharakah = result.model === "MUSHARAKAH";
  const isDiminishing = result.model === "DIMINISHING_MUSHARAKAH";
  const isIjarah = result.model === "IJARAH";

  return (
    <div className="space-y-6">
      {/* 5 KEY QUESTIONS ANSWERED AT A GLANCE (Under 30 seconds comprehension) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Quick Orientation
            </span>
            <h3 className="text-lg font-serif font-bold text-slate-100 mt-1">
              Your Financing in 30 Seconds
            </h3>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            5 Simple Questions Answered
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Q1: How much am I putting in? */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Wallet className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Your Initial Capital</span>
              </div>
              <p className="text-xl font-bold text-slate-100">
                {formatCurrency(result.customerContribution, result.country)}
              </p>
            </div>
            <p className="text-[11px] text-amber-400 font-semibold mt-2">
              {result.customerContributionPct}% of property value
            </p>
          </div>

          {/* Q2: How much is being financed? */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Financier Capital</span>
              </div>
              <p className="text-xl font-bold text-emerald-400">
                {formatCurrency(result.financierContribution, result.country)}
              </p>
            </div>
            <p className="text-[11px] text-emerald-400/80 font-semibold mt-2">
              {result.financierContributionPct}% of property value
            </p>
          </div>

          {/* Q3: How long will it take? */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                <span>3. Time Horizon</span>
              </div>
              <p className="text-xl font-bold text-slate-100">
                {result.tenureYears} Years
              </p>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mt-2">
              {result.tenureMonths} monthly cycles
            </p>
          </div>

          {/* Q4: How much will I pay in total? */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <PiggyBank className="w-3.5 h-3.5 text-amber-300" />
                <span>4. Total Cash Paid</span>
              </div>
              <p className="text-xl font-bold text-amber-300">
                {formatCurrency(result.totalCustomerCashOutflow, result.country)}
              </p>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {isMusharakah ? "Capital invested" : "Initial capital + all payments"}
            </p>
          </div>

          {/* Q5: What happens to ownership? */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>5. Final Ownership</span>
              </div>
              <p className="text-xl font-bold text-emerald-300">
                {result.ownershipAtEnd.customerPct}%
              </p>
            </div>
            <p className="text-[11px] text-emerald-400/90 font-medium mt-2">
              {isMusharakah
                ? `${result.ownershipAtEnd.customerPct}% partner equity`
                : "100% sole owner of property"}
            </p>
          </div>
        </div>
      </div>

      {/* TOTAL COST AT END OF TENURE: DETAILED ECONOMIC BREAKDOWN */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h4 className="text-base font-serif font-bold text-slate-100">
              Total Financial Breakdown & Cash Outflow
            </h4>
            <p className="text-xs text-slate-400">
              Clear distinction between property cost, financier capital, profit/rent, and total cash paid.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {result.modelName} Structure
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Breakdown Items */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Original Property Purchase Value:</span>
              <span className="font-bold text-slate-100">
                {formatCurrency(result.propertyValue, result.country)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Your Initial Contribution:</span>
              <span className="font-bold text-amber-400">
                {formatCurrency(result.customerContribution, result.country)} ({result.customerContributionPct}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Amount Financed by Financier:</span>
              <span className="font-bold text-emerald-400">
                {formatCurrency(result.financierContribution, result.country)} ({result.financierContributionPct}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-800/60">
              <span className="text-slate-400">
                {isMurabahah
                  ? "Total Agreed Disclosed Profit:"
                  : isMusharakah
                  ? "Total Cumulative Distributable Profit:"
                  : "Total Rent Paid for Usufruct:"}
              </span>
              <span className="font-bold text-teal-300">
                {formatCurrency(
                  isMurabahah
                    ? result.totalProfitPaid
                    : isMusharakah
                    ? (result as any).totalCustomerCumulativeProfit
                    : result.totalRentPaid,
                  result.country
                )}
              </span>
            </div>

            {!isMusharakah && (
              <div className="flex items-center justify-between text-sm py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Total Financing Scheduled Payments:</span>
                <span className="font-bold text-slate-200">
                  {formatCurrency(result.totalFinancingPayments, result.country)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-base pt-2 font-bold text-slate-100">
              <span className="text-emerald-400">Total Cash Outlay by You:</span>
              <span className="text-amber-300 text-lg">
                {formatCurrency(result.totalCustomerCashOutflow, result.country)}
              </span>
            </div>
          </div>

          {/* Right Column: Educational Context on Total Cost vs Property Value */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>Important Accounting Distinction</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isMurabahah && (
                  <>
                    The total cash paid ({formatCurrency(result.totalCustomerCashOutflow, result.country)}) equals your initial contribution plus the fixed Murabahah sale price. The financier purchased the property and sold it to you with an agreed profit of {formatCurrency(result.totalProfitPaid, result.country)}. This profit is <strong>fixed and will never compound</strong>.
                  </>
                )}
                {isDiminishing && (
                  <>
                    The total cash paid ({formatCurrency(result.totalCustomerCashOutflow, result.country)}) is split between <strong>Equity Purchases</strong> ({formatCurrency(result.totalCapitalPaid, result.country)} that buys your 100% ownership) and <strong>Fair Rent</strong> ({formatCurrency(result.totalRentPaid, result.country)} for occupying the financier's share). Rent steadily reduces every month.
                  </>
                )}
                {isIjarah && (
                  <>
                    The total cash paid ({formatCurrency(result.totalCustomerCashOutflow, result.country)}) comprises your initial security deposit, the <strong>Capital Amortization</strong> of the financed asset, and <strong>Rental Usufruct Payments</strong>. Major structural liabilities remain with the lessor.
                  </>
                )}
                {isMusharakah && (
                  <>
                    In a commercial partnership, you are not repaying a loan. You contributed capital of {formatCurrency(result.customerContribution, result.country)}. Over {result.tenureYears} years, your share of commercial rental cashflows is projected to distribute {formatCurrency((result as any).totalCustomerCumulativeProfit, result.country)} in cumulative net profits.
                  </>
                )}
              </p>
            </div>

            {/* Representative monthly payment card */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-900/40">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">
                {isMusharakah ? "Estimated Monthly Net Profit To You" : "Monthly Installment / Payment"}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(result.monthlyPayment, result.country)}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              {result.monthlyPaymentNote && (
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {result.monthlyPaymentNote}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
