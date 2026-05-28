/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BudgetCategory } from "../types";
import { SEED_BUDGET_CATEGORIES, SEED_SUMMARY } from "../data";
import { 
  DollarSign, 
  Percent, 
  HelpCircle, 
  TrendingDown, 
  ShieldAlert, 
  FileText 
} from "lucide-react";

export const BudgetView: React.FC = () => {
  // Format money to USD string
  const formatUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Compute overall budget totals
  const totalBaseline = SEED_BUDGET_CATEGORIES.reduce((s, c) => s + c.baseline, 0);
  const totalTargetPrice = SEED_BUDGET_CATEGORIES.reduce((s, c) => s + c.targetPrice, 0);
  const totalSavingsLow = SEED_BUDGET_CATEGORIES.reduce((s, c) => s + c.savingsLow, 0);
  const totalSavingsHigh = SEED_BUDGET_CATEGORIES.reduce((s, c) => s + c.savingsHigh, 0);
  
  const targetGapPercent = ((totalBaseline - totalTargetPrice) / totalBaseline) * 100;

  return (
    <div className="space-y-6" id="budget-view-control">
      
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 flex flex-wrap justify-between items-center gap-4" id="budget-view-header">
        <div>
          <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">SOV Buyout & Budget Engineering Strategy</h2>
          <p className="text-xs text-slate-500 mt-1">
            Analyzing commercial optimization opportunities and target thresholds across 13 major build packages.
          </p>
        </div>
        <div className="flex gap-3 text-xs bg-slate-50 p-3 rounded-sm border border-slate-150 font-mono">
          <div>
            <span className="block text-[9px] text-slate-400 uppercase font-bold">Max Variance Target Option</span>
            <span className="text-slate-900 font-bold text-[13px]">{formatUSD(SEED_SUMMARY.targetHigh)}</span>
          </div>
          <div className="w-px bg-slate-200" />
          <div>
            <span className="block text-[9px] text-slate-400 uppercase font-bold">Min Variance Target Option</span>
            <span className="text-slate-950 font-bold text-[13px]">{formatUSD(SEED_SUMMARY.targetLow)}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip: 4-column, gapless, border panels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-slate-200 bg-white rounded-sm overflow-hidden" id="budget-view-kpis">
        <div className="p-4 border-r border-slate-150 last:border-r-0">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Baseline cost</p>
          <p className="text-xl font-bold font-mono mt-1 text-slate-900">{formatUSD(totalBaseline)}</p>
          <span className="text-[9px] text-slate-400 block mt-0.5 font-medium uppercase">Current SOV Proposed Sum</span>
        </div>
        <div className="p-4 border-r border-slate-150 last:border-r-0">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Strategic Buyout Goal</p>
          <p className="text-xl font-bold font-mono mt-1 text-teal-605 text-teal-600">{formatUSD(totalTargetPrice)}</p>
          <span className="text-[9px] text-teal-600 font-semibold block mt-0.5 uppercase">Lower limit reduction goal</span>
        </div>
        <div className="p-4 border-r border-slate-150 last:border-r-0">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Minimum Target Savings</p>
          <p className="text-xl font-bold font-mono mt-1 text-slate-900">{formatUSD(totalSavingsLow)}</p>
          <span className="text-[9px] text-slate-400 block mt-0.5 uppercase">-{((totalSavingsLow/totalBaseline)*100).toFixed(1)}% threshold</span>
        </div>
        <div className="p-4 bg-blue-50/20 last:border-r-0">
          <p className="text-[10px] uppercase font-bold text-slate-550 text-blue-600 tracking-wider">Maximum Target Savings</p>
          <p className="text-xl font-bold font-mono mt-1 text-blue-600">{formatUSD(totalSavingsHigh)}</p>
          <span className="text-[9px] text-blue-600 font-bold block mt-0.5 uppercase">-{((totalSavingsHigh/totalBaseline)*100).toFixed(1)}% headroom</span>
        </div>
      </div>

      {/* Main Budget Categories Control Table */}
      <div className="bg-white rounded-sm border border-slate-200 overflow-hidden" id="budget-main-table-container">
        <div className="p-4 border-b border-slate-150 bg-slate-50/50 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-800 tracking-wider uppercase text-[10px]">Baseline SOV vs Target Limits</span>
          <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">13 Categories Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 font-mono tracking-wider border-b border-slate-150 uppercase text-[9px]">
                <th className="py-2.5 px-4">Section / Package</th>
                <th className="py-3 px-4">Baseline (SOV)</th>
                <th className="py-3 px-4">Target buyout Limit</th>
                <th className="py-3 px-4">Savings Window (Low - High)</th>
                <th className="py-3 px-4 text-center">Variance Limit Tracker</th>
                <th className="py-3 px-4 hidden xl:table-cell">Procurement / Value Engineering Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SEED_BUDGET_CATEGORIES.map((cat) => {
                const savingLowPct = ((cat.savingsLow / cat.baseline) * 100).toFixed(1);
                const savingHighPct = ((cat.savingsHigh / cat.baseline) * 100).toFixed(1);
                const savingTargetPct = (((cat.baseline - cat.targetPrice) / cat.baseline) * 100).toFixed(1);
                
                return (
                  <tr key={cat.package} className="hover:bg-slate-50/55 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="block font-bold text-slate-800 text-xs">{cat.package}</span>
                      <span className="inline-block bg-slate-100 text-slate-600 px-1.5 py-0.25 rounded text-[9px] font-medium tracking-wide uppercase mt-0.5">
                        {cat.section}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{formatUSD(cat.baseline)}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-600 font-semibold">{formatUSD(cat.targetPrice)}</td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="block font-mono font-semibold text-slate-700">
                          {formatUSD(cat.savingsLow)} - {formatUSD(cat.savingsHigh)}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {savingLowPct}% - {savingHighPct}% optimized
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[140px]">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span>Target Reduct:</span>
                          <span className="text-emerald-600 font-bold">-{savingTargetPct}%</span>
                        </div>
                        {/* Custom comparative bar */}
                        <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          {/* target value scale width */}
                          <div className="absolute top-0 left-0 bg-blue-600 h-full rounded-l" style={{ width: `${(cat.targetPrice / cat.baseline) * 100}%` }} />
                          {/* potential max savings highlight */}
                          <div className="absolute top-0 h-full bg-emerald-500" style={{
                            left: `${(cat.targetPrice / cat.baseline) * 100}%`,
                            width: `${((cat.baseline - cat.targetPrice) / cat.baseline) * 100}%`
                          }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 leading-relaxed text-xs hidden xl:table-cell max-w-[280px]">
                      {cat.strategy}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commercial Levers / Value Engineering Panel */}
      <div className="bg-slate-900 text-white rounded-sm border border-slate-800 p-5 relative overflow-hidden" id="commercial-levers-panel">
        <div className="absolute top-0 right-0 p-8 text-slate-800/20 translate-x-8 -translate-y-8 pointer-events-none">
          <ShieldAlert className="h-44 w-44" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-600/20 text-blue-400 p-1 rounded-md">
              <TrendingDown className="h-5 w-5" />
            </span>
            <h3 className="text-sm font-bold tracking-wider uppercase text-slate-200">
              GC Commercial Reduction Strategy & Value Engineering Levers
            </h3>
          </div>
          
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            To bridges the <strong className="text-rose-400">{formatUSD(SEED_SUMMARY.budgetGap)}</strong> budget excess gap, the project team must execute owner-direct purchase bypasses, coordinate scope segregation, and negotiate competitive commercial terms with suppliers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2" id="levers-leverage-columns">
            <div className="bg-slate-950/40 border border-slate-800/70 rounded-sm p-4 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">1. Owner-Direct Materials Bypass</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                By purchasing allowance items (such as the <strong className="text-slate-200">Ferguson Bath & Cabinetry package</strong>) directly from vendors under owner credentials, we bypass standard General Contractor overhead and profit (O&P) markups, creating an immediate savings headroom.
              </p>
            </div>
            
            <div className="bg-slate-950/40 border border-slate-800/70 rounded-sm p-4 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">2. Trade Scope Separation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Separate structural lumber packages from framing labor, plumbing fixtures from piping, and roofing systems from window framing. This prevents general builder markups and targets local subcontractors on concrete hardscapes directly.
              </p>
            </div>

            <div className="bg-slate-950/40 border border-slate-800/70 rounded-sm p-4 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">3. Wind-Load & Coastal Spec Audit</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Investigate exact coastal building codes in Stone Harbor. Optimize custom window sizing, composite rail structures, and structural steel thicknesses to prevent over-design based on non-localized assumptions.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
