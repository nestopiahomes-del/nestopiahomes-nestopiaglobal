import React, { useState } from "react";
import { SavedScenario, FinancingInputs } from "../types";
import { FinancingModel, formatCurrency, MARKETS } from "../lib/marketConfig";
import {
  BookmarkCheck,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  X,
  Calendar,
  Check
} from "lucide-react";

interface SavedScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: SavedScenario[];
  onSaveCurrentScenario: (name: string) => void;
  onLoadScenario: (scenario: SavedScenario) => void;
  onDeleteScenario: (id: string) => void;
  onDuplicateScenario: (scenario: SavedScenario) => void;
  currentInputs: FinancingInputs;
  currentModel: FinancingModel;
}

export const SavedScenariosModal: React.FC<SavedScenariosModalProps> = ({
  isOpen,
  onClose,
  scenarios,
  onSaveCurrentScenario,
  onLoadScenario,
  onDeleteScenario,
  onDuplicateScenario,
  currentInputs,
  currentModel
}) => {
  if (!isOpen) return null;

  const [newScenarioName, setNewScenarioName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newScenarioName.trim() || `${currentModel} Simulation (${currentInputs.country})`;
    onSaveCurrentScenario(name);
    setNewScenarioName("");
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-serif font-bold text-slate-100">
              Saved Financing Scenarios
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Simulation Button / Form */}
        {!isSaving ? (
          <button
            onClick={() => setIsSaving(true)}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-emerald-500/50 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Save Current Simulation to My Device</span>
          </button>
        ) : (
          <form onSubmit={handleSave} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              Scenario Name:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                placeholder="e.g. London Flat 15Y or Delhi Commercial Unit"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsSaving(false)}
                className="px-3 py-2 bg-slate-800 text-slate-400 hover:text-slate-200 text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Saved List */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Saved Simulations ({scenarios.length})
          </span>

          {scenarios.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
              <BookmarkCheck className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p>No saved scenarios yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Save your simulation to easily compare different property prices or tenures later.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 group hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">
                        {sc.name}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                        {sc.model}
                      </span>
                      <span className="text-xs">{sc.country === "UK" ? "🇬🇧" : "🇮🇳"}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>{formatCurrency(sc.inputs.propertyValue, sc.country)}</span>
                      <span>•</span>
                      <span>{sc.inputs.tenureYears} Years</span>
                      <span>•</span>
                      <span className="text-slate-500">{sc.savedAt}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        onLoadScenario(sc);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow"
                      title="Load this simulation"
                    >
                      <span>Load</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onDuplicateScenario(sc)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                      title="Duplicate Scenario"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteScenario(sc.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
                      title="Delete Scenario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
