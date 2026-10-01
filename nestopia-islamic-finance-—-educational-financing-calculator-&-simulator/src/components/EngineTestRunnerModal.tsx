import React, { useState } from "react";
import { runAllEngineVerificationTests, TestResult } from "../lib/engineTests";
import { CheckCircle2, XCircle, RotateCcw, X, ShieldCheck, Cpu } from "lucide-react";

interface EngineTestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EngineTestRunnerModal: React.FC<EngineTestRunnerModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [testSuite, setTestSuite] = useState(runAllEngineVerificationTests());

  const handleRerun = () => {
    setTestSuite(runAllEngineVerificationTests());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-100">
                Central Islamic Finance Engine Tests
              </h3>
              <p className="text-xs text-slate-400">
                Automated AAOIFI mathematical verification test suite (Section 58)
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

        {/* Global Test Status Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
            testSuite.allPassed
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/40 border-rose-500/40 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {testSuite.allPassed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            <div>
              <p className="font-bold text-sm">
                {testSuite.allPassed
                  ? "All 4 Shariah Reference Test Scenarios Passed (100% Accuracy)"
                  : "Some Tests Failed"}
              </p>
              <p className="text-xs opacity-80">
                Verified Murabahah cost-plus markup, Diminishing Musharakah buyout & rent reconciliation, Ijarah amortization, and Musharakah profit/loss ratios.
              </p>
            </div>
          </div>

          <button
            onClick={handleRerun}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rerun Tests</span>
          </button>
        </div>

        {/* Test Cases List */}
        <div className="space-y-3">
          {testSuite.results.map((test, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  {test.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  {test.testName}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    test.passed
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {test.passed ? "PASSED" : "FAILED"}
                </span>
              </div>

              <p className="text-slate-400 leading-relaxed">{test.notes}</p>

              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <div>
                  <span className="text-slate-500">Expected: </span>
                  <span>{JSON.stringify(test.expected)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Actual: </span>
                  <span className="text-emerald-400">{JSON.stringify(test.actual)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
