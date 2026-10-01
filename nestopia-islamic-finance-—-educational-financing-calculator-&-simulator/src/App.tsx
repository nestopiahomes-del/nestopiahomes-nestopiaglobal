import React, { useState, useEffect, useMemo } from "react";
import {
  CountryCode,
  FinancingModel,
  MARKETS,
  formatCurrency,
  formatPercentage
} from "./lib/marketConfig";
import { FinancingInputs, SavedScenario, CommercialUnit } from "./types";
import { calculateAllModels } from "./lib/islamicFinanceEngine";
import { runAllEngineVerificationTests } from "./lib/engineTests";
import { Navbar } from "./components/Navbar";
import { GuidedStepWizard } from "./components/GuidedStepWizard";
import { ResultSummaryCards } from "./components/ResultSummaryCards";
import { OwnershipProgressBar } from "./components/OwnershipProgressBar";
import { FinancialCharts } from "./components/FinancialCharts";
import { CommercialUnitsBreakdown } from "./components/CommercialUnitsBreakdown";
import { ScheduleTable } from "./components/ScheduleTable";
import { EducationalCards } from "./components/EducationalCards";
import { ComparisonMatrix } from "./components/ComparisonMatrix";
import { EditAssumptionsModal } from "./components/EditAssumptionsModal";
import { EarlySettlementModal } from "./components/EarlySettlementModal";
import { SavedScenariosModal } from "./components/SavedScenariosModal";
import { GlossaryModal } from "./components/GlossaryModal";
import { EngineTestRunnerModal } from "./components/EngineTestRunnerModal";
import { ReportModal } from "./components/ReportModal";
import {
  SlidersHorizontal,
  Clock,
  FileDown,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  BookOpen,
  Info
} from "lucide-react";

export default function App() {
  // Global Market / Country
  const [country, setCountry] = useState<CountryCode>("INDIA");
  const [isLearnMode, setIsLearnMode] = useState<boolean>(false);
  const [viewState, setViewState] = useState<"wizard" | "simulation">("wizard");
  const [selectedModel, setSelectedModel] = useState<FinancingModel>("DIMINISHING_MUSHARAKAH");

  // Inputs state
  const defaultMarket = MARKETS[country];
  const [inputs, setInputs] = useState<FinancingInputs>(() => ({
    country: "INDIA",
    currency: "INR",
    propertyValue: 10000000, // 1 Crore
    customerContribution: 2000000, // 20 Lakhs
    customerContributionPct: 20,
    financingRequired: 8000000, // 80 Lakhs
    financingRequiredPct: 80,
    tenureYears: 15,
    tenureMonths: 180,
    annualProfitRate: 7.5,
    annualRentalRate: 7.5,
    propertyAppreciationRate: 5.0,
    propertyType: "RESIDENTIAL",
    customerProfitSharePct: 30,
    investorProfitSharePct: 70
  }));

  // Commercial units state for Musharakah
  const [commercialUnits, setCommercialUnits] = useState<CommercialUnit[]>([]);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isEarlySettlementOpen, setIsEarlySettlementOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [glossaryInitialTerm, setGlossaryInitialTerm] = useState<string | undefined>();
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState<boolean>(false);

  // Saved scenarios in localStorage
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>(() => {
    try {
      const stored = localStorage.getItem("nestopia_financing_scenarios");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Keep scenarios persisted
  useEffect(() => {
    try {
      localStorage.setItem("nestopia_financing_scenarios", JSON.stringify(savedScenarios));
    } catch (e) {
      console.error("Failed to persist scenarios", e);
    }
  }, [savedScenarios]);

  // Central Calculation Engine Execution
  const calculatedModels = useMemo(() => {
    return calculateAllModels(inputs, commercialUnits);
  }, [inputs, commercialUnits]);

  // Active result
  const activeResult = useMemo(() => {
    switch (selectedModel) {
      case "MURABAHAH":
        return calculatedModels.murabahah;
      case "DIMINISHING_MUSHARAKAH":
        return calculatedModels.diminishingMusharakah;
      case "IJARAH":
        return calculatedModels.ijarah;
      case "MUSHARAKAH":
        return calculatedModels.musharakah;
      default:
        return calculatedModels.diminishingMusharakah;
    }
  }, [selectedModel, calculatedModels]);

  // Handle Country Change
  const handleCountryChange = (newCountry: CountryCode) => {
    const market = MARKETS[newCountry];
    setCountry(newCountry);

    // If switching between UK and India, adjust property values to native sensible figures
    const isSwitchingToUK = newCountry === "UK";
    const newPropVal = isSwitchingToUK ? 350000 : 10000000;
    const newContrib = Math.round(newPropVal * (inputs.customerContributionPct / 100));
    const newFinancing = newPropVal - newContrib;

    setInputs((prev) => ({
      ...prev,
      country: newCountry,
      currency: market.currency,
      propertyValue: newPropVal,
      customerContribution: newContrib,
      financingRequired: newFinancing,
      annualProfitRate: market.defaultProfitRate,
      annualRentalRate: market.defaultRentalRate,
      propertyAppreciationRate: market.defaultAppreciationRate
    }));
  };

  // Toggle Learn Mode vs Calculator Mode
  const handleToggleLearnMode = () => {
    const nextLearn = !isLearnMode;
    setIsLearnMode(nextLearn);

    if (nextLearn) {
      // Load standard canonical reference workbook numbers
      if (country === "INDIA") {
        setInputs({
          country: "INDIA",
          currency: "INR",
          propertyValue: 10000000, // ₹1 Crore
          customerContribution: 2000000, // ₹20 Lakhs
          customerContributionPct: 20,
          financingRequired: 8000000, // ₹80 Lakhs
          financingRequiredPct: 80,
          tenureYears: 10,
          tenureMonths: 120,
          annualProfitRate: 7.5,
          annualRentalRate: 7.5,
          propertyAppreciationRate: 5.0,
          propertyType: "RESIDENTIAL",
          customerProfitSharePct: 30,
          investorProfitSharePct: 70
        });
      } else {
        setInputs({
          country: "UK",
          currency: "GBP",
          propertyValue: 350000, // £350k
          customerContribution: 70000, // £70k
          customerContributionPct: 20,
          financingRequired: 280000, // £280k
          financingRequiredPct: 80,
          tenureYears: 15,
          tenureMonths: 180,
          annualProfitRate: 5.8,
          annualRentalRate: 5.5,
          propertyAppreciationRate: 3.5,
          propertyType: "RESIDENTIAL",
          customerProfitSharePct: 30,
          investorProfitSharePct: 70
        });
      }
    }
  };

  const handleUpdateInputs = (updated: Partial<FinancingInputs>) => {
    setInputs((prev) => ({ ...prev, ...updated }));
  };

  const handleOpenGlossary = (term?: string) => {
    setGlossaryInitialTerm(term);
    setIsGlossaryOpen(true);
  };

  // Scenario management
  const handleSaveCurrentScenario = (name: string) => {
    const newScenario: SavedScenario = {
      id: `sc-${Date.now()}`,
      name,
      savedAt: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }),
      country: inputs.country,
      model: selectedModel,
      inputs: { ...inputs }
    };
    setSavedScenarios((prev) => [newScenario, ...prev]);
  };

  const handleLoadScenario = (scenario: SavedScenario) => {
    setCountry(scenario.country);
    setSelectedModel(scenario.model);
    setInputs({ ...scenario.inputs });
    setViewState("simulation");
  };

  const handleDeleteScenario = (id: string) => {
    setSavedScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDuplicateScenario = (scenario: SavedScenario) => {
    const copy: SavedScenario = {
      ...scenario,
      id: `sc-${Date.now()}`,
      name: `${scenario.name} (Copy)`,
      savedAt: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    };
    setSavedScenarios((prev) => [copy, ...prev]);
  };

  const currentMarket = MARKETS[country];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Executive Header & Navigation */}
      <Navbar
        country={country}
        onCountryChange={handleCountryChange}
        isLearnMode={isLearnMode}
        onToggleLearnMode={handleToggleLearnMode}
        onOpenGlossary={handleOpenGlossary}
        onOpenSavedScenarios={() => setIsSavedModalOpen(true)}
        savedScenariosCount={savedScenarios.length}
        onOpenTestRunner={() => setIsTestRunnerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Mode Indicator Banner if Learn Mode is on */}
        {isLearnMode && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200 flex-wrap gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Learn Mode Active:</strong> Exploring canonical reference example ({currentMarket.name} standard scenario). You can switch to Calculator Mode anytime to enter your own numbers.
              </span>
            </div>
            <button
              onClick={() => setIsLearnMode(false)}
              className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 cursor-pointer transition-colors"
            >
              Use My Numbers
            </button>
          </div>
        )}

        {/* ================= VIEW 1: GUIDED WIZARD ================= */}
        {viewState === "wizard" && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto pt-4 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Ethical • Asset-Backed • Transparent
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-100 tracking-tight">
                Understand Islamic Property Finance in Minutes
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Explore four Shariah-compliant financing structures using your own property numbers. Compare Murabahah, Musharakah, Diminishing Musharakah, and Ijarah side by side.
              </p>
            </div>

            <GuidedStepWizard
              inputs={inputs}
              onUpdateInputs={handleUpdateInputs}
              selectedModel={selectedModel}
              onSelectModel={(m) => {
                setSelectedModel(m);
              }}
              onFinishWizard={() => setViewState("simulation")}
              onOpenGlossary={handleOpenGlossary}
            />
          </div>
        )}

        {/* ================= VIEW 2: INTERACTIVE SIMULATION RESULTS ================= */}
        {viewState === "simulation" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Toolbar / Action Header */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3 shadow-lg">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewState("wizard")}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Edit Property Numbers</span>
                </button>

                <div className="h-5 w-px bg-slate-800 hidden sm:block" />

                {/* Model Selector Pill Dropdown / Buttons */}
                <div className="flex items-center gap-1 overflow-x-auto text-xs">
                  {(
                    [
                      { key: "MURABAHAH", label: "Murabahah" },
                      { key: "DIMINISHING_MUSHARAKAH", label: "Diminishing" },
                      { key: "IJARAH", label: "Ijarah" },
                      { key: "MUSHARAKAH", label: "Commercial" }
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setSelectedModel(m.key)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        selectedModel === m.key
                          ? "bg-emerald-600 text-white shadow"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Edit Assumptions, Settle Early, Generate Report */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Adjust profit rates, rental rates, and appreciation"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Edit Assumptions</span>
                </button>

                <button
                  onClick={() => setIsEarlySettlementOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Simulate early payoff after Year 3, 5, 7, etc."
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Settle Early?</span>
                </button>

                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/60 cursor-pointer transition-all"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Financing Report</span>
                </button>
              </div>
            </div>

            {/* Model Title Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Active Islamic Simulation
                  </span>
                  <span className="text-xs font-serif italic text-amber-300">
                    {activeResult.modelArabicName}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-100 tracking-tight">
                  {activeResult.modelName}
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  {activeResult.educationalSummary}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400">
                  {currentMarket.company}
                </span>
                <p className="text-sm font-bold text-slate-200">
                  {currentMarket.name} ({currentMarket.currency})
                </p>
              </div>
            </div>

            {/* 1. Five Questions & Financial Totals */}
            <ResultSummaryCards
              result={activeResult}
              onOpenGlossary={handleOpenGlossary}
            />

            {/* 2. Dynamic Ownership Timeline Progress Bar */}
            <OwnershipProgressBar result={activeResult} />

            {/* 3. Commercial Units Breakdown (Shown for Commercial Musharakah) */}
            {selectedModel === "MUSHARAKAH" && (
              <CommercialUnitsBreakdown
                result={calculatedModels.musharakah}
                inputs={inputs}
                onUpdateCommercialUnits={(units) => setCommercialUnits(units)}
                onUpdateProfitShare={(cust, inv) => {
                  handleUpdateInputs({
                    customerProfitSharePct: cust,
                    investorProfitSharePct: inv
                  });
                }}
                onOpenGlossary={handleOpenGlossary}
              />
            )}

            {/* 4. Interactive Visual Financial Charts */}
            <FinancialCharts result={activeResult} />

            {/* 5. Complete Month-by-Month Schedule & Yearly Summary */}
            <ScheduleTable result={activeResult} />

            {/* 6. "What Just Happened?", "Why is this Different?", and Shariah Principles */}
            <EducationalCards
              result={activeResult}
              onOpenGlossary={handleOpenGlossary}
            />

            {/* 7. Side-by-Side Model Comparison Matrix */}
            <ComparisonMatrix
              models={calculatedModels}
              currentModel={selectedModel}
              onSelectModel={(m) => setSelectedModel(m)}
              onOpenGlossary={handleOpenGlossary}
            />
          </div>
        )}
      </main>

      {/* Mandatory Regulatory & Educational Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 mt-12 py-8 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-900 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center font-serif font-black text-amber-300 text-xs">
                N
              </div>
              <span className="font-serif font-bold text-slate-300">
                {currentMarket.company}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{currentMarket.jurisdiction}</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <button
                onClick={() => setIsTestRunnerOpen(true)}
                className="hover:text-emerald-400 cursor-pointer"
              >
                Verification Tests
              </button>
              <span>•</span>
              <button
                onClick={() => handleOpenGlossary()}
                className="hover:text-emerald-400 cursor-pointer"
              >
                Glossary
              </button>
              <span>•</span>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="hover:text-emerald-400 cursor-pointer"
              >
                Print Report
              </button>
            </div>
          </div>

          <p className="leading-relaxed text-[11px] text-slate-500">
            <strong>Educational Simulator Notice:</strong> This calculator is an educational simulator, not an offer of finance or a substitute for legal, financial, tax or Shariah advice. The calculations illustrate possible structures based on the assumptions entered. Actual Shariah compliance depends on the final contracts, ownership, possession, risk allocation and implementation. Please consult a qualified Shariah scholar and appropriate professional advisers before entering into a transaction.
          </p>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <EditAssumptionsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        inputs={inputs}
        onUpdateInputs={handleUpdateInputs}
      />

      <EarlySettlementModal
        isOpen={isEarlySettlementOpen}
        onClose={() => setIsEarlySettlementOpen(false)}
        result={activeResult}
        onOpenGlossary={handleOpenGlossary}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        result={activeResult}
      />

      <SavedScenariosModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        scenarios={savedScenarios}
        onSaveCurrentScenario={handleSaveCurrentScenario}
        onLoadScenario={handleLoadScenario}
        onDeleteScenario={handleDeleteScenario}
        onDuplicateScenario={handleDuplicateScenario}
        currentInputs={inputs}
        currentModel={selectedModel}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        initialTerm={glossaryInitialTerm}
      />

      <EngineTestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />
    </div>
  );
}
