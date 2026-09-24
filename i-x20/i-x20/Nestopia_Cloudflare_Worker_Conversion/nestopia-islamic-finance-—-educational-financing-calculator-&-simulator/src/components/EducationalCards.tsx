import React, { useState } from "react";
import { AnyFinancingResult } from "../types";
import { formatCurrency, formatPercentage } from "../lib/marketConfig";
import {
  HelpCircle,
  ShieldCheck,
  Scale,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertCircle,
  FileText
} from "lucide-react";

interface EducationalCardsProps {
  result: AnyFinancingResult;
  onOpenGlossary: (term?: string) => void;
}

export const EducationalCards: React.FC<EducationalCardsProps> = ({
  result,
  onOpenGlossary
}) => {
  const [isShariahPanelOpen, setIsShariahPanelOpen] = useState<boolean>(true);

  return (
    <div className="space-y-6">
      {/* ================= 1. "WHAT JUST HAPPENED?" ================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <h4 className="text-lg font-serif font-bold text-slate-100">
            What Just Happened?
          </h4>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-normal">
          {result.whatHappened}
        </p>
      </div>

      {/* ================= 2. "WHY IS THIS DIFFERENT?" ================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-400" />
          <h4 className="text-lg font-serif font-bold text-slate-100">
            Why is this Different from a Conventional Loan?
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Conventional Mechanism */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 space-y-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Conventional Debt Model
            </span>
            <p className="text-xs text-rose-200/90 leading-relaxed">
              {result.whyDifferent.conventional}
            </p>
          </div>

          {/* Islamic Asset-Backed Mechanism */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Islamic Asset-Backed Structure
            </span>
            <p className="text-xs text-emerald-200/90 leading-relaxed">
              {result.whyDifferent.islamic}
            </p>
          </div>
        </div>

        {/* Key Difference Bullet Points */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">
            Four Key Structural Safeguards:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            {result.whyDifferent.keyDifferences.map((diff, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{diff}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= 3. PROPERTY APPRECIATION & VALUE PROJECTION ================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <h4 className="text-lg font-serif font-bold text-slate-100">
              Illustrative Property Appreciation Projection
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Compound Annual Growth Rate ({result.appreciationRate}%)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400">Original Property Cost</span>
            <p className="text-base font-bold text-slate-100 mt-1">
              {formatCurrency(result.propertyValue, result.country)}
            </p>
            <span className="text-[10px] text-slate-500">Day 1 baseline</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400">Annual Appreciation Rate</span>
            <p className="text-base font-bold text-teal-400 mt-1">
              {result.appreciationRate}% p.a.
            </p>
            <span className="text-[10px] text-slate-500">Assumed average growth</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400">Estimated Future Value</span>
            <p className="text-base font-bold text-emerald-400 mt-1">
              {formatCurrency(result.estimatedFuturePropertyValue, result.country)}
            </p>
            <span className="text-[10px] text-emerald-400/80">
              After {result.tenureYears} years
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400">Projected Value Increase</span>
            <p className="text-base font-bold text-amber-300 mt-1">
              +{formatCurrency(result.estimatedPropertyAppreciationGain, result.country)}
            </p>
            <span className="text-[10px] text-amber-300/80">
              +{result.estimatedPropertyAppreciationGainPct}% gain
            </span>
          </div>
        </div>

        {/* Mandatory Appreciation Disclaimer */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Illustrative projection only:</strong> Actual future property values may be higher, lower, or fluctuate due to market cycles, interest rates, regional demand, and economic conditions. Capital growth is never guaranteed.
          </span>
        </div>
      </div>

      {/* ================= 4. SHARIAH PRINCIPLES BEHIND THIS MODEL ================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div
          onClick={() => setIsShariahPanelOpen(!isShariahPanelOpen)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h4 className="text-lg font-serif font-bold text-slate-100">
              Shariah Principles Behind This Model
            </h4>
          </div>
          <button className="text-slate-400 hover:text-slate-200">
            {isShariahPanelOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {isShariahPanelOpen && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-300">
              Islamic finance is not merely "interest-free"; it is founded upon authentic commercial contracts, asset ownership, risk participation, and equitable risk-sharing governed by AAOIFI Shariah standards.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.shariahPrinciples.map((principle, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1.5"
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <h5 className="text-xs font-bold text-slate-100">
                      {principle.title}
                    </h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5">
                    {principle.explanation}
                  </p>
                </div>
              ))}
            </div>

            {/* Crucial Shariah Compliance & Fatwa Disclaimer */}
            <div className="mt-4 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200/90 space-y-1.5">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Educational Simulator Notice (Non-Fatwa)</span>
              </span>
              <p className="leading-relaxed">
                This simulator is an educational illustration of commonly used Islamic-finance structures. Actual Shariah compliance depends on the precise legal contracts, documentation, physical ownership transfer, risk allocation, and execution. Users should obtain advice from a qualified Shariah scholar and appropriate legal/financial professionals before entering any transaction.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
