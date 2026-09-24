import React from "react";
import { FinancingModel, formatCurrency, formatPercentage } from "../lib/marketConfig";
import {
  MurabahaResult,
  DiminishingMusharakahResult,
  IjaraResult,
  CommercialMusharakahResult
} from "../types";
import { Check, ArrowRight, Layers, HelpCircle } from "lucide-react";

interface ComparisonMatrixProps {
  models: {
    murabahah: MurabahaResult;
    diminishingMusharakah: DiminishingMusharakahResult;
    ijarah: IjaraResult;
    musharakah: CommercialMusharakahResult;
  };
  currentModel: FinancingModel;
  onSelectModel: (model: FinancingModel) => void;
  onOpenGlossary: (term?: string) => void;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  models,
  currentModel,
  onSelectModel,
  onOpenGlossary
}) => {
  const country = models.murabahah.country;

  const modelList = [
    {
      key: "MURABAHAH" as FinancingModel,
      name: "Murabahah",
      arabic: "المرابحة",
      subtitle: "Cost-Plus Deferred Sale",
      data: models.murabahah,
      paymentLabel: "Fixed Installment",
      paymentValue: formatCurrency(models.murabahah.monthlyInstallment, country),
      profitOrRentLabel: "Agreed Disclosed Profit",
      profitOrRentValue: formatCurrency(models.murabahah.totalProfitPaid, country),
      totalPaid: formatCurrency(models.murabahah.totalCustomerCashOutflow, country),
      startOwn: `${models.murabahah.ownershipAtStart.customerPct}%`,
      endOwn: "100%",
      ownershipNature: "Transferred at sale conclusion with charge (Rahn)",
      riskProfile: "Financier bears constructive risk prior to sale resale"
    },
    {
      key: "DIMINISHING_MUSHARAKAH" as FinancingModel,
      name: "Diminishing Musharakah",
      arabic: "المشاركة المتناقصة",
      subtitle: "Co-Ownership & Equity Buyout",
      data: models.diminishingMusharakah,
      paymentLabel: "Starts High → Decreases",
      paymentValue: `${formatCurrency(models.diminishingMusharakah.monthlyPayment, country)} → ${formatCurrency(models.diminishingMusharakah.finalMonthlyPayment || 0, country)}`,
      profitOrRentLabel: "Total Rent for Usufruct",
      profitOrRentValue: formatCurrency(models.diminishingMusharakah.totalRentPaid, country),
      totalPaid: formatCurrency(models.diminishingMusharakah.totalCustomerCashOutflow, country),
      startOwn: `${models.diminishingMusharakah.ownershipAtStart.customerPct}%`,
      endOwn: "100%",
      ownershipNature: "Co-owners (Shirkat-ul-Milk); equity purchased each month",
      riskProfile: "Co-owners share major asset loss proportionally"
    },
    {
      key: "IJARAH" as FinancingModel,
      name: "Ijarah Muntahia Bittamleek",
      arabic: "الإجارة المنتهية بالتمليك",
      subtitle: "Lease with Title Transfer",
      data: models.ijarah,
      paymentLabel: "Starts High → Decreases",
      paymentValue: `${formatCurrency(models.ijarah.monthlyPayment, country)} → ${formatCurrency(models.ijarah.finalMonthlyPayment || 0, country)}`,
      profitOrRentLabel: "Total Lease Rent Paid",
      profitOrRentValue: formatCurrency(models.ijarah.totalRentPaid, country),
      totalPaid: formatCurrency(models.ijarah.totalCustomerCashOutflow, country),
      startOwn: `${models.ijarah.ownershipAtStart.customerPct}% (Deposit)`,
      endOwn: "100%",
      ownershipNature: "Lessor owns asset; lessee rents usufruct; separate title deed",
      riskProfile: "Lessor bears structural maintenance & Takaful"
    },
    {
      key: "MUSHARAKAH" as FinancingModel,
      name: "Commercial Musharakah",
      arabic: "شركة العقد التجارية",
      subtitle: "Commercial Asset Partnership",
      data: models.musharakah,
      paymentLabel: "Net Cashflow To You",
      paymentValue: `${formatCurrency(models.musharakah.customerMonthlyProfit, country)}/mo (Profit)`,
      profitOrRentLabel: "Total Cumulative Net Profit",
      profitOrRentValue: formatCurrency((models.musharakah as any).totalCustomerCumulativeProfit, country),
      totalPaid: formatCurrency(models.musharakah.customerContribution, country),
      startOwn: `${models.musharakah.customerContributionPct}%`,
      endOwn: `${models.musharakah.customerContributionPct}%`,
      ownershipNature: "Joint equity partnership (Shirkat-ul-'Aqd); capital stays invested",
      riskProfile: "Shared commercial revenue & capital risk"
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Side-by-Side Analysis
          </span>
          <h4 className="text-base font-serif font-bold text-slate-100 mt-1">
            Compare All 4 Islamic Structures
          </h4>
        </div>
        <p className="text-xs text-slate-400">
          Switch models instantly without losing your property numbers.
        </p>
      </div>

      {/* Side-by-Side Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-slate-950 text-slate-300 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 w-44">Feature / Metric</th>
              {modelList.map((m) => (
                <th
                  key={m.key}
                  className={`py-3 px-4 ${
                    currentModel === m.key
                      ? "bg-emerald-950/40 border-b-2 border-emerald-400 text-emerald-300"
                      : "text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{m.name}</p>
                      <p className="text-[10px] text-slate-400 font-serif italic">{m.arabic}</p>
                    </div>
                    {currentModel === m.key && (
                      <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
            {/* 1. Underlying Concept */}
            <tr>
              <td className="py-2.5 px-4 font-semibold text-slate-400">Contractual Concept</td>
              {modelList.map((m) => (
                <td key={m.key} className="py-2.5 px-4 text-slate-300 text-[11px]">
                  {m.subtitle}
                </td>
              ))}
            </tr>

            {/* 2. Monthly Payment / Distribution */}
            <tr>
              <td className="py-2.5 px-4 font-semibold text-slate-400">Monthly Cashflow</td>
              {modelList.map((m) => (
                <td key={m.key} className="py-2.5 px-4 font-bold text-slate-100">
                  {m.paymentValue}
                </td>
              ))}
            </tr>

            {/* 3. Total Profit or Rent Paid */}
            <tr>
              <td className="py-2.5 px-4 font-semibold text-slate-400">Total Profit / Rent</td>
              {modelList.map((m) => (
                <td key={m.key} className="py-2.5 px-4 text-teal-300 font-medium">
                  {m.profitOrRentValue}
                </td>
              ))}
            </tr>

            {/* 4. Total Cash Outflow */}
            <tr>
              <td className="py-2.5 px-4 font-semibold text-slate-400">Total Cash Outlay</td>
              {modelList.map((m) => (
                <td key={m.key} className="py-2.5 px-4 font-bold text-amber-300">
                  {m.totalPaid}
                </td>
              ))}
            </tr>

            {/* 5. Ownership at Start */}
            <tr>
              <td className="py-2.5 px-4 font-semibold text-slate-400">Your Ownership (Start)</td>
              {modelList.map((m) => (
                <td key={m.key} className="py-2.5 px-4 text-slate-300">
                  {m.startOwn}
                </td>
              ))}
            </tr>

            {/* 6. Ownership at Maturity */}
            <tr>
              <td className="py-2.5 px-4 font-semibold text-slate-400">Your Ownership (End)</td>
              {modelList.map((m) => (
                <td key={m.key} className="py-2.5 px-4 font-bold text-emerald-400">
                  {m.endOwn}
                </td>
              ))}
            </tr>

            {/* 7. Ownership Nature */}
            <tr>
              <td className="py-2.5 px-4 font-semibold text-slate-400">Ownership Mechanism</td>
              {modelList.map((m) => (
                <td key={m.key} className="py-2.5 px-4 text-slate-400 text-[11px] leading-tight">
                  {m.ownershipNature}
                </td>
              ))}
            </tr>

            {/* 8. Risk Allocation */}
            <tr>
              <td className="py-2.5 px-4 font-semibold text-slate-400">Risk Allocation</td>
              {modelList.map((m) => (
                <td key={m.key} className="py-2.5 px-4 text-slate-400 text-[11px] leading-tight">
                  {m.riskProfile}
                </td>
              ))}
            </tr>

            {/* Switch Action */}
            <tr className="bg-slate-950/80">
              <td className="py-3 px-4 font-semibold text-slate-300">Switch Simulation</td>
              {modelList.map((m) => (
                <td key={m.key} className="py-3 px-4">
                  {currentModel === m.key ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-xs">
                      <Check className="w-3.5 h-3.5" /> Currently Active
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectModel(m.key)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Select {m.name}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
