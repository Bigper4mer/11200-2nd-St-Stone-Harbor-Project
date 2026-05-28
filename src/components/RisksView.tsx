/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from "react";
import { AlertOctagon, AlertTriangle, ShieldCheck, Info, User, ShieldAlert } from "lucide-react";
import { SEED_SUMMARY } from "../data";

export const RisksView: React.FC = () => {
  const riskRegister = [
    {
      issue: "Budget bridge unresolved gap",
      owner: "GC Team / Estimator",
      severity: "CRITICAL",
      status: "OPEN",
      mitigation: "Negotiate material breakdowns with sub-bidders and recommend direct owner buyout for allowancing to shave off GC markups."
    },
    {
      issue: "Critical lead items not locked",
      owner: "PM / Owner Representative",
      severity: "HIGH",
      status: "AT RISK",
      mitigation: "Submit approved architectural drawings to Ferguson Showroom and Cabinet Co. to lock down delivery calendar queues before early June."
    },
    {
      issue: "Open RFQs without active bids",
      owner: "Main Estimator",
      severity: "MEDIUM",
      status: "ACTIVE IN BOX",
      mitigation: "Contact local alternative subcontractors (e.g. Shiplap Solutions, Reliable Plumbing) to obtain comparison bid pricing by June 2."
    },
    {
      issue: "Allowance O&P markup exposure",
      owner: "Commercial Advisor",
      severity: "HIGH",
      status: "EVALUATING",
      mitigation: "Implement Owner-Direct Material Purchases bypass contract rider to limit general contractor overhead margin on luxury appliances."
    },
    {
      issue: "Schedule milestone drift risk",
      owner: "Site Marshall / PM",
      severity: "MEDIUM",
      status: "EVALUATING",
      mitigation: "Coordinate trade handoffs in sequence (Masonry foundation → Structural framing → Composite Roofing) with early buyout clauses."
    }
  ];

  return (
    <div className="space-y-6" id="risks-view-container">
      
      {/* Header element */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4" id="risks-view-header">
        <div>
          <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">Project Risk Register & Audit controls</h2>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile financial, schedule, procurement of long-lead, and construction safety exposures.
          </p>
        </div>
        
        <div className="bg-rose-50 text-[10px] tracking-wider font-bold text-rose-700 px-3 py-2 rounded-sm border border-rose-150 uppercase flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-600 animate-pulse" />
          <span>{riskRegister.length} Active Material Exposure Risks</span>
        </div>
      </div>

      {/* Exposure Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-200 bg-white rounded-sm overflow-hidden" id="exposure-cards-summary">
        <div className="p-4 border-b md:border-b-0 md:border-r border-slate-150 last:border-r-0 flex items-start space-x-3">
          <div className="bg-rose-50 p-2 rounded-sm text-rose-600 shrink-0 border border-rose-100">
            <AlertOctagon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">1. Financial Exposure Limit</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              We face a <strong className="text-rose-600 font-mono">${SEED_SUMMARY.budgetGap.toLocaleString()}</strong> buyout gap that must be bridge-reconciled within 7 business days to commence early foundation site preparation.
            </p>
          </div>
        </div>

        <div className="p-4 border-b md:border-b-0 md:border-r border-slate-150 last:border-r-0 flex items-start space-x-3">
          <div className="bg-amber-50 p-2 rounded-sm text-amber-600 shrink-0 border border-amber-100">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">2. Supply Chain Lead Constraints</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Custom window and luxury cabinetry lines have seasonal Lead times exceeding 8-10 weeks. Unreleased orders threaten the mid-summer envelope lock milestone.
            </p>
          </div>
        </div>

        <div className="p-4 last:border-r-0 flex items-start space-x-3">
          <div className="bg-blue-50 p-2 rounded-sm text-blue-600 shrink-0 border border-blue-100">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">3. Sourcing Exclusion Gaps</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Ensure quote submittals from envelope bidders (BP-02) explicitly include coastal wind-load requirements specified by Stone Harbor regulations.
            </p>
          </div>
        </div>
      </div>

      {/* Main interactive Risk List */}
      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden" id="risks-register-card">
        <div className="p-4 border-b border-slate-150 bg-slate-50/50 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-800 tracking-wider uppercase text-[10px]">active risk tracking file</span>
          <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Regularly updated by PM and Sourcing estimators</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 font-mono text-[9px] uppercase tracking-wider border-b border-slate-150">
                <th className="py-2.5 px-4">Identified Material Exposure Risk</th>
                <th className="py-2.5 px-3">Responsible Owner</th>
                <th className="py-2.5 px-3">Severity Rating</th>
                <th className="py-2.5 px-4">Remedial Status</th>
                <th className="py-2.5 px-4 w-[400px]">Strategic buyout Mitigation Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {riskRegister.map((risk, idx) => {
                const isCritical = risk.severity === "CRITICAL";
                const isHigh = risk.severity === "HIGH";
                
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    
                    {/* Risk Issue text */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 font-sans block text-xs">{risk.issue}</span>
                      <span className="text-[9px] text-slate-400 font-mono">REG-ID: OP-0{idx+1}</span>
                    </td>

                    {/* Owner */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1.5 font-medium text-slate-700">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>{risk.owner}</span>
                      </div>
                    </td>

                    {/* Severity colored label */}
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        isCritical 
                          ? "bg-rose-100 text-rose-800 animate-pulse-warning" 
                          : isHigh 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-blue-105 bg-blue-100 text-blue-800"
                      }`}>
                        {risk.severity}
                      </span>
                    </td>

                    {/* Remedial Status */}
                    <td className="py-3 px-4">
                      <span className={`inline-block border px-2 py-0.5 rounded-sm font-mono font-semibold text-[10px] uppercase tracking-wide ${
                        risk.status === "OPEN" 
                          ? "bg-rose-50 text-rose-700 border-rose-200 font-bold shadow-sm" 
                          : risk.status === "AT RISK" 
                            ? "bg-amber-50 text-amber-700 border-amber-200" 
                            : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        {risk.status}
                      </span>
                    </td>

                    {/* Mitigation strategy narrative */}
                    <td className="py-3 px-4 text-slate-500 whitespace-normal leading-relaxed text-[11px]">
                      {risk.mitigation}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
