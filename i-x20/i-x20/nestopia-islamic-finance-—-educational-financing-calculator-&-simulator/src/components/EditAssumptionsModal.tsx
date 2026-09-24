import React from "react";
import { FinancingInputs } from "../types";
import { formatCurrency, MARKETS } from "../lib/marketConfig";
import { X, SlidersHorizontal, RotateCcw, Check } from "lucide-react";

interface EditAssumptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: FinancingInputs;
  onUpdateInputs: (updated: Partial<FinancingInputs>) => void;
}

export const EditAssumptionsModal: React.FC<EditAssumptionsModalProps> = ({
  isOpen,
  onClose,
  inputs,
  onUpdateInputs
}) => {
  if (!isOpen) return null;

  const market = MARKETS[inputs.country];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-serif font-bold text-slate-100">
              Edit Financial Assumptions
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 text-xs">
          {/* Profit / Rental Rate Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Annual Murabahah Profit Rate (% p.a.)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="25"
                  value={inputs.annualProfitRate ?? market.defaultProfitRate}
                  onChange={(e) =>
                    onUpdateInputs({ annualProfitRate: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Annual Rental Rate (% p.a. for Diminishing/Ijarah)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="25"
                  value={inputs.annualRentalRate ?? market.defaultRentalRate}
                  onChange={(e) =>
                    onUpdateInputs({ annualRentalRate: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
              </div>
            </div>
          </div>

          {/* Property Appreciation Rate */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Expected Annual Property Appreciation (% p.a.)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={inputs.propertyAppreciationRate ?? 0}
                onChange={(e) =>
                  onUpdateInputs({ propertyAppreciationRate: Number(e.target.value) })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="font-bold text-emerald-400 w-12 text-right">
                {inputs.propertyAppreciationRate ?? 0}%
              </span>
            </div>
            <span className="text-[10px] text-slate-500">
              Illustrative compound growth projection (not guaranteed).
            </span>
          </div>

          {/* Commercial Musharakah Specific Settings */}
          {(inputs.propertyType === "COMMERCIAL" || inputs.propertyType === "COMMERCIAL_UNITS" || inputs.propertyType === "INVESTMENT") && (
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                Commercial Partnership Parameters
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">
                    Your Agreed Profit Share (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={inputs.customerProfitSharePct ?? 30}
                    onChange={(e) => {
                      const cust = Number(e.target.value);
                      onUpdateInputs({
                        customerProfitSharePct: cust,
                        investorProfitSharePct: 100 - cust
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    Investor Profit Share (%)
                  </label>
                  <input
                    type="number"
                    disabled
                    value={inputs.investorProfitSharePct ?? 70}
                    className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 font-bold cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onUpdateInputs({
                annualProfitRate: market.defaultProfitRate,
                annualRentalRate: market.defaultRentalRate,
                propertyAppreciationRate: market.defaultAppreciationRate
              });
            }}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
