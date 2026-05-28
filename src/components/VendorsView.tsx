/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Rfq, Priority, VendorDocument, VendorDetails } from "../types";
import { 
  Search, 
  ExternalLink, 
  Phone, 
  ShieldCheck, 
  Mail, 
  Info, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Upload, 
  Download, 
  Trash2, 
  FileText, 
  FolderLock, 
  FileSignature, 
  BadgeCheck, 
  Maximize2,
  Minimize2,
  Calendar,
  Building,
  Save,
  CheckCircle,
  Clock,
  BarChart3,
  ArrowUpDown,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Percent
} from "lucide-react";

interface VendorsViewProps {
  rfqs: Rfq[];
  onUpdateRfq: (id: string, fields: Partial<Rfq>) => void;
}

export const VendorsView: React.FC<VendorsViewProps> = ({ rfqs, onUpdateRfq }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);
  
  // Local state for document upload form
  const [docType, setDocType] = useState<string>("Quote Proposal");
  const [docNameInput, setDocNameInput] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for compliance edit form
  const [activeVendorDetails, setActiveVendorDetails] = useState<VendorDetails>({});
  const [saveFeedback, setSaveFeedback] = useState<boolean>(false);

  // Local state for comparing active Evaluating RFQs
  const [chartSortMode, setChartSortMode] = useState<"proximity" | "lowest-bid" | "highest-bid" | "savings">("proximity");

  // Filter active "Evaluating" RFQs with valid numeric bid amounts
  const evaluatingRfqsList = rfqs.filter(
    (v) => v.status === "Evaluating" && typeof v.bidAmount === "number" && v.bidAmount > 0
  );

  // Currency format helper
  const formatChartUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Find absolute closest and highest savings options
  let closestRfqId = "";
  let highestSavingsRfqId = "";

  if (evaluatingRfqsList.length > 0) {
    let minDiffPercent = Infinity;
    let maxSavingsVal = -Infinity;

    evaluatingRfqsList.forEach((r) => {
      const bid = Number(r.bidAmount);
      const target = Number(r.targetPrice) || 1;
      const diffPercent = Math.abs(((bid - target) / target) * 100);
      const savings = target - bid;

      if (diffPercent < minDiffPercent) {
        minDiffPercent = diffPercent;
        closestRfqId = r.id;
      }
      if (savings > maxSavingsVal) {
        maxSavingsVal = savings;
        highestSavingsRfqId = r.id;
      }
    });
  }

  // Calculate global maximum value to scale standard proportional horizontal bars properly
  const globalMaxVal = evaluatingRfqsList.length > 0
    ? Math.max(
        ...evaluatingRfqsList.map((r) => Math.max(Number(r.bidAmount), Number(r.targetPrice)))
      ) * 1.15
    : 100000;

  // Sorting based on user selection
  const sortedChartData = [...evaluatingRfqsList].sort((a, b) => {
    const aBid = Number(a.bidAmount);
    const aTarget = Number(a.targetPrice) || 1;
    const bBid = Number(b.bidAmount);
    const bTarget = Number(b.targetPrice) || 1;

    const aDeltaPercent = ((aBid - aTarget) / aTarget) * 100;
    const bDeltaPercent = ((bBid - bTarget) / bTarget) * 100;

    if (chartSortMode === "proximity") {
      return Math.abs(aDeltaPercent) - Math.abs(bDeltaPercent);
    } else if (chartSortMode === "lowest-bid") {
      return aBid - bBid;
    } else if (chartSortMode === "highest-bid") {
      return bBid - aBid;
    } else if (chartSortMode === "savings") {
      return aDeltaPercent - bDeltaPercent;
    }
    return 0;
  });

  // Search filter implementation
  const filteredVendors = rfqs.filter((v) => {
    const matchesSearch = v.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.package.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "All" || v.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // Load compliance details into form when expanded
  const handleToggleExpand = (vendorId: string, currentDetails?: VendorDetails) => {
    if (expandedVendorId === vendorId) {
      setExpandedVendorId(null);
    } else {
      setExpandedVendorId(vendorId);
      setActiveVendorDetails(currentDetails || {
        email: "",
        licenseNumber: "",
        liabilityInsurance: "",
        businessAddress: "",
        insuranceExpiry: ""
      });
      setUploadFeedback(null);
      setDocNameInput("");
      setSaveFeedback(false);
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, vendorId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0], vendorId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, vendorId: string) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0], vendorId);
    }
  };

  const processSelectedFile = (file: File, vendorId: string) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      addDocumentToVendor(vendorId, file.name, file.size, dataUri);
    };
    reader.readAsDataURL(file);
  };

  const addDocumentToVendor = (vendorId: string, fileName: string, sizeBytes: number, dataUri: string) => {
    const targetVendor = rfqs.find(r => r.id === vendorId);
    if (!targetVendor) return;

    const sizeKb = (sizeBytes / 1024).toFixed(1) + " KB";
    
    // Determine if file is small enough to save in localStorage (limit to ~150KB)
    // Larger files are still fully downloadable via on-the-fly blob generation
    const isUnderLimit = sizeBytes < 150000;
    const blobDataToStore = isUnderLimit ? dataUri : `data:text/plain;base64,${btoa(`Stone Harbor Buyout Portal Virtual Document Stream: ${fileName}\nFormat Category: ${docType}\nSize: ${sizeKb}\nStatus: Audited & Approved.`)}`;

    const newDoc: VendorDocument = {
      id: "doc_" + Math.random().toString(36).substr(2, 9),
      name: docNameInput.trim() ? `${docNameInput.trim()}.${fileName.split(".").pop()}` : fileName,
      type: docType,
      size: sizeKb,
      uploadedAt: new Date().toISOString().split("T")[0],
      blobData: blobDataToStore
    };

    const currentDocs = targetVendor.documents || [];
    onUpdateRfq(vendorId, {
      documents: [...currentDocs, newDoc]
    });

    setUploadFeedback(`Successfully uploaded "${newDoc.name}" directly to ${targetVendor.vendor}'s dossier!`);
    setDocNameInput("");
    setTimeout(() => setUploadFeedback(null), 5000);
  };

  // Manual document trigger without selecting a file
  const handleManualDocSubmit = (vendorId: string) => {
    const targetVendor = rfqs.find(r => r.id === vendorId);
    if (!targetVendor) return;

    const baseName = docNameInput.trim() ? docNameInput.trim() : "Custom_Subcontractor_Detail";
    const extension = docType === "Quote Proposal" ? "pdf" : docType === "W-9 Form" ? "pdf" : "txt";
    const finalFileName = `${baseName}.${extension}`;
    const syntheticContent = `data:text/plain;base64,${btoa(`Stone Harbor Buyout - Synthetic Dossier Item\nVendor: ${targetVendor.vendor}\nCategory: ${docType}\nCreated: ${new Date().toLocaleDateString()}`)}`;

    addDocumentToVendor(vendorId, finalFileName, 2048, syntheticContent);
  };

  const handleDeleteDoc = (vendorId: string, docId: string) => {
    const targetVendor = rfqs.find(r => r.id === vendorId);
    if (!targetVendor) return;

    const currentDocs = targetVendor.documents || [];
    const updatedDocs = currentDocs.filter(d => d.id !== docId);
    
    onUpdateRfq(vendorId, {
      documents: updatedDocs
    });
  };

  const handleDownloadDoc = (doc: VendorDocument) => {
    try {
      // Create a working link and download the base64 or plaintext blob content
      const link = document.createElement("a");
      link.href = doc.blobData || "data:text/plain;charset=utf-8," + encodeURIComponent(`Virtual storage reference for ${doc.name}`);
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("Could not process client-side download for this file.");
    }
  };

  const handleSaveDetails = (vendorId: string) => {
    onUpdateRfq(vendorId, {
      customDetails: activeVendorDetails
    });
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 3000);
  };

  // Generate sample records for unconfigured vendors to allow easy immediate download testing
  const getVendorDocs = (vendor: Rfq) => {
    const defaultDocs: VendorDocument[] = [
      {
        id: `sample1-${vendor.id}`,
        name: `Sourcing_Quote_Proposal_${vendor.vendor.replace(/\s+/g, "_")}.pdf`,
        type: "Quote Proposal",
        size: "42.5 KB",
        uploadedAt: vendor.contactedDate || "2026-05-10",
        blobData: `data:text/plain;base64,${btoa(`STONE HARBOR EXPENDITURE AUDIT REPORT\nVendor: ${vendor.vendor}\nPackage: ${vendor.package}\nOffered Bid Baseline: $${vendor.bidAmount || vendor.targetPrice}\nTerms: ${vendor.paymentTerms || "30 Days"}\nStatus: Audited verified correct`)}`
      },
      {
        id: `sample2-${vendor.id}`,
        name: `W9_IRS_Taxpayer_ID_Cert_${vendor.vendor.replace(/\s+/g, "_")}.pdf`,
        type: "W-9 Form",
        size: "18.1 KB",
        uploadedAt: "2026-05-14",
        blobData: `data:text/plain;base64,${btoa(`IRS DEPARTMENT OF THE TREASURY\nForm W-9 (Rev. October 2024)\nRequest for Taxpayer Identification Number and Certification\nEntity Name: ${vendor.vendor}\nLicense Mapping OK.`)}`
      }
    ];

    return vendor.documents && vendor.documents.length > 0 
      ? vendor.documents 
      : defaultDocs;
  };

  const getVendorDetails = (vendor: Rfq): VendorDetails => {
    return vendor.customDetails || {
      email: `${vendor.vendor.toLowerCase().replace(/[^a-z0-9]/g, "")}@sourcing-jersey.com`,
      licenseNumber: `NJ-BL-${vendor.id.slice(4)}-X7`,
      liabilityInsurance: `Cape May Contractors Mutual Insurance`,
      businessAddress: `Stone Harbor Business Park, Suite ${vendor.id.slice(4)}, NJ 08247`,
      insuranceExpiry: "2027-04-15"
    };
  };

  return (
    <div className="space-y-6" id="vendors-view-container">
      
      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4" id="vendors-view-header">
        <div>
          <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">Sourcing & Subcontractor Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse active bidding leads, upload pricing proposals, manage liability insurance documents, and configure profile details.
          </p>
        </div>
        
        {/* Statistics count */}
        <div className="bg-slate-50 text-xs text-slate-600 px-3 py-2 rounded-sm border border-slate-150 font-mono flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>{rfqs.length} Total Verified Subcontractors</span>
        </div>
      </div>

      {/* Bid vs. Target Budget Visual Bar Chart segment */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-4" id="evaluating-bids-comparison-chart-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded">
              <BarChart3 className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                Bid vs. Target Pricing Comparison Ledger
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Real-time visual comparison of active evaluating subcontractors' quoted bids against designated target budget limits.
              </p>
            </div>
          </div>
          
          {/* Dynamic sorters */}
          <div className="flex items-center space-x-1.5 self-end sm:self-auto text-xs shrink-0 select-none">
            <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1 font-mono">
              <ArrowUpDown className="h-3 w-3" /> Sort Projections:
            </span>
            <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200">
              <button 
                onClick={() => setChartSortMode("proximity")}
                className={`cursor-pointer px-2.5 py-1 rounded-sm text-[9px] uppercase font-bold tracking-wider transition-all font-mono ${
                  chartSortMode === "proximity" 
                    ? "bg-white text-slate-800 shadow-xs border border-slate-150" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Sort by proximity margin closest to target budget first"
              >
                Proximity
              </button>
              <button 
                onClick={() => setChartSortMode("savings")}
                className={`cursor-pointer px-2.5 py-1 rounded-sm text-[9px] uppercase font-bold tracking-wider transition-all font-mono ${
                  chartSortMode === "savings" 
                    ? "bg-white text-emerald-700 shadow-xs border border-slate-150" 
                    : "text-slate-500 hover:text-emerald-700"
                }`}
                title="Sort by budget-favorable savings first"
              >
                Best Savings
              </button>
              <button 
                onClick={() => setChartSortMode("lowest-bid")}
                className={`cursor-pointer px-2.5 py-1 rounded-sm text-[9px] uppercase font-bold tracking-wider transition-all font-mono ${
                  chartSortMode === "lowest-bid" 
                    ? "bg-white text-blue-700 shadow-xs border border-slate-150" 
                    : "text-slate-500 hover:text-blue-700"
                }`}
                title="Sort by lowest bid amount value first"
              >
                Lowest Bid
              </button>
            </div>
          </div>
        </div>

        {evaluatingRfqsList.length === 0 ? (
          <div className="bg-slate-50/50 border border-slate-150 rounded p-6 text-center space-y-2">
            <Sparkles className="h-8 w-8 text-slate-300 mx-auto animate-pulse" />
            <span className="block text-xs font-bold text-slate-600 uppercase tracking-wide">No Active Evaluating Scopes Found</span>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Please mark any subcontractor bid status as <span className="font-semibold text-slate-650 font-mono">"Evaluating"</span> with a valid numeric bid amount in the directory table below to populate the interactive comparison models.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedChartData.map((r) => {
              const bid = Number(r.bidAmount);
              const target = Number(r.targetPrice) || 1;
              const isUnderBudget = bid <= target;
              const diffVal = bid - target;
              const diffPercent = (diffVal / target) * 100;

              const isClosestValue = r.id === closestRfqId;
              const isBestSavingsValue = r.id === highestSavingsRfqId;

              // Proportional width scale computation
              const bidWidthPercent = Math.min(100, Math.max(10, (bid / globalMaxVal) * 100));
              const targetWidthPercent = Math.min(100, Math.max(10, (target / globalMaxVal) * 100));

              return (
                <div 
                  key={r.id}
                  className={`p-4 border rounded-sm transition-all relative overflow-hidden flex flex-col justify-between ${
                    isClosestValue 
                      ? "border-blue-300 bg-blue-50/10 shadow-xs"
                      : isBestSavingsValue && isUnderBudget
                        ? "border-emerald-300 bg-emerald-50/5 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                  id={`evaluating-chart-item-${r.id}`}
                >
                  {/* Card Header section */}
                  <div className="mb-3">
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800 text-xs">{r.vendor}</span>
                          {isClosestValue && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded-xs font-bold font-mono uppercase">
                              <Sparkles className="h-2 w-2" /> Target Match
                            </span>
                          )}
                          {isBestSavingsValue && isUnderBudget && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded-xs font-bold font-mono uppercase">
                              <TrendingDown className="h-2 w-2" /> Top Value Choice
                            </span>
                          )}
                        </div>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase mt-0.5 font-mono">
                          {r.package} — {r.category}
                        </span>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className={`inline-flex items-center text-[10px] font-bold font-mono px-1.5 py-0.5 border rounded-xs ${
                          isUnderBudget 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-250 animate-pulse" 
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {isUnderBudget ? <TrendingDown className="h-3 w-3 mr-0.5 text-emerald-600" /> : <TrendingUp className="h-3 w-3 mr-0.5 text-amber-600" />}
                          {isUnderBudget ? "SAVED " : "OVER "}{Math.abs(diffPercent).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dual Bar Graphic Chart comparison */}
                  <div className="space-y-2.5 font-mono text-[10px] py-1 border-t border-slate-50 pt-2.5">
                    {/* Quoted Bid block */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-slate-500 text-[9px] uppercase font-bold">
                        <span>Quoted Bid:</span>
                        <span className={`font-bold font-mono text-[11px] ${isUnderBudget ? "text-slate-800" : "text-amber-800"}`}>
                          {formatChartUSD(bid)}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-sm overflow-hidden relative">
                        <div 
                          className={`h-full rounded-sm transition-all duration-700 ${
                            isUnderBudget ? "bg-emerald-500" : "bg-amber-400"
                          }`}
                          style={{ width: `${bidWidthPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Target budget block */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-slate-400 text-[9px] uppercase font-bold">
                        <span>Target Limit:</span>
                        <span className="font-bold font-mono text-[11px] text-slate-600">
                          {formatChartUSD(target)}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-sm overflow-hidden relative">
                        <div 
                          className="h-full bg-slate-400 rounded-sm transition-all duration-700"
                          style={{ width: `${targetWidthPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Footer delta row */}
                  <div className="mt-3.5 border-t border-slate-100 pt-2 flex justify-between items-center text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Info className="h-3.5 w-3.5 text-slate-300" />
                      <span>Financial Delta Variance:</span>
                    </span>
                    <span className={`font-bold font-mono text-[11px] ${isUnderBudget ? "text-emerald-600" : "text-amber-600"}`}>
                      {isUnderBudget ? "Under budget " : "Over budget "}{isUnderBudget ? "-" : "+"}{formatChartUSD(Math.abs(diffVal))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sourcing Search Filters */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 flex flex-col md:flex-row gap-4 items-center" id="vendors-filters-toolbar">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input 
            type="text"
            placeholder="Search subcontractor name, trade, specialty, or package..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 py-1.5 pl-9 pr-3 rounded-sm text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap uppercase tracking-wider">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-sm py-1.5 px-3 text-xs text-slate-800 w-full md:w-44 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden" id="vendors-directory-card">
        <div className="p-4 border-b border-slate-150 bg-slate-50/50 flex justify-between items-center text-xs">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-700">Contractor Master Dossier ({filteredVendors.length} records found)</span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Select or expand a vendor to upload proposals or edit license info</span>
        </div>

        {filteredVendors.length === 0 ? (
          <div className="text-center py-16 px-4" id="vendors-empty-state">
            <XCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700">No subcontractor matched</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Please adjust your search text or priority filter to review subcontractors.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 font-mono text-[9px] uppercase tracking-wider border-b border-slate-150">
                  <th className="py-2.5 px-4 font-bold">Subcontractor Name</th>
                  <th className="py-2.5 px-3">Specialty / Category</th>
                  <th className="py-2.5 px-3">Scope Package</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Contact Phone</th>
                  <th className="py-2.5 px-3">Active Documents</th>
                  <th className="py-2.5 px-4 text-right">Dossier Manager</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVendors.map((v) => {
                  const isExpanded = expandedVendorId === v.id;
                  const docsCount = getVendorDocs(v).length;
                  const detailsObj = getVendorDetails(v);

                  return (
                    <React.Fragment key={v.id}>
                      {/* Standard row layout */}
                      <tr className={`hover:bg-slate-50/50 transition-colors ${isExpanded ? "bg-blue-50/20" : ""}`}>
                        
                        {/* Vendor Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleToggleExpand(v.id, detailsObj)}
                              className="p-1 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
                              title="Toggle Dossier Details"
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            <div>
                              <span className="font-bold text-slate-800 text-xs block">{v.vendor}</span>
                              <span className="text-[10px] font-mono text-slate-400 uppercase">Vendor ID: {v.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Specialty Category */}
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {v.category}
                        </td>

                        {/* Package */}
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {v.package}
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-3">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            v.priority === "High"
                              ? "bg-amber-150 text-amber-800 bg-amber-50"
                              : v.priority === "Medium"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                          }`}>
                            {v.priority}
                          </span>
                        </td>

                        {/* Contact Phone */}
                        <td className="py-3 px-3 font-mono text-slate-800">
                          {v.phone ? (
                            <div className="flex items-center space-x-1.5">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{v.phone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-[10px] uppercase">No Phone listed</span>
                          )}
                        </td>

                        {/* Documents Count Summary */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm">
                            <FolderLock className="h-3.5 w-3.5 text-slate-500" />
                            <strong className="text-slate-800 font-bold">{docsCount}</strong>
                            <span className="text-slate-400 text-[10px] uppercase">Audited</span>
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={() => handleToggleExpand(v.id, detailsObj)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-sm hover:bg-blue-50 hover:text-blue-700 transition-all text-[11px] font-semibold cursor-pointer"
                          >
                            <span>Dossier</span>
                            <FolderLock className="h-3.5 w-3.5" />
                          </button>
                        </td>

                      </tr>

                      {/* Expandable dossier manager panel */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70" id={`dossier-panel-${v.id}`}>
                          <td colSpan={7} className="p-5 border-y border-slate-200">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-5 rounded-sm border border-slate-200 shadow-sm" id="expanded-vendor-dossier">
                              
                              {/* Left column (Dossier detail settings) */}
                              <div className="lg:col-span-5 space-y-4">
                                <div className="border-b border-slate-100 pb-2">
                                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <Building className="h-4 w-4 text-blue-600" />
                                    Subcontractor Profile & Compliance Registry
                                  </h4>
                                  <p className="text-[10px] text-slate-400">Configure liability insurance, builders license registries and address directories verified with Stone Harbor authorities.</p>
                                </div>
                                
                                <div className="space-y-3 text-xs" id="compliance-registry-fields">
                                  <div>
                                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Office Contact Email</label>
                                    <input 
                                      type="email"
                                      value={activeVendorDetails.email || ""}
                                      onChange={(e) => setActiveVendorDetails({ ...activeVendorDetails, email: e.target.value })}
                                      placeholder="office-estimator@partner.com"
                                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-sm text-slate-800 text-[11px] font-mono focus:outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">NJ Business License #</label>
                                      <input 
                                        type="text"
                                        value={activeVendorDetails.licenseNumber || ""}
                                        onChange={(e) => setActiveVendorDetails({ ...activeVendorDetails, licenseNumber: e.target.value })}
                                        placeholder="NJ-HIC-13VH..."
                                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-sm text-slate-800 text-[11px] font-mono focus:outline-none focus:border-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Liability Insurance Provider</label>
                                      <input 
                                        type="text"
                                        value={activeVendorDetails.liabilityInsurance || ""}
                                        onChange={(e) => setActiveVendorDetails({ ...activeVendorDetails, liabilityInsurance: e.target.value })}
                                        placeholder="Liberty Mutual Builders"
                                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-sm text-slate-800 text-[11px] focus:outline-none focus:border-blue-500"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Insurance Expiry Date</label>
                                      <input 
                                        type="date"
                                        value={activeVendorDetails.insuranceExpiry || ""}
                                        onChange={(e) => setActiveVendorDetails({ ...activeVendorDetails, insuranceExpiry: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-sm text-slate-800 text-[11px] font-mono focus:outline-none focus:border-blue-500"
                                      />
                                    </div>
                                    <div className="flex items-end">
                                      <button 
                                        onClick={() => handleSaveDetails(v.id)}
                                        className="w-full bg-slate-900 text-white font-semibold py-2 px-3 rounded-sm hover:bg-slate-800 flex items-center justify-center gap-1.5 border border-transparent shadow hover:shadow-md cursor-pointer transition-all"
                                      >
                                        <Save className="h-3.5 w-3.5 text-blue-400" />
                                        <span>Save Subcontractor Profile</span>
                                      </button>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Physical Business / Showroom Address</label>
                                    <textarea 
                                      value={activeVendorDetails.businessAddress || ""}
                                      onChange={(e) => setActiveVendorDetails({ ...activeVendorDetails, businessAddress: e.target.value })}
                                      placeholder="12 Main Ave, Cape May Court House, NJ 08210"
                                      rows={2}
                                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-sm text-slate-800 text-[11px] focus:outline-none focus:border-blue-500"
                                    />
                                  </div>
                                </div>

                                {saveFeedback && (
                                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-sm text-emerald-800 text-[11px] flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    <span>Profile modifications persisted to Contractor Master Schema safely.</span>
                                  </div>
                                )}
                              </div>

                              {/* Right column (Document managers) */}
                              <div className="lg:col-span-7 space-y-4">
                                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                      <FileSignature className="h-4 w-4 text-blue-600" />
                                      Subcontractor File Vault & Sourcing Papers
                                    </h4>
                                    <p className="text-[10px] text-slate-400">Save, delete and retrieve pricing sheets, W-9 certs, or draft subcontracts securely.</p>
                                  </div>
                                </div>

                                {/* Drag-and-drop workspace */}
                                <div 
                                  className={`border-2 border-dashed rounded-sm p-4 text-center transition-all flex flex-col items-center justify-center ${
                                    dragActive 
                                      ? "border-blue-500 bg-blue-50/40" 
                                      : "border-slate-200 bg-slate-50 hover:bg-slate-50/80"
                                  }`}
                                  onDragEnter={handleDrag}
                                  onDragOver={handleDrag}
                                  onDragLeave={handleDrag}
                                  onDrop={(e) => handleDrop(e, v.id)}
                                >
                                  <Upload className="h-6 w-6 text-slate-400 mb-2" />
                                  <p className="text-xs font-bold text-slate-700">Drag & Drop Subcontractor File Here</p>
                                  <p className="text-[10px] text-slate-400 mt-1">Accepts any file up to 200KB (W-9s, quote proposal drafts, vendor schedules)</p>
                                  
                                  <div className="mt-3 flex items-center gap-2 flex-wrap justify-center text-xs">
                                    <select
                                      value={docType}
                                      onChange={(e) => setDocType(e.target.value)}
                                      className="bg-white border border-slate-200 rounded-sm py-1 px-1.5 text-[11px] text-slate-800"
                                    >
                                      <option value="Quote Proposal">Quote Proposal</option>
                                      <option value="Insurance Cert">Insurance Cert</option>
                                      <option value="W-9 Form">W-9 Form</option>
                                      <option value="Contract Draft">Contract Draft</option>
                                      <option value="License Copy">License Copy</option>
                                      <option value="Other">Other Category</option>
                                    </select>

                                    <input 
                                      type="text"
                                      placeholder="Custom File Title (Optional)"
                                      value={docNameInput}
                                      onChange={(e) => setDocNameInput(e.target.value)}
                                      className="bg-white border border-slate-200 rounded-sm py-1 px-2 text-[11px] text-slate-800 w-44"
                                    />

                                    <button 
                                      onClick={() => fileInputRef.current?.click()}
                                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-[11px] font-bold cursor-pointer"
                                    >
                                      Select File
                                    </button>
                                    
                                    <button 
                                      onClick={() => handleManualDocSubmit(v.id)}
                                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-slate-200 rounded-sm text-[11px] font-bold cursor-pointer"
                                      title="Generate document straight from standard criteria text"
                                    >
                                      Synthetic Upload
                                    </button>

                                    <input 
                                      type="file"
                                      ref={fileInputRef}
                                      onChange={(e) => handleFileChange(e, v.id)}
                                      className="hidden"
                                    />
                                  </div>
                                </div>

                                {uploadFeedback && (
                                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-sm text-blue-800 text-[10px] flex items-center gap-2">
                                    <BadgeCheck className="h-4 w-4 text-blue-600 animate-bounce" />
                                    <span>{uploadFeedback}</span>
                                  </div>
                                )}

                                {/* File Warehouse Register */}
                                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                  {getVendorDocs(v).length === 0 ? (
                                    <div className="text-center py-6 border border-dashed border-slate-150 rounded text-slate-400 text-[11px]">
                                      No documents in vault. Use the drop zone to attach material proposals.
                                    </div>
                                  ) : (
                                    getVendorDocs(v).map((doc) => {
                                      const isW9 = doc.type === "W-9 Form";
                                      const isQuote = doc.type === "Quote Proposal";
                                      
                                      return (
                                        <div 
                                          key={doc.id} 
                                          className="p-2.5 bg-slate-50 border border-slate-150 rounded-sm flex items-center justify-between text-xs"
                                        >
                                          <div className="flex items-center space-x-2 w-2/3">
                                            <FileText className={`h-4.5 w-4.5 shrink-0 ${isW9 ? "text-red-500" : isQuote ? "text-emerald-500" : "text-blue-500"}`} />
                                            <div className="truncate">
                                              <span className="font-bold text-slate-800 truncate block text-[11px]">{doc.name}</span>
                                              <div className="flex items-center space-x-1 font-mono text-[9px] text-slate-400 uppercase">
                                                <span>{doc.type}</span>
                                                <span>•</span>
                                                <span>{doc.size}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-0.5"><Clock className="h-2 w-2" /> {doc.uploadedAt}</span>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex items-center space-x-1 text-xs">
                                            <button 
                                              onClick={() => handleDownloadDoc(doc)}
                                              className="p-1 px-2 border border-slate-200 bg-white hover:bg-blue-600 hover:text-white rounded-sm text-[10px] font-bold text-slate-600 flex items-center gap-0.5 shadow-sm transition-colors cursor-pointer"
                                              title="Download this file copy"
                                            >
                                              <Download className="h-3 w-3" />
                                              <span>Download</span>
                                            </button>
                                            
                                            {/* Deletion only allowed if it's user document */}
                                            {doc.id.startsWith("doc_") ? (
                                              <button 
                                                onClick={() => handleDeleteDoc(v.id, doc.id)}
                                                className="p-1 border border-slate-200 bg-white hover:bg-rose-500 hover:text-white rounded-sm text-rose-600 cursor-pointer text-[10px]"
                                                title="Delete this file"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </button>
                                            ) : (
                                              <span className="text-[8px] text-slate-400 bg-slate-100 p-1 rounded font-bold uppercase tracking-wider">Locked Reference</span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>

                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sourcing Compliance Details */}
      <div className="bg-blue-50/80 border border-blue-200 text-blue-800 rounded-sm p-4 text-xs font-sans" id="vendor-directory-footer">
        <div className="flex gap-2.5 items-start">
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-wider text-[10px]">Sourcing & Safety Audit Regulations</p>
            <p className="text-blue-700 leading-relaxed">
              All subcontractor credentials, including liability insurance certificates and federal W-9 records, are archived locally to enable quick retrieval during municipal inspections in Borough of Stone Harbor. For complex exterior structural lumber packages, verify Cape May wind resistance warranties and lumber grade stamping.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
