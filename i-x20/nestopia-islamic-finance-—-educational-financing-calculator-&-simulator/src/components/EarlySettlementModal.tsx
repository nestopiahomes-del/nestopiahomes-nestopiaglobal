import React, { useState } from "react";
import { AnyFinancingResult } from "../types";
import { calculateEarlySettlement } from "../lib/islamicFinanceEngine";
import { formatCurrency, formatPercentage } from "../lib/marketConfig";
import { X, Clock, HelpCircle, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";

interface EarlySettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnyFinancingResult;
  onOpenGlossary: (term?: string) => void;
}

export const EarlySettlementModal: React.FC<EarlySettlementModalProps> = ({
  isOpen,
  onClose,
  result,
  onOpenGlossary
}) => {
  if (!isOpen) return null;

  const totalYears = result.tenureYears;
  const defaultYear = Math.max(1, Math.min(5, Math.round(totalYears / 2)));
  const [settlementYear, setSettlementYear] = useState<number>(defaultYear);

  const settlementMonth = settlementYear * 12;
  const settlementData = calculateEarlySettlement(result, settlementMonth);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-serif font-bold text-slate-100">
              What if I Settle Early?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Milestone Selector Buttons & Slider */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 block">
            Choose Early Settlement Horizon:
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {[1, 3, 5, 7, 10].filter((y) => y < totalYears).map((yr) => (
              <button
                key={yr}
                onClick={() => setSettlementYear(yr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  settlementYear === yr
                    ? "bg-amber-500 text-slate-950 font-bold shadow"
                    : "bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                After Year {yr} (Month {yr * 12})
              </button>
            ))}
          </div>

          <div className="pt-2">
            <input
              type="range"
              min="1"
              max={totalYears - 1}
              step="1"
              value={settlementYear}
              onChange={(e) => setSettlementYear(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>Year 1</span>
              <span>Year {settlementYear} (Selected)</span>
              <span>Year {totalYears - 1}</span>
            </div>
          </div>
        </div>

        {/* Calculated Settlement Summary */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Settlement Horizon:</span>
            <span className="font-bold text-slate-200">
              Year {settlementData.settlementYear} (Month {settlementData.settlementMonth} of {result.tenureMonths})
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Total Payments Made So Far:</span>
            <span className="font-bold text-slate-200">
              {formatCurrency(settlementData.totalPaidSoFar, result.country)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Capital Acquired / Buyouts Paid:</span>
            <span className="font-bold text-emerald-400">
              {formatCurrency(settlementData.capitalPaidSoFar, result.country)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Your Ownership at Settlement:</span>
            <span className="font-bold text-emerald-300">
              {formatPercentage(settlementData.customerOwnershipAtSettlement)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm pt-2 font-bold text-slate-100">
            <span className="text-amber-300">Outstanding Balance to Clear:</span>
            <span className="text-lg text-amber-300">
              {formatCurrency(settlementData.remainingCapitalBalance, result.country)}
            </span>
          </div>
        </div>

        {/* Shariah Education on Discretionary Ibra' (Rebate) */}
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200/90 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Shariah Framework for Early Settlement (Ibra')</span>
            </span>
            <button
              onClick={() => onOpenGlossary("ibra")}
              className="text-[11px] text-amber-300 hover:underline cursor-pointer"
            >
              What is Ibra'?
            </button>
          </div>
          <p className="leading-relaxed">
            {settlementData.educationalNote}
          </p>
          <p className="text-[11px] text-emerald-300/80 italic">
            Under AAOIFI Shariah standards, a rebate cannot be legally mandated in advance inside the contract because it would mimic a debt discount, but the financier may voluntarily grant an Ibra' waiver at settlement time.
          </p>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Close Settlement View
          </button>
        </div>
      </div>
    </div>
  );
};
