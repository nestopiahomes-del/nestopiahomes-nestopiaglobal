import React from "react";
import {
  CountryCode,
  MARKETS
} from "../lib/marketConfig";
import {
  Globe,
  BookOpen,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  HelpCircle
} from "lucide-react";

interface NavbarProps {
  country: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  isLearnMode: boolean;
  onToggleLearnMode: () => void;
  onOpenGlossary: (term?: string) => void;
  onOpenSavedScenarios: () => void;
  savedScenariosCount: number;
  onOpenTestRunner: () => void;
  allTestsPassed?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  country,
  onCountryChange,
  isLearnMode,
  onToggleLearnMode,
  onOpenGlossary,
  onOpenSavedScenarios,
  savedScenariosCount,
  onOpenTestRunner,
  allTestsPassed = true
}) => {
  const market = MARKETS[country];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-emerald-900/30">
      {/* Top micro-bar for jurisdiction and regulatory disclaimer */}
      <div className="bg-emerald-950/60 border-b border-emerald-800/20 px-4 py-1 text-xs text-emerald-200/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{market.tagline}</span>
          <span className="text-emerald-500/40">•</span>
          <span className="text-slate-400 hidden sm:inline">{market.jurisdiction}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={onOpenTestRunner}
            className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors cursor-pointer"
            title="Run Central Engine Validation Suite"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${allTestsPassed ? "text-emerald-400" : "text-amber-400"}`} />
            <span className="hidden md:inline">AAOIFI Math Verified</span>
          </button>
          <span className="text-emerald-500/40">•</span>
          <button
            onClick={() => onOpenGlossary()}
            className="flex items-center gap-1 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Islamic Terms Glossary</span>
          </button>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo & Entity Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-900 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <span className="font-serif font-black text-amber-300 text-xl tracking-tighter">N</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg text-slate-100 tracking-tight">NESTOPIA</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 tracking-wider">
                FINANCE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {market.company} <span className="text-emerald-400/80">({market.name})</span>
            </p>
          </div>
        </div>

        {/* Center & Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {/* Learn Mode / Calculator Mode Toggle */}
          <button
            onClick={onToggleLearnMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isLearnMode
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/20"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
            title="Toggle between Reference Example Mode and Custom Numbers"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isLearnMode ? "Learn Mode (Example)" : "Calculator Mode"}</span>
            <span className="sm:hidden">{isLearnMode ? "Learn" : "Calc"}</span>
          </button>

          {/* Country Switcher (UK / India) */}
          <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
            <button
              onClick={() => onCountryChange("UK")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                country === "UK"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Switch to United Kingdom (Nestopia Homes Limited • £ GBP)"
            >
              <span>🇬🇧</span>
              <span className="hidden md:inline">UK (£)</span>
            </button>
            <button
              onClick={() => onCountryChange("INDIA")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                country === "INDIA"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Switch to India (Nestopia Global Private Limited • ₹ INR)"
            >
              <span>🇮🇳</span>
              <span className="hidden md:inline">India (₹)</span>
            </button>
          </div>

          {/* Saved Scenarios */}
          <button
            onClick={onOpenSavedScenarios}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer relative"
            title="View or save simulations"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Saved</span>
            {savedScenariosCount > 0 && (
              <span className="bg-emerald-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {savedScenariosCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
