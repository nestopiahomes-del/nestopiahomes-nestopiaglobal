import React, { useState } from "react";
import { AnyFinancingResult } from "../types";
import { formatCurrency, formatPercentage } from "../lib/marketConfig";
import {
  TrendingUp,
  PieChart,
  DollarSign,
  Activity,
  Layers,
  ArrowUpRight
} from "lucide-react";

interface FinancialChartsProps {
  result: AnyFinancingResult;
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<"ownership" | "payment" | "capital" | "appreciation" | "commercial">(
    "ownership"
  );

  const isCommercial = result.model === "MUSHARAKAH";
  const yearly = result.yearlySummary;
  const maxYear = result.tenureYears;

  // Chart dimensions
  const width = 640;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // X-scale
  const getX = (year: number) => padding.left + (year / maxYear) * chartW;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      {/* Chart Header & Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Interactive Visual Analytics
          </span>
          <h4 className="text-base font-serif font-bold text-slate-100 mt-1">
            Visual Financial Journey
          </h4>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 flex-wrap">
          <button
            onClick={() => setActiveTab("ownership")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "ownership"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Ownership Equity
          </button>

          {!isCommercial && (
            <button
              onClick={() => setActiveTab("payment")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "payment"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Payment Journey
            </button>
          )}

          {!isCommercial && (
            <button
              onClick={() => setActiveTab("capital")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "capital"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Remaining Capital
            </button>
          )}

          <button
            onClick={() => setActiveTab("appreciation")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "appreciation"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Property Value
          </button>

          {isCommercial && (
            <button
              onClick={() => setActiveTab("commercial")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "commercial"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Commercial Profit
            </button>
          )}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[300px] select-none"
        >
          <defs>
            <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="amberGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padding.top + pct * chartH;
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.7"
                  strokeDasharray="4 4"
                />
              </g>
            );
          })}

          {/* TAB 1: OWNERSHIP (Customer Ownership % vs Investor Ownership %) */}
          {activeTab === "ownership" && (
            <>
              {/* Y-axis labels: 0% to 100% */}
              {[100, 75, 50, 25, 0].map((val, idx) => (
                <text
                  key={val}
                  x={padding.left - 8}
                  y={padding.top + (idx / 4) * chartH + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="end"
                >
                  {val}%
                </text>
              ))}

              {/* Customer Curve (Green) */}
              {(() => {
                const points = [
                  { x: getX(0), y: padding.top + (1 - result.ownershipAtStart.customerPct / 100) * chartH },
                  ...yearly.map((r) => ({
                    x: getX(r.year),
                    y: padding.top + (1 - r.customerOwnershipPct / 100) * chartH
                  }))
                ];

                const pathD = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

                return (
                  <>
                    <path d={areaD} fill="url(#emeraldGrad)" />
                    <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" />
                    {points.map((p, idx) => (
                      <circle key={idx} cx={p.x} cy={p.y} r="3" fill="#10b981" stroke="#0f172a" strokeWidth="1.5" />
                    ))}
                  </>
                );
              })()}

              {/* Investor Curve (Slate/Grey) */}
              {(() => {
                const points = [
                  { x: getX(0), y: padding.top + (1 - result.ownershipAtStart.investorPct / 100) * chartH },
                  ...yearly.map((r) => ({
                    x: getX(r.year),
                    y: padding.top + (1 - r.investorOwnershipPct / 100) * chartH
                  }))
                ];

                const pathD = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

                return (
                  <>
                    <path d={pathD} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5 3" />
                  </>
                );
              })()}
            </>
          )}

          {/* TAB 2: PAYMENT JOURNEY (Monthly Installment trajectory) */}
          {activeTab === "payment" && !isCommercial && (
            <>
              {(() => {
                const firstMonthPay = result.monthlyPayment;
                const finalMonthPay = result.finalMonthlyPayment || firstMonthPay;
                const maxPay = Math.max(firstMonthPay, finalMonthPay) * 1.15;

                const getY = (amount: number) => padding.top + (1 - amount / maxPay) * chartH;

                const points = yearly.map((r) => {
                  const mRow = result.monthlySchedule.find((m) => m.month === r.year * 12) || result.monthlySchedule[result.monthlySchedule.length - 1];
                  return {
                    x: getX(r.year),
                    y: getY(mRow.totalPayment)
                  };
                });

                const pathD = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

                return (
                  <>
                    {[maxPay, maxPay * 0.66, maxPay * 0.33, 0].map((val, idx) => (
                      <text
                        key={idx}
                        x={padding.left - 8}
                        y={padding.top + (idx / 3) * chartH + 4}
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="end"
                      >
                        {formatCurrency(val, result.country)}
                      </text>
                    ))}
                    <path d={areaD} fill="url(#amberGrad)" />
                    <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                    {points.map((p, idx) => (
                      <circle key={idx} cx={p.x} cy={p.y} r="3" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.5" />
                    ))}
                  </>
                );
              })()}
            </>
          )}

          {/* TAB 3: REMAINING FINANCIER CAPITAL */}
          {activeTab === "capital" && !isCommercial && (
            <>
              {(() => {
                const maxCap = result.financierContribution * 1.05;
                const getY = (val: number) => padding.top + (1 - val / maxCap) * chartH;

                const points = [
                  { x: getX(0), y: getY(result.financierContribution) },
                  ...yearly.map((r) => ({
                    x: getX(r.year),
                    y: getY(r.remainingFinancing)
                  }))
                ];

                const pathD = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

                return (
                  <>
                    {[maxCap, maxCap * 0.66, maxCap * 0.33, 0].map((val, idx) => (
                      <text
                        key={idx}
                        x={padding.left - 8}
                        y={padding.top + (idx / 3) * chartH + 4}
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="end"
                      >
                        {formatCurrency(val, result.country)}
                      </text>
                    ))}
                    <path d={areaD} fill="url(#emeraldGrad)" />
                    <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" />
                    {points.map((p, idx) => (
                      <circle key={idx} cx={p.x} cy={p.y} r="3" fill="#10b981" stroke="#0f172a" strokeWidth="1.5" />
                    ))}
                  </>
                );
              })()}
            </>
          )}

          {/* TAB 4: PROPERTY VALUE & APPRECIATION */}
          {activeTab === "appreciation" && (
            <>
              {(() => {
                const maxVal = Math.max(result.propertyValue, result.estimatedFuturePropertyValue) * 1.1;
                const getY = (val: number) => padding.top + (1 - val / maxVal) * chartH;

                const points = [
                  { x: getX(0), y: getY(result.propertyValue) },
                  ...yearly.map((r) => ({
                    x: getX(r.year),
                    y: getY(r.estimatedPropertyValue)
                  }))
                ];

                const pathD = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

                return (
                  <>
                    {[maxVal, maxVal * 0.66, maxVal * 0.33, 0].map((val, idx) => (
                      <text
                        key={idx}
                        x={padding.left - 8}
                        y={padding.top + (idx / 3) * chartH + 4}
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="end"
                      >
                        {formatCurrency(val, result.country)}
                      </text>
                    ))}
                    {/* Baseline flat original property line */}
                    <line
                      x1={padding.left}
                      y1={getY(result.propertyValue)}
                      x2={width - padding.right}
                      y2={getY(result.propertyValue)}
                      stroke="#64748b"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <path d={areaD} fill="url(#emeraldGrad)" />
                    <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" />
                    {points.map((p, idx) => (
                      <circle key={idx} cx={p.x} cy={p.y} r="3" fill="#10b981" stroke="#0f172a" strokeWidth="1.5" />
                    ))}
                  </>
                );
              })()}
            </>
          )}

          {/* TAB 5: COMMERCIAL CASHFLOWS (for Musharakah) */}
          {activeTab === "commercial" && isCommercial && (
            <>
              {(() => {
                const commRes = result as any;
                const maxAnnual = commRes.annualGrossIncome * 1.15;
                const getY = (val: number) => padding.top + (1 - val / maxAnnual) * chartH;

                const pointsGross = yearly.map((r) => ({ x: getX(r.year), y: getY(r.annualGrossIncome || 0) }));
                const pointsNet = yearly.map((r) => ({ x: getX(r.year), y: getY(r.annualNetProfit || 0) }));
                const pointsCust = yearly.map((r) => ({ x: getX(r.year), y: getY(r.customerAnnualProfit || 0) }));

                return (
                  <>
                    {[maxAnnual, maxAnnual * 0.66, maxAnnual * 0.33, 0].map((val, idx) => (
                      <text
                        key={idx}
                        x={padding.left - 8}
                        y={padding.top + (idx / 3) * chartH + 4}
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="end"
                      >
                        {formatCurrency(val, result.country)}
                      </text>
                    ))}
                    {/* Gross revenue (blue/indigo) */}
                    <path
                      d={pointsGross.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="2"
                    />
                    {/* Net profit (teal) */}
                    <path
                      d={pointsNet.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                      fill="none"
                      stroke="#2dd4bf"
                      strokeWidth="2"
                    />
                    {/* Partner share (emerald) */}
                    <path
                      d={pointsCust.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                  </>
                );
              })()}
            </>
          )}

          {/* X-axis year ticks */}
          {[0, Math.round(maxYear * 0.25), Math.round(maxYear * 0.5), Math.round(maxYear * 0.75), maxYear].map(
            (yr) => (
              <g key={yr}>
                <line
                  x1={getX(yr)}
                  y1={padding.top + chartH}
                  x2={getX(yr)}
                  y2={padding.top + chartH + 5}
                  stroke="#64748b"
                  strokeWidth="1"
                />
                <text
                  x={getX(yr)}
                  y={padding.top + chartH + 18}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {yr === 0 ? "Start" : `Yr ${yr}`}
                </text>
              </g>
            )
          )}
        </svg>
      </div>

      {/* Chart Legend & Context Description */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          {activeTab === "ownership" && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300 font-medium">Your Ownership % (Increases to 100%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-500" />
                <span className="text-slate-400">Financier Stake % (Decreases to 0%)</span>
              </div>
            </>
          )}

          {activeTab === "payment" && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-slate-300 font-medium">Monthly Installment / Rental Payment Trajectory</span>
            </div>
          )}

          {activeTab === "capital" && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300 font-medium">Financier Capital Balance Amortization</span>
            </div>
          )}

          {activeTab === "appreciation" && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300 font-medium">
                  Illustrative Future Property Value (+{result.appreciationRate}% p.a.)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 border-t border-dashed border-slate-400" />
                <span className="text-slate-400">Original Baseline Purchase Value</span>
              </div>
            </>
          )}

          {activeTab === "commercial" && isCommercial && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-indigo-400" />
                <span className="text-slate-300">Gross Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-teal-400" />
                <span className="text-slate-300">Net Distributable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300 font-medium">Your Annual Profit Share</span>
              </div>
            </>
          )}
        </div>

        <span className="text-[11px] text-slate-500 italic">
          Dynamic calculation based on your live inputs
        </span>
      </div>
    </div>
  );
};
