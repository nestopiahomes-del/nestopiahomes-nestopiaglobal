import React, { useState } from "react";
import {
  CountryCode,
  PropertyType,
  FinancingModel,
  MARKETS,
  formatCurrency,
  formatVerbalAmount
} from "../lib/marketConfig";
import { FinancingInputs } from "../types";
import {
  Home,
  Building2,
  Store,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Info
} from "lucide-react";

interface GuidedStepWizardProps {
  inputs: FinancingInputs;
  onUpdateInputs: (updated: Partial<FinancingInputs>) => void;
  selectedModel: FinancingModel;
  onSelectModel: (model: FinancingModel) => void;
  onFinishWizard: () => void;
  onOpenGlossary: (term: string) => void;
}

export const GuidedStepWizard: React.FC<GuidedStepWizardProps> = ({
  inputs,
  onUpdateInputs,
  selectedModel,
  onSelectModel,
  onFinishWizard,
  onOpenGlossary
}) => {
  // Steps: 1: Asset Type, 2: Country, 3: Basic Numbers, 4: Model Selection
  const [currentStep, setCurrentStep] = useState<number>(1);
  const market = MARKETS[inputs.country];

  const handlePropertyValueChange = (newVal: number) => {
    const val = Math.max(1000, newVal);
    // Keep contribution percentage steady
    const currentContribPct = inputs.customerContributionPct || 20;
    const newContrib = Math.round((val * currentContribPct) / 100);
    const newFinancing = val - newContrib;

    onUpdateInputs({
      propertyValue: val,
      customerContribution: newContrib,
      financingRequired: newFinancing
    });
  };

  const handleContributionChange = (newContrib: number) => {
    const val = Math.max(0, Math.min(newContrib, inputs.propertyValue));
    const pct = Math.round((val / inputs.propertyValue) * 1000) / 10;
    const newFinancing = inputs.propertyValue - val;

    onUpdateInputs({
      customerContribution: val,
      customerContributionPct: pct,
      financingRequired: newFinancing,
      financingRequiredPct: Math.round((newFinancing / inputs.propertyValue) * 1000) / 10
    });
  };

  const handleContributionPctChange = (newPct: number) => {
    const pct = Math.max(0, Math.min(newPct, 95));
    const newContrib = Math.round((inputs.propertyValue * pct) / 100);
    const newFinancing = inputs.propertyValue - newContrib;

    onUpdateInputs({
      customerContribution: newContrib,
      customerContributionPct: pct,
      financingRequired: newFinancing,
      financingRequiredPct: Math.round((100 - pct) * 10) / 10
    });
  };

  const handleTenureChange = (years: number) => {
    const y = Math.max(1, Math.min(years, 40));
    onUpdateInputs({
      tenureYears: y,
      tenureMonths: y * 12
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Wizard Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          <span>Step {currentStep} of 4</span>
          <span>
            {currentStep === 1 && "Asset Type"}
            {currentStep === 2 && "Location & Jurisdiction"}
            {currentStep === 3 && "Property & Financing Details"}
            {currentStep === 4 && "Choose Islamic Structure"}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all duration-300 ${
                step < currentStep
                  ? "bg-emerald-500"
                  : step === currentStep
                  ? "bg-amber-400 shadow-sm shadow-amber-400/50"
                  : "bg-slate-800"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ================= STEP 1: ASSET TYPE ================= */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              What are you looking to finance?
            </h2>
            <p className="text-sm text-slate-400">
              Select the property type so we can recommend the appropriate Islamic financing models.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {[
              {
                type: "RESIDENTIAL" as PropertyType,
                title: "Residential Property",
                subtitle: "Single-family home, flat, or apartment for your personal or family residence.",
                icon: Home,
                badge: "Most Common"
              },
              {
                type: "COMMERCIAL" as PropertyType,
                title: "Commercial Property",
                subtitle: "Office building, retail store, warehouse, or industrial property.",
                icon: Building2,
                badge: "Business"
              },
              {
                type: "COMMERCIAL_UNITS" as PropertyType,
                title: "Commercial Units",
                subtitle: "Multi-unit retail or commercial complex generating multiple rental streams.",
                icon: Store,
                badge: "Multi-Tenanted"
              },
              {
                type: "INVESTMENT" as PropertyType,
                title: "Investment / Partnership",
                subtitle: "Joint co-investment partnership with an investor sharing revenues and risks.",
                icon: Briefcase,
                badge: "Joint Venture"
              }
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = inputs.propertyType === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => {
                    onUpdateInputs({ propertyType: item.type });
                    setCurrentStep(2);
                  }}
                  className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                    isSelected
                      ? "bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl shadow-emerald-950/40"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {item.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400">
                    <span>Select & Continue</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= STEP 2: COUNTRY & JURISDICTION ================= */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              Where is the property located?
            </h2>
            <p className="text-sm text-slate-400">
              Select the market to apply local currency formatting, default valuations, and legal structuring context.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
            {/* United Kingdom */}
            <button
              onClick={() => {
                onUpdateInputs({
                  country: "UK",
                  currency: "GBP",
                  propertyValue: inputs.propertyValue > 1000000 ? 350000 : inputs.propertyValue,
                  customerContribution: inputs.propertyValue > 1000000 ? 70000 : Math.round(inputs.propertyValue * 0.2),
                  financingRequired: inputs.propertyValue > 1000000 ? 280000 : Math.round(inputs.propertyValue * 0.8)
                });
                setCurrentStep(3);
              }}
              className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                inputs.country === "UK"
                  ? "bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">🇬🇧</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    GBP (£)
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  United Kingdom
                </h3>
                <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                  Nestopia Homes Limited
                </p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  London, UK • English Law & Alternative Property Finance Tax Rules (including SDLT Alternative Finance relief).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Select United Kingdom</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* India */}
            <button
              onClick={() => {
                onUpdateInputs({
                  country: "INDIA",
                  currency: "INR",
                  propertyValue: inputs.propertyValue < 1000000 ? 10000000 : inputs.propertyValue,
                  customerContribution: inputs.propertyValue < 1000000 ? 2000000 : Math.round(inputs.propertyValue * 0.2),
                  financingRequired: inputs.propertyValue < 1000000 ? 8000000 : Math.round(inputs.propertyValue * 0.8)
                });
                setCurrentStep(3);
              }}
              className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                inputs.country === "INDIA"
                  ? "bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">🇮🇳</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    INR (₹)
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  India
                </h3>
                <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                  Nestopia Global Private Limited
                </p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Mumbai, India • Indian Contract Act, 1872 & Property Co-Ownership (Shirkat-ul-Milk) structuring.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Select India</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Asset Type</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: BASIC PROPERTY INFORMATION ================= */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              Basic Property Information
            </h2>
            <p className="text-sm text-slate-400">
              Enter the property value, your down payment, and preferred duration. We'll instantly calculate the capital breakdown.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* 1. Property Value */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-200">
                  What is the property worth?
                </label>
                <span className="text-xs font-bold text-emerald-400">
                  {formatVerbalAmount(inputs.propertyValue, inputs.country)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
                  {market.symbol}
                </span>
                <input
                  type="number"
                  min="5000"
                  step={inputs.country === "INDIA" ? "100000" : "10000"}
                  value={inputs.propertyValue}
                  onChange={(e) => handlePropertyValueChange(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-lg font-bold text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                <span className="text-slate-500">Presets:</span>
                {inputs.country === "INDIA" ? (
                  <>
                    {[
                      { label: "₹50 Lakh", val: 5000000 },
                      { label: "₹1 Crore", val: 10000000 },
                      { label: "₹2 Crore", val: 20000000 },
                      { label: "₹5 Crore", val: 50000000 }
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => handlePropertyValueChange(p.val)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      { label: "£200k", val: 200000 },
                      { label: "£350k", val: 350000 },
                      { label: "£500k", val: 500000 },
                      { label: "£1M", val: 1000000 }
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => handlePropertyValueChange(p.val)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* 2. Customer Contribution (Down Payment) */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-200">
                  How much are you contributing? (Your Initial Equity)
                </label>
                <span className="text-xs font-bold text-amber-400">
                  {inputs.customerContributionPct}% • {formatVerbalAmount(inputs.customerContribution, inputs.country)}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    {market.symbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max={inputs.propertyValue}
                    step={inputs.country === "INDIA" ? "50000" : "5000"}
                    value={inputs.customerContribution}
                    onChange={(e) => handleContributionChange(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-base font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="90"
                    step="1"
                    value={inputs.customerContributionPct}
                    onChange={(e) => handleContributionPctChange(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-300 w-12 text-right">
                    {inputs.customerContributionPct}%
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Financing Required */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-200">
                  Financing Required from Financier
                </label>
                <span className="text-xs font-bold text-emerald-400">
                  {inputs.financingRequiredPct}% • {formatCurrency(inputs.financingRequired, inputs.country)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center justify-between text-sm">
                <span>Calculated Financier Capital:</span>
                <span className="font-bold text-emerald-300 text-base">
                  {formatCurrency(inputs.financingRequired, inputs.country)} ({inputs.financingRequiredPct}%)
                </span>
              </div>
            </div>

            {/* 4. Tenure (Duration) with Steppers, Typing & Slider (1 - 40 Years) */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-200">
                  How long would you like the arrangement to run?
                </label>
                <span className="text-xs font-bold text-amber-300">
                  {inputs.tenureYears} Years = {inputs.tenureMonths} Months
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Minus Stepper */}
                <button
                  type="button"
                  onClick={() => handleTenureChange(inputs.tenureYears - 1)}
                  disabled={inputs.tenureYears <= 1}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-100 font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                >
                  -
                </button>

                {/* Direct Number Input */}
                <div className="flex-1 relative">
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={inputs.tenureYears}
                    onChange={(e) => handleTenureChange(Number(e.target.value))}
                    className="w-full text-center py-2.5 bg-slate-950 border border-slate-700 rounded-xl font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    Years
                  </span>
                </div>

                {/* Plus Stepper */}
                <button
                  type="button"
                  onClick={() => handleTenureChange(inputs.tenureYears + 1)}
                  disabled={inputs.tenureYears >= 40}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-100 font-bold text-lg flex items-center justify-center transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Slider for smooth dragging */}
              <div className="mt-3">
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={inputs.tenureYears}
                  onChange={(e) => handleTenureChange(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>1 Year</span>
                  <span>10 Years</span>
                  <span>15 Years</span>
                  <span>20 Years</span>
                  <span>25 Years</span>
                  <span>40 Years</span>
                </div>
              </div>
            </div>

            {/* AUTOMATIC FINANCING SUMMARY CARD */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-600/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Instant Financing Summary
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Property Value</p>
                  <p className="text-sm font-bold text-slate-100 mt-0.5">
                    {formatCurrency(inputs.propertyValue, inputs.country)}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Your Capital</p>
                  <p className="text-sm font-bold text-amber-300 mt-0.5">
                    {formatCurrency(inputs.customerContribution, inputs.country)}{" "}
                    <span className="text-xs text-slate-400 font-normal">({inputs.customerContributionPct}%)</span>
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Financier Capital</p>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">
                    {formatCurrency(inputs.financingRequired, inputs.country)}{" "}
                    <span className="text-xs text-slate-400 font-normal">({inputs.financingRequiredPct}%)</span>
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Tenure Horizon</p>
                  <p className="text-sm font-bold text-slate-100 mt-0.5">
                    {inputs.tenureYears} Years <span className="text-xs text-slate-400 font-normal">({inputs.tenureMonths} Mo)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Location</span>
            </button>

            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Choose Islamic Model</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: MODEL SELECTION ================= */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              How would you like the financing to work?
            </h2>
            <p className="text-sm text-slate-400">
              Explore four genuine Islamic financing structures. Each structure distributes risk, ownership, and payments differently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* MODEL 1: MURABAHAH */}
            <div
              className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative ${
                selectedModel === "MURABAHAH"
                  ? "bg-slate-900 border-amber-400/80 ring-2 ring-amber-400/20 shadow-xl"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    Buy & Pay Later
                  </span>
                  <span className="text-xs text-slate-400 font-serif italic">المرابحة</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-100">
                  Murabahah
                </h3>
                <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                  Cost-Plus Sale on Deferred Payments
                </p>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  "Instead of lending you money, the financier purchases the property and sells it to you at an agreed cost plus an agreed profit."
                </p>

                <div className="mt-4 space-y-2 text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <p>
                    <strong className="text-slate-300">How it works:</strong> Financier buys property → assumes ownership risk → sells to you at fixed price.
                  </p>
                  <p>
                    <strong className="text-slate-300">Payment:</strong> Fixed monthly installment from Day 1 to maturity.
                  </p>
                  <p>
                    <strong className="text-slate-300">Suitable scenario:</strong> Those who desire 100% predictable fixed payments with no rental variation.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => onOpenGlossary("murabahah")}
                  className="text-[11px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3 h-3" />
                  <span>Learn Principles</span>
                </button>
                <button
                  onClick={() => {
                    onSelectModel("MURABAHAH");
                    onFinishWizard();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <span>Simulate Murabahah</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* MODEL 2: DIMINISHING MUSHARAKAH */}
            <div
              className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative ${
                selectedModel === "DIMINISHING_MUSHARAKAH"
                  ? "bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    Own More Over Time
                  </span>
                  <span className="text-xs text-slate-400 font-serif italic">المشاركة المتناقصة</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-100">
                  Diminishing Musharakah
                </h3>
                <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                  Co-Ownership & Gradual Unit Buyout
                </p>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  "You and the investor jointly own the property. You gradually purchase the investor's share while paying rent on the share you do not yet own."
                </p>

                <div className="mt-4 space-y-2 text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <p>
                    <strong className="text-slate-300">How it works:</strong> Joint co-ownership (Shirkat-ul-Milk) + Ijarah lease on partner's equity units.
                  </p>
                  <p>
                    <strong className="text-slate-300">Payment:</strong> Monthly Unit Buyout + Declining Rent (payments decrease over time).
                  </p>
                  <p>
                    <strong className="text-slate-300">Suitable scenario:</strong> Residential home purchases and long-term homeownership.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => onOpenGlossary("diminishingMusharakah")}
                  className="text-[11px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3 h-3" />
                  <span>Learn Principles</span>
                </button>
                <button
                  onClick={() => {
                    onSelectModel("DIMINISHING_MUSHARAKAH");
                    onFinishWizard();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <span>Simulate Diminishing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* MODEL 3: IJARAH */}
            <div
              className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative ${
                selectedModel === "IJARAH"
                  ? "bg-slate-900 border-teal-500 ring-2 ring-teal-500/20 shadow-xl"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300">
                    Lease & Eventually Own
                  </span>
                  <span className="text-xs text-slate-400 font-serif italic">الإجارة المنتهية بالتمليك</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-100">
                  Ijarah Muntahia Bittamleek
                </h3>
                <p className="text-xs font-semibold text-teal-400 mt-0.5">
                  Lease of Usufruct Ending in Ownership Transfer
                </p>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  "The investor owns the property and leases its use to you, with ownership transferred separately through an independent promise at the end."
                </p>

                <div className="mt-4 space-y-2 text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <p>
                    <strong className="text-slate-300">How it works:</strong> Asset ownership resides with lessor; lessee pays for actual right of use (usufruct).
                  </p>
                  <p>
                    <strong className="text-slate-300">Payment:</strong> Capital Amortization + Monthly Rental Component.
                  </p>
                  <p>
                    <strong className="text-slate-300">Suitable scenario:</strong> Buyers preferring lessor structural maintenance and lease mechanics.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => onOpenGlossary("ijarah")}
                  className="text-[11px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3 h-3" />
                  <span>Learn Principles</span>
                </button>
                <button
                  onClick={() => {
                    onSelectModel("IJARAH");
                    onFinishWizard();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <span>Simulate Ijarah</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* MODEL 4: COMMERCIAL MUSHARAKAH */}
            <div
              className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative ${
                selectedModel === "MUSHARAKAH"
                  ? "bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                    Become Equity Partners
                  </span>
                  <span className="text-xs text-slate-400 font-serif italic">شركة العقد التجارية</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-100">
                  Musharakah Commercial
                </h3>
                <p className="text-xs font-semibold text-indigo-400 mt-0.5">
                  Commercial Asset Partnership & Revenue Sharing
                </p>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  "You and the investor jointly own a revenue-generating commercial asset and share actual net operating profits according to an agreed ratio."
                </p>

                <div className="mt-4 space-y-2 text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <p>
                    <strong className="text-slate-300">How it works:</strong> True equity joint venture; capital stays invested; net rents are distributed.
                  </p>
                  <p>
                    <strong className="text-slate-300">Payment:</strong> You receive monthly operational profit distributions from tenant cashflows.
                  </p>
                  <p>
                    <strong className="text-slate-300">Suitable scenario:</strong> Commercial properties, multi-unit complexes, business partnerships.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => onOpenGlossary("musharakah")}
                  className="text-[11px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3 h-3" />
                  <span>Learn Principles</span>
                </button>
                <button
                  onClick={() => {
                    onSelectModel("MUSHARAKAH");
                    onFinishWizard();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <span>Simulate Musharakah</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Numbers</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
