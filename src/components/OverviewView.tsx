/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Rfq, Milestone, ActionItem } from "../types";
import { SEED_SUMMARY, SEED_BUDGET_CATEGORIES } from "../data";
import { 
  Building2, 
  TrendingDown, 
  DollarSign, 
  Layers, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  ArrowRight
} from "lucide-react";

interface OverviewViewProps {
  rfqs: Rfq[];
  milestones: Milestone[];
  actions: ActionItem[];
  onUpdateActionStatus: (id: string, status: any) => void;
  onNavigateToView: (view: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  rfqs,
  milestones,
  actions,
  onUpdateActionStatus,
  onNavigateToView
}) => {
  // Calculated stats based on state
  const totalBidsReceived = rfqs.filter(r => r.bidAmount !== "").length;
  const committedTotal = rfqs
    .filter(r => r.status === "Awarded" && typeof r.bidAmount === "number")
    .reduce((sum, r) => sum + (r.bidAmount as number), 0);

  const activeBids = rfqs.filter(r => typeof r.bidAmount === "number" && r.status === "Evaluating");
  
  // High Priority alerts
  const criticalLeadItemsCount = milestones.filter(m => m.status === "At risk").length;
  const budgetGap = SEED_SUMMARY.budgetGap;

  // Let's format money to USD string
  const formatUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6" id="overview-view-container">
      {/* Project Status Strip */}
      <div className="bg-[#0f172a] text-white rounded-sm p-4 flex flex-wrap items-center justify-between gap-4 border border-[#1e293b]" id="project-status-strip">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600/20 text-blue-400 p-2 rounded-sm border border-slate-700/40">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-widest text-white uppercase">PROJECT SOV CONTROL</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">11200 2nd Ave, Stone Harbor • Phase: <span className="text-blue-400">{SEED_SUMMARY.phase}</span></p>
          </div>
        </div>
        <div className="flex items-center space-x-6 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Last Synchronization</span>
            <span className="text-emerald-400 font-medium">{SEED_SUMMARY.lastUpdated}</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Active RFQ Pipeline</span>
            <span className="text-blue-400 font-medium">{rfqs.length} Scope Packages</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Target Buyout Status</span>
            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-sm text-[11px] font-semibold border border-emerald-500/20">PRE-CON</span>
          </div>
        </div>
      </div>

      {/* Technical KPI Strip: 5-column, zero gap, sharp technical design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0 border border-slate-200 bg-white rounded-sm overflow-hidden" id="kpi-cards-grid">
        {/* KPI 1: Current SOV */}
        <div className="p-4 border-r border-slate-150 last:border-r-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current SOV</p>
          <p className="text-xl font-mono text-slate-900 font-bold mt-1">{formatUSD(SEED_SUMMARY.currentSov)}</p>
          <span className="text-[9px] text-slate-400 uppercase mt-0.5 block">Proposed cost base</span>
        </div>

        {/* KPI 2: Budget Gap */}
        <div className="p-4 border-r border-slate-150 last:border-r-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Budget Gap</p>
          <p className="text-xl font-mono text-red-600 font-bold mt-1">{formatUSD(budgetGap)}</p>
          <span className="text-[9px] text-red-500 font-medium uppercase mt-0.5 block flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Above target allowance
          </span>
        </div>

        {/* KPI 3: Target savings */}
        <div className="p-4 border-r border-slate-150 last:border-r-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Savings</p>
          <p className="text-xl font-mono mt-1 text-teal-600 font-bold">
            {formatUSD(SEED_SUMMARY.savingsLow)} - {formatUSD(SEED_SUMMARY.savingsHigh)}
          </p>
          <span className="text-[9px] text-emerald-600 font-medium uppercase mt-0.5 block">Leverage capability</span>
        </div>

        {/* KPI 4: RFQs bids count */}
        <div className="p-4 border-r border-slate-150 last:border-r-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Open RFQs</p>
          <p className="text-xl font-mono text-slate-900 font-bold mt-1">19</p>
          <span className="text-[9px] text-slate-400 mt-0.5 block lowercase">
            bids rec'd: {totalBidsReceived} / committed: {formatUSD(committedTotal)}
          </span>
        </div>

        {/* KPI 5: Critical lead time items */}
        <div className="p-4 bg-orange-50/50 last:border-r-0">
          <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Critical Lead Items</p>
          <p className="text-xl font-mono text-orange-600 font-bold mt-1">{criticalLeadItemsCount}</p>
          <span className="text-[9px] text-orange-500 uppercase mt-0.5 block">Items requiring lock</span>
        </div>
      </div>

      {/* Main Content Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="overview-layouts-grid">
        
        {/* Left Side: Budget Concentration & RFQ Tracker Status */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Budget Breakdown Summary */}
          <div className="bg-white rounded-sm border border-slate-200 p-5" id="budget-concentration-summary">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Budget Allocation Strategy</h3>
                <p className="text-xs text-slate-500">Baseline Budget (SOV) vs Target Buyout Goal</p>
              </div>
              <button 
                onClick={() => onNavigateToView("budget")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                id="btn-goto-budget"
              >
                Detailed Budget <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* List the top 5 largest budget categories */}
            <div className="space-y-4">
              {SEED_BUDGET_CATEGORIES.slice(0, 5).map((cat) => {
                const percentOfTotal = (cat.baseline / SEED_SUMMARY.currentSov) * 100;
                const savingsPct = ((cat.baseline - cat.targetPrice) / cat.baseline) * 100;
                return (
                  <div key={cat.package} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{cat.package}</span>
                      <span className="font-mono text-slate-500">
                        {formatUSD(cat.baseline)} → <span className="text-emerald-600 font-bold">{formatUSD(cat.targetPrice)}</span> ({percentOfTotal.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="relative w-full h-2.5 bg-slate-100 rounded-sm overflow-hidden">
                      {/* Baseline scale */}
                      <div className="absolute top-0 left-0 bg-slate-300 h-full rounded-sm" style={{ width: `${Math.min(100, (cat.baseline / 644500) * 100)}%` }} />
                      {/* Target scale */}
                      <div className="absolute top-0 left-0 bg-blue-600 h-full rounded-sm" style={{ width: `${Math.min(100, (cat.targetPrice / 644500) * 100)}%` }} />
                      {/* Highlight saving section */}
                      <div className="absolute top-0 h-full bg-emerald-500" style={{ 
                        left: `${Math.min(100, (cat.targetPrice / 644500) * 100)}%`,
                        width: `${Math.max(0, ((cat.baseline - cat.targetPrice) / 644500) * 100)}%`
                      }} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Leverage Strategy: {cat.strategy.slice(0, 60)}...</span>
                      <span className="text-emerald-600 font-medium font-mono">-{savingsPct.toFixed(1)}% limit</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Bids Comparison Table */}
          <div className="bg-white rounded-sm border border-slate-200 p-5" id="quote-comparison-widget">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Evaluating Active Quotes</h3>
                <p className="text-xs text-slate-500">Currently active bids received to audit</p>
              </div>
              <button 
                onClick={() => onNavigateToView("rfqs")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                id="btn-goto-rfqs"
              >
                Review All 19 RFQs <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {activeBids.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-sm text-slate-500 text-xs">
                No active evaluating bids currently. Please edit bid amounts in the RFQ view to begin testing.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-150 font-mono text-[9px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Package / Vendor</th>
                      <th className="py-2.5 px-3">Bid Amount</th>
                      <th className="py-2.5 px-3">Package Target</th>
                      <th className="py-2.5 px-3">Delta vs Target</th>
                      <th className="py-2.5 px-3 text-right">Lead Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {activeBids.slice(0, 5).map((bid) => {
                      const delta = Number(bid.bidAmount) - bid.targetPrice;
                      const isFavorable = delta <= 0;
                      return (
                        <tr key={bid.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2 px-3">
                            <span className="block font-semibold text-slate-800">{bid.vendor}</span>
                            <span className="block text-[10px] text-slate-500 font-mono">{bid.package}</span>
                          </td>
                          <td className="py-2 px-3 font-mono font-medium text-slate-900">
                            {formatUSD(Number(bid.bidAmount))}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-500">
                            {formatUSD(bid.targetPrice)}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`inline-block font-mono font-bold px-1.5 py-0.5 rounded-sm text-[10px] ${isFavorable ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"}`}>
                              {isFavorable ? "" : "+"}{formatUSD(delta)}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right text-slate-500 font-mono text-[11px]">{bid.leadTime || "N/A"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Decisions Queue & Timeline Summary */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Decisions & Actions Queue */}
          <div className="bg-white rounded-sm border border-slate-200 p-5" id="decisions-actions-widget">
            <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase mb-1">Decisions & Actions Queue</h3>
            <p className="text-xs text-slate-500 mb-4">Urgent pre-con deliverables needing sign-off</p>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {actions.map((action) => (
                <div 
                  key={action.id} 
                  className={`p-3 rounded-sm border text-xs flex flex-col transition-colors ${
                    action.status === "Complete" 
                      ? "bg-slate-50/50 border-slate-100 opacity-65" 
                      : action.priority === "High"
                        ? "bg-amber-50/50 border-amber-200/60"
                        : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        checked={action.status === "Complete"}
                        onChange={(e) => onUpdateActionStatus(action.id, e.target.checked ? "Complete" : "Open")}
                        className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`font-semibold ${action.status === "Complete" ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {action.item}
                      </span>
                    </div>
                    <span className={`px-1.5 py-0.25 rounded text-[9px] font-semibold uppercase ${
                      action.type === "Decision" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {action.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 pt-2 border-t border-dotted border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span>Owner: <strong className="text-slate-700">{action.owner}</strong></span>
                      <span>•</span>
                      <span>Due: <strong className="text-slate-700 font-mono">{action.dueDate}</strong></span>
                    </div>
                    <div>
                      <select
                        value={action.status}
                        onChange={(e) => onUpdateActionStatus(action.id, e.target.value as any)}
                        className="bg-transparent border-0 text-[10px] font-semibold text-blue-600 focus:ring-0 cursor-pointer p-0"
                      >
                        <option value="Open">Open</option>
                        <option value="In progress">In Progress</option>
                        <option value="Complete">Complete</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Milestone Summary */}
          <div className="bg-white rounded-sm border border-slate-200 p-5" id="schedule-milestones-widget">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Schedule Milestones</h3>
              <button 
                onClick={() => onNavigateToView("schedule")}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                id="btn-goto-schedule"
              >
                Full Calendar <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-4">
              {milestones.slice(0, 4).map((m) => {
                const isAtRisk = m.status === "At risk";
                const isBlocked = m.status === "Blocked";
                const isComplete = m.status === "Complete";
                
                return (
                  <div key={m.id} className="relative flex items-start space-x-3 text-xs pl-2">
                    {/* timeline node icon */}
                    <div className="absolute top-1 left-0 -ml-1 flex items-center justify-center">
                      <div className={`h-2 w-2 rounded-full ring-4 ${
                        isComplete 
                          ? "bg-slate-300 ring-slate-100" 
                          : isBlocked
                            ? "bg-rose-500 ring-rose-100 animate-pulse-warning"
                            : isAtRisk
                              ? "bg-amber-500 ring-amber-100 animate-pulse-warning"
                              : "bg-blue-600 ring-blue-100"
                      }`} />
                    </div>
                    
                    <div className="flex-1 pl-4">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${isComplete ? "text-slate-400 line-through" : "text-slate-800"}`}>
                          {m.name}
                        </span>
                        <span className={`font-mono text-[10px] ${isComplete ? "text-slate-400" : "text-slate-500"}`}>
                          {m.start}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{m.notes}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
