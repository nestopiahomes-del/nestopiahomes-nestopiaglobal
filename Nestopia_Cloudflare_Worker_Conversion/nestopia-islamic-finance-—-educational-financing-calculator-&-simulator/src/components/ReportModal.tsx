import React from "react";
import { AnyFinancingResult } from "../types";
import { formatCurrency, formatPercentage, MARKETS } from "../lib/marketConfig";
import { generateFinancingPDF } from "../lib/pdfGenerator";
import {
  FileText,
  Download,
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  Building,
  Calendar,
  Wallet
} from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnyFinancingResult;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  if (!isOpen) return null;

  const market = MARKETS[result.country];

  const handleDownload = () => {
    generateFinancingPDF(result);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-serif font-bold text-slate-100">
                Official Financing Simulation Report Preview
              </h3>
              <p className="text-xs text-slate-400">
                {market.company} • {result.modelName} • {market.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Sheet Preview */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-slate-950 text-slate-100 font-sans print:p-0 print:bg-white print:text-black">
          {/* Document Header Letterhead */}
          <div className="border-b border-emerald-900/40 pb-6 flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-serif font-black text-2xl text-amber-400 tracking-tight">
                  NESTOPIA
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  ISLAMIC FINANCE
                </span>
              </div>
              <h2 className="text-xl font-serif font-bold text-slate-100">
                {market.company}
              </h2>
              <p className="text-xs text-slate-400">{market.tagline}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                {market.registeredOffice} • {market.jurisdiction}
              </p>
            </div>

            <div className="text-right">
              <span className="text-3xl">{market.flag}</span>
              <p className="text-xs font-bold text-slate-300 mt-1">{market.name.toUpperCase()}</p>
              <p className="text-[11px] text-slate-500">Currency: {market.currency} ({market.symbol})</p>
            </div>
          </div>

          {/* Report Title & Selected Model */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Simulation Specification
            </span>
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <h1 className="text-2xl font-serif font-bold text-slate-100">
                {result.modelName.toUpperCase()} FINANCING SIMULATION
              </h1>
              <span className="text-sm font-serif italic text-amber-300">
                {result.modelArabicName}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{result.tagline}</p>
          </div>

          {/* Core Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-400">Property Value</span>
              <p className="text-base font-bold text-slate-100 mt-1">
                {formatCurrency(result.propertyValue, result.country)}
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-400">Your Initial Contribution</span>
              <p className="text-base font-bold text-amber-300 mt-1">
                {formatCurrency(result.customerContribution, result.country)} ({result.customerContributionPct}%)
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-400">Financier Capital</span>
              <p className="text-base font-bold text-emerald-400 mt-1">
                {formatCurrency(result.financierContribution, result.country)} ({result.financierContributionPct}%)
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-400">Financing Tenure</span>
              <p className="text-base font-bold text-slate-100 mt-1">
                {result.tenureYears} Years ({result.tenureMonths} Mo)
              </p>
            </div>
          </div>

          {/* Executive Totals */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Financial Totals & Cash Outlay
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Amount Financed by Financier:</span>
                <span className="font-semibold text-slate-200">
                  {formatCurrency(result.financierContribution, result.country)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">
                  {result.model === "MURABAHAH" ? "Agreed Disclosed Profit:" : "Total Rent Paid for Usufruct:"}
                </span>
                <span className="font-semibold text-teal-300">
                  {formatCurrency(
                    result.model === "MURABAHAH" ? result.totalProfitPaid : result.totalRentPaid,
                    result.country
                  )}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Total Financing Payments:</span>
                <span className="font-semibold text-slate-200">
                  {formatCurrency(result.totalFinancingPayments, result.country)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Your Initial Capital Contribution:</span>
                <span className="font-semibold text-slate-200">
                  {formatCurrency(result.customerContribution, result.country)}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold text-slate-100">
                <span className="text-emerald-400">TOTAL CASH OUTFLOW BY END OF TENURE:</span>
                <span className="text-amber-300">
                  {formatCurrency(result.totalCustomerCashOutflow, result.country)}
                </span>
              </div>
            </div>
          </div>

          {/* Educational Synopsis */}
          <div className="space-y-2 text-xs">
            <h4 className="font-serif font-bold text-sm text-slate-200">
              Contractual Architecture & What Just Happened
            </h4>
            <p className="text-slate-300 leading-relaxed">{result.whatHappened}</p>
          </div>

          {/* Shariah Principles Section */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif font-bold text-sm text-slate-200">
              AAOIFI Shariah Governance Principles
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.shariahPrinciples.map((p, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <p className="font-bold text-emerald-400">{p.title}</p>
                  <p className="text-slate-400 leading-relaxed text-[11px]">{p.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Disclaimers */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <p className="font-bold text-slate-300">Important Simulation Assumptions & Legal Disclaimers:</p>
            <p>• This report is an educational financial simulation and does not constitute a formal offer of finance or financing commitment.</p>
            <p>• Projected future property appreciation ({result.appreciationRate}% p.a.) is purely illustrative and not guaranteed.</p>
            <p>• Actual Islamic financing compliance depends upon final contracts, genuine asset acquisition, possession (Qabd), and approval by an independent Shariah board.</p>
            <p>• Users should consult qualified independent Shariah scholars and legal/financial advisors prior to entering into any transaction.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
