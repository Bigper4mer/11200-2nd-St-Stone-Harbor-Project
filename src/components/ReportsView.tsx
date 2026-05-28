/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Rfq } from "../types";
import { SEED_BUDGET_CATEGORIES, SEED_SUMMARY } from "../data";
import { 
  FileDown, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  BadgeDollarSign, 
  PieChart, 
  CheckSquare,
  FileSpreadsheet,
  FileJson,
  Printer,
  FileText,
  BookmarkCheck,
  CheckCircle2,
  Building2
} from "lucide-react";

interface ReportsViewProps {
  rfqs: Rfq[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ rfqs }) => {
  const [boardroomPrepMode, setBoardroomPrepMode] = useState<boolean>(false);
  const [customReportTitle, setCustomReportTitle] = useState<string>("Executive Buyout & Sourcing Audit Reconciliations");

  // Calculations
  const totalOriginalSov = SEED_SUMMARY.currentSov;
  const emailBudgetLimit = SEED_SUMMARY.emailBudget;
  const targetGapExceeds = SEED_SUMMARY.budgetGap;
  const targetSavingsMin = SEED_SUMMARY.savingsLow;
  const targetSavingsMax = SEED_SUMMARY.savingsHigh;

  // Real-time metrics based on RFQs
  const awardedRfqs = rfqs.filter(r => r.status === "Awarded");
  const evaluatingRfqs = rfqs.filter(r => r.status === "Evaluating");
  const contactedCount = rfqs.filter(r => r.status === "Contacted" || r.status === "Quotes due").length;
  const uncontactedCount = rfqs.filter(r => r.status === "Not contacted").length;
  const declinedCount = rfqs.filter(r => r.status === "Declined").length;

  const totalCommittedAwarded = awardedRfqs.reduce((sum, r) => sum + (typeof r.bidAmount === "number" ? r.bidAmount : 0), 0);
  const totalEvaluatingVal = evaluatingRfqs.reduce((sum, r) => sum + (typeof r.bidAmount === "number" ? r.bidAmount : 0), 0);

  // Group RFQ stats per package and compare with baseline
  const packageComparison = SEED_BUDGET_CATEGORIES.map(category => {
    const matchingRfqs = rfqs.filter(r => r.package === category.package);
    const bidsReceived = matchingRfqs.filter(r => typeof r.bidAmount === "number");
    const awardedBid = matchingRfqs.find(r => r.status === "Awarded" && typeof r.bidAmount === "number");
    const bestBidVal = bidsReceived.length > 0 
      ? Math.min(...bidsReceived.map(r => r.bidAmount as number)) 
      : null;

    const currentPriceProjected = awardedBid 
      ? Number(awardedBid.bidAmount) 
      : (bestBidVal !== null ? bestBidVal : category.baseline);

    const projectedSavings = category.baseline - currentPriceProjected;

    return {
      package: category.package,
      baseline: category.baseline,
      target: category.targetPrice,
      bestBidVal,
      awardedBidVal: awardedBid ? Number(awardedBid.bidAmount) : null,
      currentPriceProjected,
      projectedSavings,
      bidsCount: matchingRfqs.length,
      bidsReceivedCount: bidsReceived.length,
      status: awardedBid ? "LOCKED (Awarded)" : (bestBidVal !== null ? "EVALUATING BIDS" : "PENDING PRICING")
    };
  });

  const totalProjectedSavingsSum = packageComparison.reduce((s, p) => s + p.projectedSavings, 0);
  const currentTotalCapitalSpent = totalOriginalSov - totalProjectedSavingsSum;
  const currentActualGap = currentTotalCapitalSpent - emailBudgetLimit;

  // Format Helper
  const formatUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  // CSV exporting handler
  const downloadCsvReport = () => {
    // Generate header row mapping original packages exactly
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Buyout Scope Package,Category Baseline Budget,Target Cost Limit,Best Bid Received,Awarded Contract Bid,Current Projected Allocation,Savings Performance,Status State\n";
    
    packageComparison.forEach((p) => {
      const bestBidStr = p.bestBidVal !== null ? p.bestBidVal : "No Bids";
      const awardedBidStr = p.awardedBidVal !== null ? p.awardedBidVal : "Unawarded";
      const row = `"${p.package}",${p.baseline},${p.target},${bestBidStr},${awardedBidStr},${p.currentPriceProjected},${p.projectedSavings},"${p.status}"`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `Stone_Harbor_Buyout_Performance_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON executive summaries exporter
  const downloadJsonSummary = () => {
    const summaryData = {
      projectTitle: "Residential Estate, 11200 2nd Ave, Stone Harbor NJ",
      systemTimestamp: new Date().toISOString(),
      reportTitle: customReportTitle,
      procurementMetrics: {
        totalOriginalProposedSOV: totalOriginalSov,
        ownerTargetBudgetCap: emailBudgetLimit,
        targetSavingsMinThreshold: targetSavingsMin,
        targetSavingsMaxThreshold: targetSavingsMax,
        overallReductionsRealized: totalProjectedSavingsSum,
        revisedProjectSpent: currentTotalCapitalSpent,
        unresolvedBudgetGap: currentActualGap,
        statusCounts: {
          awarded: awardedRfqs.length,
          evaluating: evaluatingRfqs.length,
          contacted: contactedCount,
          uncontacted: uncontactedCount,
          declined: declinedCount
        }
      },
      packageComparisonDetail: packageComparison
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(summaryData, null, 2));
    const link = document.createElement("a");
    link.href = dataStr;
    link.download = `Stone_Harbor_Executive_JSON_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="reports-view-container">
      
      {/* Control panel & Header */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4" id="reports-header-controls">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-blue-600 tracking-widest font-mono">Statistical Analysis Platform</span>
          <h2 className="text-xs font-bold text-slate-800 tracking-wider uppercase">Buyout Performance & Executive Reports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile target budgets, export spreadsheets, and print high-density executive handouts.
          </p>
        </div>

        {/* Action Button Strip */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Boardroom Toggle */}
          <button 
            onClick={() => setBoardroomPrepMode(!boardroomPrepMode)}
            className={`cursor-pointer inline-flex items-center space-x-1 px-3 py-1.5 rounded-sm text-xs font-bold transition-all border ${
              boardroomPrepMode 
                ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600" 
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
            title="Toggle high-contrast print sheet with boardroom signature blocks"
          >
            <Printer className="h-4 w-4" />
            <span>{boardroomPrepMode ? "Close Sheet Preview" : "Boardroom Print Prep"}</span>
          </button>

          {/* Excel CSV Exporter */}
          <button 
            onClick={downloadCsvReport}
            className="cursor-pointer inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-sm hover:bg-emerald-700 transition-all border border-emerald-600"
            title="Download detailed columns as spreadsheet CSV file"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          {/* JSON Summary Exporter */}
          <button 
            onClick={downloadJsonSummary}
            className="cursor-pointer inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 text-slate-100 text-xs font-bold rounded-sm hover:bg-slate-900 transition-all"
            title="Download full audited metrics in compliant JSON structure"
          >
            <FileJson className="h-4 w-4" />
            <span>Export JSON</span>
          </button>

          {/* Trigger Print */}
          <button 
            onClick={handlePrint}
            className="cursor-pointer inline-flex items-center space-x-1 px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-sm hover:bg-slate-850 transition-all shadow hover:shadow-md"
            id="btn-print-report"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Boardrooms print design preview */}
      {boardroomPrepMode ? (
        <div className="bg-white border-2 border-amber-300 p-8 rounded shadow-md max-w-5xl mx-auto space-y-6" id="boardroom-print-container">
          {/* Instruction banner */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs text-amber-900 flex justify-between items-center print:hidden">
            <span className="font-semibold flex items-center gap-1.5">
              <span className="p-1 bg-amber-100 rounded-full text-amber-600 font-bold">!</span>
              BOARDROOM SHEET ACTIVE: Customize title below and click "Print Report" in your browser. Navbars & controls are dynamically hidden.
            </span>
            <button onClick={() => setBoardroomPrepMode(false)} className="text-amber-800 underline font-bold hover:text-amber-600">Close Preview</button>
          </div>

          {/* Interactive Report Renamer */}
          <div className="space-y-1 block print:hidden border-b border-dashed border-slate-200 pb-3">
            <label className="block text-[10px] text-slate-400 font-bold uppercase">Customize Printed Handout Title Header:</label>
            <input 
              type="text"
              value={customReportTitle}
              onChange={(e) => setCustomReportTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded text-xs focus:outline-none"
            />
          </div>

          {/* Printable Report Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div className="space-y-1">
              <h1 className="text-lg font-bold text-slate-900 uppercase font-mono tracking-tight">{customReportTitle}</h1>
              <span className="block text-xs text-slate-500 uppercase tracking-widest font-mono">PROJECT ID: 11200 2ND AVE, STONE HARBOR, NJ</span>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
                Official cost control disclosure and package audit ledger prepared for Project Stakeholders by the General Contracting team. Reflects active negotiated pricing indexes, subcontractor licenses, and delta projections.
              </p>
            </div>
            <div className="text-right font-mono text-[10px] text-slate-500 space-y-1 shrink-0">
              <div className="font-bold text-slate-800 flex items-center justify-end gap-1"><Building2 className="h-4 w-4" /> MEZZANOTTE BUILDERS</div>
              <div>AUDIT SECURE SEALS PIN: 08247-C</div>
              <div>DATE OF ISSUANCE: {new Date().toLocaleDateString()}</div>
              <div>SYSTEM INTEGRITY: REGISTERED</div>
            </div>
          </div>

          {/* Boardroom Executive Numbers List */}
          <div className="grid grid-cols-4 gap-4 border border-slate-300 rounded overflow-hidden divide-x divide-slate-300 text-center font-mono py-2.5">
            <div>
              <span className="block text-[9px] text-slate-400 uppercase font-semibold">ORIGINAL BRIDGED COST</span>
              <span className="text-base font-bold text-slate-900">{formatUSD(totalOriginalSov)}</span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 uppercase font-semibold">OWNER STATED CAP</span>
              <span className="text-base font-bold text-slate-900">{formatUSD(emailBudgetLimit)}</span>
            </div>
            <div>
              <span className="block text-[9px] text-emerald-600 uppercase font-semibold">REDUCTIONS SECURED</span>
              <span className="text-[15px] font-bold text-emerald-600">-{formatUSD(totalProjectedSavingsSum)}</span>
            </div>
            <div>
              <span className="block text-[9px] text-rose-500 uppercase font-semibold">UNRESOLVED DELTA GAP</span>
              <span className="text-base font-bold text-rose-600">{formatUSD(currentActualGap)}</span>
            </div>
          </div>

          {/* Executive Buyout Status Narrative Table summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">1. BUYOUT INVENTORY REDUCTION LEDGER</h3>
            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left text-[11px] font-mono leading-relaxed">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-300 text-[10px] uppercase">
                    <th className="py-2 px-3 font-semibold text-slate-700">Buyout Package</th>
                    <th className="py-2 px-2 text-right">Baseline Budget</th>
                    <th className="py-2 px-2 text-right">Target Price</th>
                    <th className="py-2 px-2 text-right">Best Bid Recv</th>
                    <th className="py-2 px-2 text-right">Current Proj Allocation</th>
                    <th className="py-2 px-3 text-right">Savings Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {packageComparison.map((p) => (
                    <tr key={p.package} className="hover:bg-slate-50 bg-white">
                      <td className="py-2 px-3 text-slate-900 font-bold">{p.package}</td>
                      <td className="py-2 px-2 text-right text-slate-600">{formatUSD(p.baseline)}</td>
                      <td className="py-2 px-2 text-right text-slate-500">{formatUSD(p.target)}</td>
                      <td className="py-2 px-2 text-right font-medium text-slate-800">
                        {p.bestBidVal !== null ? formatUSD(p.bestBidVal) : "No Bids"}
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-slate-900">{formatUSD(p.currentPriceProjected)}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-600">
                        {p.projectedSavings > 0 ? `-${formatUSD(p.projectedSavings)}` : "$0"}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-slate-100 font-bold border-t border-slate-300">
                    <td className="py-2.5 px-3 uppercase text-slate-800">Audit Summary Totals</td>
                    <td className="py-2.5 px-2 text-right">{formatUSD(totalOriginalSov)}</td>
                    <td className="py-2.5 px-2 text-right">{formatUSD(packageComparison.reduce((s, p) => s + p.target, 0))}</td>
                    <td className="py-2.5 px-2 text-right">-</td>
                    <td className="py-2.5 px-2 text-right text-slate-900">{formatUSD(currentTotalCapitalSpent)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600">-{formatUSD(totalProjectedSavingsSum)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance stamps & Signature block lanes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-300" id="signoffs">
            {/* Stamp 1 */}
            <div className="p-4 border border-slate-200 bg-slate-50/50 rounded flex flex-col justify-between h-32">
              <div className="space-y-1">
                <span className="block text-[9px] uppercase font-bold text-slate-500">I. Estimating Certification Seal</span>
                <p className="text-[10px] text-slate-400">Certified that active contractor directory bids listed conform with approved Cape May specifications.</p>
              </div>
              <div className="border-t border-dashed border-slate-300 pt-2 text-[10px] font-mono text-slate-500 flex justify-between items-center">
                <span>Sign: _____________________</span>
                <span>Date: __________</span>
              </div>
            </div>

            {/* Stamp 2 */}
            <div className="p-4 border border-slate-200 bg-slate-50/50 rounded flex flex-col justify-between h-32">
              <div className="space-y-1">
                <span className="block text-[9px] uppercase font-bold text-slate-500">II. General Contractor Approvals</span>
                <p className="text-[10px] text-slate-400">Mezzanottebuilders custom residential control buyout is hereby submitted of record.</p>
              </div>
              <div className="border-t border-dashed border-slate-300 pt-2 text-[10px] font-mono text-slate-500 flex justify-between items-center">
                <span>Sign: _____________________</span>
                <span>Date: __________</span>
              </div>
            </div>

            {/* Stamp 3 */}
            <div className="p-4 border border-slate-200 bg-slate-50/50 rounded flex flex-col justify-between h-32">
              <div className="space-y-1">
                <span className="block text-[9px] uppercase font-bold text-slate-500">III. Developer / Owner Release</span>
                <p className="text-[10px] text-slate-400">Stated budget cap release, locking allocated contract buyout sums specified above.</p>
              </div>
              <div className="border-t border-dashed border-slate-300 pt-2 text-[10px] font-mono text-slate-500 flex justify-between items-center">
                <span>Sign: _____________________</span>
                <span>Date: __________</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Regular charts layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1" id="reports-executive-grids">
          
          {/* Section 1: Executive Buyout Summary & Budget Bridge */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 space-y-6" id="executive-buyout-summary-report">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase font-mono flex items-center gap-2">
                <PieChart className="h-4 w-4 text-blue-600" />
                1. Executive SOV Buyout Summary
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Summary of absolute goals, current actual projections and status counts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-slate-200 bg-white rounded-sm overflow-hidden" id="summary-metrics-grid">
              <div className="p-4 border-b md:border-b-0 md:border-r border-slate-150 last:border-r-0">
                <span className="block text-[9px] uppercase text-slate-400 font-bold mb-1">Total Original SOV</span>
                <span className="text-lg font-bold font-mono text-slate-900">{formatUSD(totalOriginalSov)}</span>
              </div>
              
              <div className="p-4 border-b md:border-b-0 md:border-r border-slate-150 last:border-r-0">
                <span className="block text-[9px] uppercase text-slate-400 font-bold mb-1">Owner Email Budget</span>
                <span className="text-lg font-bold font-mono text-slate-900">{formatUSD(emailBudgetLimit)}</span>
              </div>

              <div className="p-4 border-b md:border-b-0 md:border-r border-slate-150 last:border-r-0 bg-blue-50/30">
                <span className="block text-[9px] uppercase text-teal-600 font-bold mb-1">Defined Target Savings</span>
                <span className="text-sm font-bold text-teal-700 font-mono">
                  {formatUSD(targetSavingsMin)} <span className="text-slate-400 font-sans text-[10px] mx-0.5">to</span> {formatUSD(targetSavingsMax)}
                </span>
              </div>

              <div className="p-4 last:border-r-0 bg-red-50/50">
                <span className="block text-[9px] uppercase text-rose-500 font-bold mb-1">Unresolved Gap</span>
                <span className="text-lg font-bold font-mono text-rose-600">{formatUSD(targetGapExceeds)}</span>
              </div>
            </div>

            {/* Sourcing and Award pipelines summary */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Contract Sourcing Stage Registry</h4>
              <div className="grid grid-cols-5 gap-2 text-center text-xs" id="stage-counts-registry">
                <div className="bg-emerald-50 border border-emerald-100 p-2 rounded">
                  <span className="block font-bold font-mono text-emerald-700 text-sm">{awardedRfqs.length}</span>
                  <span className="block text-[8px] uppercase text-emerald-600 font-medium font-sans mt-0.5">Awarded</span>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-2 rounded">
                  <span className="block font-bold font-mono text-blue-700 text-sm">{evaluatingRfqs.length}</span>
                  <span className="block text-[8px] uppercase text-blue-600 font-medium font-sans mt-0.5">Evaluating</span>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-2 rounded">
                  <span className="block font-bold font-mono text-amber-700 text-sm">{contactedCount}</span>
                  <span className="block text-[8px] uppercase text-amber-600 font-medium font-sans mt-0.5">Open RFQs</span>
                </div>
                <div className="bg-slate-100 border border-slate-200 p-2 rounded">
                  <span className="block font-bold font-mono text-slate-600 text-sm">{uncontactedCount}</span>
                  <span className="block text-[8px] uppercase text-slate-500 mt-0.5">Uncontacted</span>
                </div>
                <div className="bg-slate-50 border border-slate-150 p-2 rounded">
                  <span className="block font-bold font-mono text-slate-500 text-sm">{declinedCount}</span>
                  <span className="block text-[8px] uppercase text-slate-400 mt-0.5 font-sans">Declined</span>
                </div>
              </div>
            </div>

            {/* Sourcing Totals Progress */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Financial Status Report Summary</h4>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Committed / Awarded Contract Sum:</span>
                  <span className="font-bold text-slate-900">{formatUSD(totalCommittedAwarded)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Active Bids Under Evaluation Sum:</span>
                  <span className="font-bold text-blue-600">{formatUSD(totalEvaluatingVal)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Realized Sourcing Price Reductions:</span>
                  <span className="font-bold text-emerald-600">{formatUSD(totalProjectedSavingsSum)}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100 text-slate-900">
                  <span>Current Realized Gap vs. Owner Budget:</span>
                  <span className={`font-bold ${currentActualGap <= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatUSD(currentActualGap)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Buyout Bridge Statement and General advice */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 space-y-5" id="buyout-bridge-report">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase font-mono flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-blue-600" />
                2. Buyout Bridge & Savings Projection
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Real-time savings performance against original package baseline limits.</p>
            </div>

            {/* Sourcing narrative */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-600">
              <p>
                By evaluating subcontractor quote iterations and locking competitive bids, the project achieves an estimated <strong className="text-emerald-600 font-mono">{formatUSD(totalProjectedSavingsSum)}</strong> in overall reductions.
              </p>
              
              <p>
                This is represented by the difference between the initial proposed SOV sum of <strong className="font-mono text-slate-800">{formatUSD(totalOriginalSov)}</strong> and modern current projections of <strong className="text-blue-600 font-mono">{formatUSD(currentTotalCapitalSpent)}</strong>.
              </p>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded text-[11px] text-blue-800 font-medium">
                <span className="block font-bold uppercase tracking-wider text-[9px] text-blue-700">Audit Status Report</span>
                <span>All 19 subcontractor scopes remain mapped to target criteria. Modify values under the RFQs tab to change the projection models.</span>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono block mb-1">Target Reduction Variance Thresholds</span>
                {/* Progress visual comparison */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                      <span>Minimum Desired Savings (Low)</span>
                      <span>{formatUSD(targetSavingsMin)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded mt-0.5">
                      <div className="bg-slate-400 h-full rounded" style={{ width: `${Math.min(100, (totalProjectedSavingsSum / targetSavingsMin) * 100)}%` }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                      <span>Maximum Leverage Headroom (High)</span>
                      <span>{formatUSD(targetSavingsMax)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded mt-0.5">
                      <div className="bg-blue-600 h-full rounded" style={{ width: `${Math.min(100, (totalProjectedSavingsSum / targetSavingsMax) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Package-by-Package Detailed Sourcing Report (Common to both but hidden on prep mode print to fit cleanly if needed) */}
      <div className={`bg-white border border-slate-200 rounded-sm overflow-hidden ${boardroomPrepMode ? "print:hidden" : ""}`} id="package-detail-sourcing-report">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase font-mono">
            3. Package Savings Performance Detail List
          </h3>
          <span className="text-[10px] uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded font-bold font-mono">
            SUM PROJECTED SAVINGS: {formatUSD(totalProjectedSavingsSum)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 font-mono text-[9px] uppercase tracking-wider border-b border-slate-150">
                <th className="py-2.5 px-4">Buyout Scope Package</th>
                <th className="py-2.5 px-3">Category Baseline</th>
                <th className="py-2.5 px-3">Target Cost Limit</th>
                <th className="py-2.5 px-3">Best Bid Recv</th>
                <th className="py-2.5 px-3">Awarded Contract</th>
                <th className="py-2.5 px-3">Current Projection</th>
                <th className="py-2.5 px-3">Savings delta</th>
                <th className="py-2.5 px-3 text-right">Status State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {packageComparison.map((pkg) => {
                const isUnderGoal = pkg.projectedSavings > 0;
                return (
                  <tr key={pkg.package} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-800">{pkg.package}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{formatUSD(pkg.baseline)}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{formatUSD(pkg.target)}</td>
                    <td className="py-3 px-3 font-mono">
                      {pkg.bestBidVal !== null ? (
                        <span className="text-slate-800 font-medium">{formatUSD(pkg.bestBidVal)}</span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px] uppercase">No Bids</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {pkg.awardedBidVal !== null ? (
                        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-sm font-bold text-[11px]">{formatUSD(pkg.awardedBidVal)}</span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px] uppercase">Unawarded</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800">{formatUSD(pkg.currentPriceProjected)}</td>
                    <td className="py-3 px-3 font-mono">
                      <span className={`font-bold ${isUnderGoal ? "text-emerald-600" : "text-rose-600"}`}>
                        {formatUSD(pkg.projectedSavings)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-1.5 py-0.25 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        pkg.status.includes("LOCKED") 
                          ? "bg-slate-900 text-white" 
                          : pkg.status.includes("EVALUATING") 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-slate-100 text-slate-500"
                      }`}>
                        {pkg.status}
                      </span>
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
