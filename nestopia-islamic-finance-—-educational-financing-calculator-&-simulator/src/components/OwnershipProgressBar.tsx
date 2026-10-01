import React, { useState } from "react";
import { AnyFinancingResult } from "../types";
import { formatCurrency, formatPercentage } from "../lib/marketConfig";
import { Users, User, Landmark, Play, Pause, RotateCcw } from "lucide-react";

interface OwnershipProgressBarProps {
  result: AnyFinancingResult;
}

export const OwnershipProgressBar: React.FC<OwnershipProgressBarProps> = ({ result }) => {
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const tenureYears = result.tenureYears;

  // Find data at selected year
  const yearlyData = result.yearlySummary;
  const currentYearRow =
    selectedYear === 0
      ? null
      : yearlyData.find((y) => y.year === selectedYear) || yearlyData[yearlyData.length - 1];

  const customerPct =
    selectedYear === 0
      ? result.ownershipAtStart.customerPct
      : currentYearRow?.customerOwnershipPct ?? 100;
  const investorPct = Math.max(0, 100 - customerPct);

  const customerVal =
    selectedYear === 0
      ? result.ownershipAtStart.customerValue
      : currentYearRow
      ? Math.round(currentYearRow.estimatedPropertyValue * (customerPct / 100))
      : result.ownershipAtEnd.customerValue;

  const investorVal =
    selectedYear === 0
      ? result.ownershipAtStart.investorValue
      : currentYearRow
      ? Math.round(currentYearRow.estimatedPropertyValue * (investorPct / 100))
      : 0;

  // Milestone points along tenure (e.g. Year 0, Year 1/4, Year 1/2, Year 3/4, Maturity)
  const quarter1 = Math.max(1, Math.round(tenureYears * 0.25));
  const quarter2 = Math.max(2, Math.round(tenureYears * 0.5));
  const quarter3 = Math.max(3, Math.round(tenureYears * 0.75));
  const milestones = [
    { label: "Start", year: 0 },
    { label: `Year ${quarter1}`, year: quarter1 },
    { label: `Year ${quarter2}`, year: quarter2 },
    { label: `Year ${quarter3}`, year: quarter3 },
    { label: `Maturity (${tenureYears}y)`, year: tenureYears }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Dynamic Equity Journey
          </span>
          <h4 className="text-base font-serif font-bold text-slate-100 mt-1">
            Ownership Transition Over Time
          </h4>
        </div>

        {/* Selected Year Badge */}
        <div className="text-right">
          <span className="text-xs font-bold text-slate-300">
            {selectedYear === 0 ? "Initial Day 1 Position" : `Position at Year ${selectedYear}`}
          </span>
          <p className="text-[11px] text-slate-400">
            {selectedYear === 0 ? "Initial equity split" : `${selectedYear * 12} months completed`}
          </p>
        </div>
      </div>

      {/* Main Dual Ownership Bar */}
      <div className="space-y-2">
        {/* Ownership Percentage Labels Above Bar */}
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <User className="w-4 h-4" />
            <span>Your Ownership: {formatPercentage(customerPct)}</span>
            <span className="text-slate-400 font-normal">
              ({formatCurrency(customerVal, result.country)})
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Financier Stake: {formatPercentage(investorPct)}</span>
            <span className="text-slate-500 font-normal">
              ({formatCurrency(investorVal, result.country)})
            </span>
            <Landmark className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Two-tone Progress Bar */}
        <div className="h-6 w-full bg-slate-950 rounded-xl overflow-hidden p-1 border border-slate-800 flex shadow-inner">
          {/* Customer Portion */}
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-l-lg transition-all duration-300 relative flex items-center justify-center text-[10px] font-bold text-white overflow-hidden shadow"
            style={{ width: `${customerPct}%` }}
          >
            {customerPct >= 15 && `${formatPercentage(customerPct)}`}
          </div>

          {/* Investor Portion */}
          <div
            className="h-full bg-gradient-to-r from-slate-700 to-slate-800 rounded-r-lg transition-all duration-300 flex items-center justify-center text-[10px] font-bold text-slate-300 overflow-hidden"
            style={{ width: `${investorPct}%` }}
          >
            {investorPct >= 15 && `${formatPercentage(investorPct)}`}
          </div>
        </div>
      </div>

      {/* Interactive Timeline Scrubber */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Drag timeline to preview equity position at any year:</span>
          <span className="font-bold text-amber-300">
            Year {selectedYear} of {tenureYears}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max={tenureYears}
          step="1"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer"
        />

        {/* Quick Milestone Buttons */}
        <div className="flex items-center justify-between gap-1 mt-3 flex-wrap">
          {milestones.map((m) => (
            <button
              key={m.label}
              onClick={() => setSelectedYear(m.year)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                selectedYear === m.year
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {m.label}
            </button>
          ))}
          <button
            onClick={() => setSelectedYear(0)}
            className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
            title="Reset to Start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
