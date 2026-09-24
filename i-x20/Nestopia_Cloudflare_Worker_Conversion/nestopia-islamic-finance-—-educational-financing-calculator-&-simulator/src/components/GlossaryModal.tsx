import React, { useState } from "react";
import { GLOSSARY_TERMS, GlossaryTerm } from "../lib/glossary";
import { HelpCircle, Search, X, BookOpen, Sparkles, Filter } from "lucide-react";

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTerm?: string;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  initialTerm
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const termsList = Object.values(GLOSSARY_TERMS);

  const filteredTerms = termsList.filter((item) => {
    if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.term.toLowerCase().includes(q) ||
      (item.arabic && item.arabic.includes(q)) ||
      item.simpleDefinition.toLowerCase().includes(q) ||
      item.detailedExplanation.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-100">
                Islamic Finance Layperson Glossary
              </h3>
              <p className="text-xs text-slate-400">
                Clear, simple explanations without complex legal jargon.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search terms (e.g. Murabahah, Usufruct, Rent)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {["All", "Structure", "Legal Principle", "Financial Term", "Prohibition"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Terms List */}
        <div className="space-y-3 pt-2">
          {filteredTerms.map((item) => (
            <div
              key={item.term}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-100 text-sm">{item.term}</h4>
                  {item.arabic && (
                    <span className="text-xs text-amber-300 font-serif italic">
                      ({item.arabic})
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                  {item.category}
                </span>
              </div>

              {/* Simple Layperson Definition */}
              <p className="text-xs text-emerald-300 font-medium leading-relaxed bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/30">
                "{item.simpleDefinition}"
              </p>

              {/* Detailed Explanation */}
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.detailedExplanation}
              </p>

              {/* Real-World Example */}
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900 flex items-start gap-1.5">
                <strong className="text-slate-300 shrink-0">Example:</strong>
                <span>{item.example}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
