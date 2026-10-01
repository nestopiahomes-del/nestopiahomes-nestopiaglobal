import React, { useState } from "react";
import { CommercialMusharakahResult, CommercialUnit, FinancingInputs } from "../types";
import { formatCurrency, formatPercentage } from "../lib/marketConfig";
import {
  Building2,
  Store,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldAlert,
  Percent
} from "lucide-react";

interface CommercialUnitsBreakdownProps {
  result: CommercialMusharakahResult;
  inputs: FinancingInputs;
  onUpdateCommercialUnits: (units: CommercialUnit[]) => void;
  onUpdateProfitShare: (customerPct: number, investorPct: number) => void;
  onOpenGlossary: (term?: string) => void;
}

export const CommercialUnitsBreakdown: React.FC<CommercialUnitsBreakdownProps> = ({
  result,
  inputs,
  onUpdateCommercialUnits,
  onUpdateProfitShare,
  onOpenGlossary
}) => {
  const [viewMode, setViewMode] = useState<"aggregate" | "units">("aggregate");

  // Sample default units if none exist
  const existingUnits: CommercialUnit[] = result.unitsBreakdown && result.unitsBreakdown.length > 0
    ? result.unitsBreakdown
    : [
        {
          id: "u1",
          name: "Unit 1 — Ground Floor Retail Store",
          unitValue: Math.round(result.propertyValue * 0.4),
          monthlyRent: Math.round(result.monthlyGrossIncome * 0.45),
          monthlyExpenses: Math.round(result.monthlyExpenses * 0.4),
          isOccupied: true,
          tenantType: "Retail Pharmacy"
        },
        {
          id: "u2",
          name: "Unit 2 — First Floor Professional Office",
          unitValue: Math.round(result.propertyValue * 0.35),
          monthlyRent: Math.round(result.monthlyGrossIncome * 0.35),
          monthlyExpenses: Math.round(result.monthlyExpenses * 0.35),
          isOccupied: true,
          tenantType: "Accounting Firm"
        },
        {
          id: "u3",
          name: "Unit 3 — Second Floor Tech Studio",
          unitValue: Math.round(result.propertyValue * 0.25),
          monthlyRent: Math.round(result.monthlyGrossIncome * 0.2),
          monthlyExpenses: Math.round(result.monthlyExpenses * 0.25),
          isOccupied: true,
          tenantType: "Design Studio"
        }
      ];

  const handleAddUnit = () => {
    const newUnit: CommercialUnit = {
      id: `u-${Date.now()}`,
      name: `Unit ${existingUnits.length + 1} — Commercial Suite`,
      unitValue: Math.round(result.propertyValue / (existingUnits.length + 1)),
      monthlyRent: Math.round(result.monthlyGrossIncome / (existingUnits.length + 1)),
      monthlyExpenses: Math.round(result.monthlyExpenses / (existingUnits.length + 1)),
      isOccupied: true,
      tenantType: "General Commercial Tenant"
    };
    onUpdateCommercialUnits([...existingUnits, newUnit]);
  };

  const handleRemoveUnit = (id: string) => {
    if (existingUnits.length <= 1) return;
    onUpdateCommercialUnits(existingUnits.filter((u) => u.id !== id));
  };

  const handleUnitChange = (id: string, field: keyof CommercialUnit, val: any) => {
    const updated = existingUnits.map((u) => {
      if (u.id === id) {
        return { ...u, [field]: val };
      }
      return u;
    });
    onUpdateCommercialUnits(updated);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
            Commercial Partnership Architecture
          </span>
          <h4 className="text-base font-serif font-bold text-slate-100 mt-1">
            Commercial Property & Revenue Breakdown
          </h4>
        </div>

        {/* View Toggle */}
        <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => setViewMode("aggregate")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === "aggregate"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Whole Asset Model
          </button>
          <button
            onClick={() => setViewMode("units")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === "units"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Multi-Unit Breakdown ({existingUnits.length} Units)
          </button>
        </div>
      </div>

      {/* SHARIAH RATIO CLARITY: OWNERSHIP vs PROFIT SHARE vs LOSS SHARE */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-900/30 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-indigo-400" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Shariah Capital & Profit Sharing Ratios
            </h5>
          </div>
          <button
            onClick={() => onOpenGlossary("musharakah")}
            className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
          >
            Why is profit ratio separate from ownership?
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          In a Shariah Musharakah partnership, <strong>ownership ratio</strong> and <strong>profit-sharing ratio</strong> may be agreed differently (e.g. to compensate working management), but <strong>capital losses must strictly follow capital ownership</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-center text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400">Capital Ownership:</span>
            <div className="mt-1 font-bold text-slate-100 flex justify-center gap-2">
              <span className="text-emerald-400">You: {formatPercentage(result.customerContributionPct)}</span>
              <span>•</span>
              <span className="text-slate-400">Investor: {formatPercentage(result.financierContributionPct)}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400">Agreed Profit Ratio:</span>
            <div className="mt-1 font-bold text-indigo-300 flex justify-center gap-2">
              <span className="text-indigo-400">You: {formatPercentage(result.customerProfitSharePct)}</span>
              <span>•</span>
              <span className="text-slate-400">Investor: {formatPercentage(result.investorProfitSharePct)}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400">Capital Loss Ratio (Mandatory):</span>
            <div className="mt-1 font-bold text-amber-400 flex justify-center gap-2">
              <span>You: {formatPercentage(result.customerLossSharePct)}</span>
              <span>•</span>
              <span>Investor: {formatPercentage(result.investorLossSharePct)}</span>
            </div>
          </div>
        </div>

        {/* Educational Warning if profit differs from capital */}
        {result.warningNotice && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{result.warningNotice}</span>
          </div>
        )}
      </div>

      {/* Aggregate Financial Performance Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] text-slate-400">Gross Monthly Rent</span>
          <p className="text-base font-bold text-slate-100 mt-1">
            {formatCurrency(result.monthlyGrossIncome, result.country)}
          </p>
          <span className="text-[10px] text-slate-500">
            {formatCurrency(result.annualGrossIncome, result.country)} / yr
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] text-slate-400">Operating Expenses</span>
          <p className="text-base font-bold text-rose-400 mt-1">
            {formatCurrency(result.monthlyExpenses, result.country)}
          </p>
          <span className="text-[10px] text-slate-500">
            Management, Takaful & Taxes
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] text-slate-400">Net Distributable Cash</span>
          <p className="text-base font-bold text-teal-400 mt-1">
            {formatCurrency(result.monthlyNetProfit, result.country)}
          </p>
          <span className="text-[10px] text-slate-500">
            Shared between partners
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-indigo-900/40">
          <span className="text-[11px] text-indigo-300 font-semibold">Your Monthly Profit</span>
          <p className="text-base font-bold text-emerald-400 mt-1">
            {formatCurrency(result.customerMonthlyProfit, result.country)}
          </p>
          <span className="text-[10px] text-emerald-400/80">
            {result.customerProfitSharePct}% agreed share
          </span>
        </div>
      </div>

      {/* MULTI-UNIT INDIVIDUAL BREAKDOWN */}
      {viewMode === "units" && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Commercial Units Portfolio
            </span>
            <button
              onClick={handleAddUnit}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Unit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {existingUnits.map((unit) => (
              <div
                key={unit.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-indigo-400" />
                    <input
                      type="text"
                      value={unit.name}
                      onChange={(e) => handleUnitChange(unit.id, "name", e.target.value)}
                      className="text-xs font-bold text-slate-200 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  {existingUnits.length > 1 && (
                    <button
                      onClick={() => handleRemoveUnit(unit.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove Unit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400">Monthly Gross Rent</label>
                    <input
                      type="number"
                      value={unit.monthlyRent}
                      onChange={(e) => handleUnitChange(unit.id, "monthlyRent", Number(e.target.value))}
                      className="w-full mt-0.5 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-100 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400">Monthly Expenses</label>
                    <input
                      type="number"
                      value={unit.monthlyExpenses}
                      onChange={(e) => handleUnitChange(unit.id, "monthlyExpenses", Number(e.target.value))}
                      className="w-full mt-0.5 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-100"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">Occupancy:</span>
                    <button
                      onClick={() => handleUnitChange(unit.id, "isOccupied", !unit.isOccupied)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        unit.isOccupied
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {unit.isOccupied ? "Occupied" : "Vacant"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
