import React, { useState } from "react";
import { AnyFinancingResult, MonthlyScheduleRow, YearlySummaryRow } from "../types";
import { formatCurrency, formatPercentage } from "../lib/marketConfig";
import {
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  CheckCircle2,
  Table as TableIcon
} from "lucide-react";

interface ScheduleTableProps {
  result: AnyFinancingResult;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({ result }) => {
  const [viewType, setViewType] = useState<"yearly" | "monthly">("yearly");
  const [selectedYearFilter, setSelectedYearFilter] = useState<number | "all">("all");
  const [searchMonth, setSearchMonth] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const isMurabahah = result.model === "MURABAHAH";
  const isDiminishing = result.model === "DIMINISHING_MUSHARAKAH";
  const isIjarah = result.model === "IJARAH";
  const isMusharakah = result.model === "MUSHARAKAH";

  // Filter monthly rows
  const filteredMonthly = result.monthlySchedule.filter((row) => {
    if (selectedYearFilter !== "all" && row.year !== selectedYearFilter) return false;
    if (searchMonth && !row.month.toString().includes(searchMonth)) return false;
    return true;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Financial Schedule
          </span>
          <h4 className="text-base font-serif font-bold text-slate-100 mt-1">
            Complete Financing Schedule & Amortization
          </h4>
        </div>

        {/* View Switcher: Yearly Summary vs Monthly Schedule */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setViewType("yearly")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewType === "yearly"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Yearly Summary</span>
            </button>
            <button
              onClick={() => setViewType("monthly")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewType === "monthly"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Month-by-Month ({result.tenureMonths} Mo)</span>
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
            title={isExpanded ? "Collapse Schedule" : "Expand Schedule"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* ================= YEARLY SUMMARY VIEW ================= */}
          {viewType === "yearly" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                A high-level view showing total payments, capital acquired, and rent/profit paid for each year of your {result.tenureYears}-year tenure.
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Year</th>
                      <th className="py-3 px-4">Total Paid in Year</th>
                      <th className="py-3 px-4">
                        {isMusharakah ? "Net Distributable" : "Capital Acquired"}
                      </th>
                      <th className="py-3 px-4">
                        {isMurabahah
                          ? "Agreed Profit Component"
                          : isMusharakah
                          ? "Your Annual Profit"
                          : "Rent Paid for Usufruct"}
                      </th>
                      <th className="py-3 px-4">
                        {isMusharakah ? "Asset Value" : "Remaining Financing"}
                      </th>
                      <th className="py-3 px-4 text-right">Your Ownership %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                    {result.yearlySummary.map((row) => (
                      <tr key={row.year} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-slate-200">
                          Year {row.year}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-100">
                          {formatCurrency(row.totalPaid, result.country)}
                        </td>
                        <td className="py-2.5 px-4 text-emerald-400 font-medium">
                          {isMusharakah
                            ? formatCurrency(row.annualNetProfit || 0, result.country)
                            : formatCurrency(row.capitalAcquired, result.country)}
                        </td>
                        <td className="py-2.5 px-4 text-amber-300 font-medium">
                          {isMusharakah
                            ? formatCurrency(row.customerAnnualProfit || 0, result.country)
                            : formatCurrency(row.profitOrRentPaid, result.country)}
                        </td>
                        <td className="py-2.5 px-4 text-slate-300">
                          {isMusharakah
                            ? formatCurrency(row.estimatedPropertyValue, result.country)
                            : formatCurrency(row.remainingFinancing, result.country)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-emerald-300">
                          {formatPercentage(row.customerOwnershipPct)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-950 font-bold border-t border-slate-700 text-slate-100">
                    <tr>
                      <td className="py-3 px-4 text-emerald-400">TOTAL / MATURITY</td>
                      <td className="py-3 px-4">
                        {formatCurrency(
                          isMusharakah
                            ? (result as any).totalDistributableProfit
                            : result.totalFinancingPayments,
                          result.country
                        )}
                      </td>
                      <td className="py-3 px-4 text-emerald-400">
                        {isMusharakah
                          ? formatCurrency((result as any).totalDistributableProfit, result.country)
                          : formatCurrency(result.totalCapitalPaid, result.country)}
                      </td>
                      <td className="py-3 px-4 text-amber-300">
                        {formatCurrency(
                          isMurabahah
                            ? result.totalProfitPaid
                            : isMusharakah
                            ? (result as any).totalCustomerCumulativeProfit
                            : result.totalRentPaid,
                          result.country
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {isMusharakah
                          ? formatCurrency(result.estimatedFuturePropertyValue, result.country)
                          : formatCurrency(0, result.country)}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-300">
                        {result.ownershipAtEnd.customerPct}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ================= MONTH-BY-MONTH VIEW ================= */}
          {viewType === "monthly" && (
            <div className="space-y-3">
              {/* Monthly Filter Controls */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Filter Year:</span>
                  <select
                    value={selectedYearFilter}
                    onChange={(e) =>
                      setSelectedYearFilter(
                        e.target.value === "all" ? "all" : Number(e.target.value)
                      )
                    }
                    className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 cursor-pointer"
                  >
                    <option value="all">All Years (1 to {result.tenureYears})</option>
                    {Array.from({ length: result.tenureYears }, (_, i) => i + 1).map((yr) => (
                      <option key={yr} value={yr}>
                        Year {yr} (Months {(yr - 1) * 12 + 1} to {yr * 12})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Month # (e.g. 36)..."
                    value={searchMonth}
                    onChange={(e) => setSearchMonth(e.target.value)}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 text-xs w-44"
                  />
                </div>
              </div>

              {/* Monthly Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold sticky top-0 z-10 border-b border-slate-800">
                    {/* Model-specific columns */}
                    {isMurabahah && (
                      <tr>
                        <th className="py-2.5 px-3">Month</th>
                        <th className="py-2.5 px-3">Starting Balance</th>
                        <th className="py-2.5 px-3">Fixed Monthly Payment</th>
                        <th className="py-2.5 px-3">Capital Component</th>
                        <th className="py-2.5 px-3">Profit Component</th>
                        <th className="py-2.5 px-3">Remaining Balance</th>
                        <th className="py-2.5 px-3">Cumulative Paid</th>
                        <th className="py-2.5 px-3 text-right">Your Equity %</th>
                      </tr>
                    )}

                    {isDiminishing && (
                      <tr>
                        <th className="py-2.5 px-3">Month</th>
                        <th className="py-2.5 px-3">Your Own %</th>
                        <th className="py-2.5 px-3">Investor Stake</th>
                        <th className="py-2.5 px-3">Investor Balance</th>
                        <th className="py-2.5 px-3">Equity Unit Buyout</th>
                        <th className="py-2.5 px-3">Monthly Rent</th>
                        <th className="py-2.5 px-3 font-bold text-slate-200">Total Payment</th>
                        <th className="py-2.5 px-3">Cumulative Equity</th>
                        <th className="py-2.5 px-3 text-right">Your Equity Value</th>
                      </tr>
                    )}

                    {isIjarah && (
                      <tr>
                        <th className="py-2.5 px-3">Month</th>
                        <th className="py-2.5 px-3">Opening Asset Balance</th>
                        <th className="py-2.5 px-3">Principal Amortization</th>
                        <th className="py-2.5 px-3">Rental Component</th>
                        <th className="py-2.5 px-3 font-bold text-slate-200">Total Payment</th>
                        <th className="py-2.5 px-3">Remaining Balance</th>
                        <th className="py-2.5 px-3">Cumulative Rent</th>
                        <th className="py-2.5 px-3 text-right">Cumulative Principal</th>
                      </tr>
                    )}

                    {isMusharakah && (
                      <tr>
                        <th className="py-2.5 px-3">Month</th>
                        <th className="py-2.5 px-3">Gross Income</th>
                        <th className="py-2.5 px-3">Expenses</th>
                        <th className="py-2.5 px-3">Net Distributable</th>
                        <th className="py-2.5 px-3 font-bold text-emerald-400">Your Profit</th>
                        <th className="py-2.5 px-3">Investor Profit</th>
                        <th className="py-2.5 px-3">Cumulative Your Profit</th>
                        <th className="py-2.5 px-3 text-right">Property Value</th>
                      </tr>
                    )}
                  </thead>

                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {filteredMonthly.map((row) => (
                      <tr key={row.month} className="hover:bg-slate-800/40 transition-colors">
                        {isMurabahah && (
                          <>
                            <td className="py-2 px-3 font-bold text-slate-300">
                              M{row.month} <span className="text-[10px] text-slate-500 font-normal">(Y{row.year})</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {formatCurrency(row.openingBalance, result.country)}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-100">
                              {formatCurrency(row.totalPayment, result.country)}
                            </td>
                            <td className="py-2 px-3 text-emerald-400">
                              {formatCurrency(row.capitalComponent, result.country)}
                            </td>
                            <td className="py-2 px-3 text-amber-300">
                              {formatCurrency(row.profitOrRentComponent, result.country)}
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {formatCurrency(row.closingBalance, result.country)}
                            </td>
                            <td className="py-2 px-3 text-slate-400">
                              {formatCurrency(row.cumulativeTotalPaid, result.country)}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-300">
                              {formatPercentage(row.customerOwnershipPct)}
                            </td>
                          </>
                        )}

                        {isDiminishing && (
                          <>
                            <td className="py-2 px-3 font-bold text-slate-300">
                              M{row.month} <span className="text-[10px] text-slate-500 font-normal">(Y{row.year})</span>
                            </td>
                            <td className="py-2 px-3 font-bold text-emerald-400">
                              {formatPercentage(row.customerOwnershipPct)}
                            </td>
                            <td className="py-2 px-3 text-slate-400">
                              {formatPercentage(row.investorOwnershipPct)}
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {formatCurrency(row.closingBalance, result.country)}
                            </td>
                            <td className="py-2 px-3 text-emerald-400">
                              {formatCurrency(row.capitalComponent, result.country)}
                            </td>
                            <td className="py-2 px-3 text-amber-300">
                              {formatCurrency(row.profitOrRentComponent, result.country)}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-100">
                              {formatCurrency(row.totalPayment, result.country)}
                            </td>
                            <td className="py-2 px-3 text-slate-400">
                              {formatCurrency(row.cumulativeCapitalPaid, result.country)}
                            </td>
                            <td className="py-2 px-3 text-right font-medium text-emerald-300">
                              {formatCurrency(row.customerEquityValue, result.country)}
                            </td>
                          </>
                        )}

                        {isIjarah && (
                          <>
                            <td className="py-2 px-3 font-bold text-slate-300">
                              M{row.month} <span className="text-[10px] text-slate-500 font-normal">(Y{row.year})</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {formatCurrency(row.openingBalance, result.country)}
                            </td>
                            <td className="py-2 px-3 text-emerald-400">
                              {formatCurrency(row.capitalComponent, result.country)}
                            </td>
                            <td className="py-2 px-3 text-amber-300">
                              {formatCurrency(row.profitOrRentComponent, result.country)}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-100">
                              {formatCurrency(row.totalPayment, result.country)}
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {formatCurrency(row.closingBalance, result.country)}
                            </td>
                            <td className="py-2 px-3 text-slate-400">
                              {formatCurrency(row.cumulativeProfitOrRentPaid, result.country)}
                            </td>
                            <td className="py-2 px-3 text-right font-medium text-emerald-300">
                              {formatCurrency(row.cumulativeCapitalPaid, result.country)}
                            </td>
                          </>
                        )}

                        {isMusharakah && (
                          <>
                            <td className="py-2 px-3 font-bold text-slate-300">
                              M{row.month} <span className="text-[10px] text-slate-500 font-normal">(Y{row.year})</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {formatCurrency(row.grossIncome || 0, result.country)}
                            </td>
                            <td className="py-2 px-3 text-rose-400">
                              {formatCurrency(row.expenses || 0, result.country)}
                            </td>
                            <td className="py-2 px-3 text-teal-400">
                              {formatCurrency(row.netDistributableProfit || 0, result.country)}
                            </td>
                            <td className="py-2 px-3 font-bold text-emerald-400">
                              {formatCurrency(row.customerProfitShare || 0, result.country)}
                            </td>
                            <td className="py-2 px-3 text-slate-400">
                              {formatCurrency(row.investorProfitShare || 0, result.country)}
                            </td>
                            <td className="py-2 px-3 text-slate-300 font-medium">
                              {formatCurrency(row.cumulativeCapitalPaid || (row.customerProfitShare || 0) * row.month, result.country)}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-400">
                              {formatCurrency(row.estimatedPropertyValue, result.country)}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
