/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Rfq, RfqStatus, Priority } from "../types";
import { SEED_BUDGET_CATEGORIES } from "../data";
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Phone, 
  TrendingDown, 
  AlertTriangle, 
  Check, 
  DollarSign, 
  Info, 
  Calendar,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  Undo2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";

interface RfqsViewProps {
  rfqs: Rfq[];
  onUpdateRfq: (id: string, fields: Partial<Rfq>) => void;
  onCreateRfq: (rfq: Rfq) => void;
  onDeleteRfq: (id: string) => void;
}

export const RfqsView: React.FC<RfqsViewProps> = ({ rfqs, onUpdateRfq, onCreateRfq, onDeleteRfq }) => {
  // Local state for searching & filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Create Subcontractor form state variables
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVendor, setNewVendor] = useState("");
  const [newPackage, setNewPackage] = useState(SEED_BUDGET_CATEGORIES[0]?.package || "");
  const [newCategory, setNewCategory] = useState(SEED_BUDGET_CATEGORIES[0]?.strategy || "Structural Sourcing");
  const [newPriority, setNewPriority] = useState<Priority>("Medium");
  const [newTargetPrice, setNewTargetPrice] = useState<number | "">(SEED_BUDGET_CATEGORIES[0]?.targetPrice || "");
  const [newBidAmount, setNewBidAmount] = useState<number | "">("");
  const [newStatus, setNewStatus] = useState<RfqStatus>("Not contacted");
  const [newPhone, setNewPhone] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("https://www.google.com");
  const [newNotes, setNewNotes] = useState("");
  const [newLeadTime, setNewLeadTime] = useState("");
  const [newPaymentTerms, setNewPaymentTerms] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Customize Subcontractor inline editor state
  const [editingRfqId, setEditingRfqId] = useState<string | null>(null);
  const [editVendor, setEditVendor] = useState("");
  const [editPackage, setEditPackage] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("Medium");
  const [editTargetPrice, setEditTargetPrice] = useState<number | "">("");

  // Delete safety check state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Auto-fill target price and strategy when choosing package
  const handlePackageChange = (pkg: string) => {
    setNewPackage(pkg);
    const matchedCategory = SEED_BUDGET_CATEGORIES.find(c => c.package === pkg);
    if (matchedCategory) {
      setNewTargetPrice(matchedCategory.targetPrice);
      setNewCategory(matchedCategory.strategy || matchedCategory.section);
    }
  };

  // Submit Handler for Add Form
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.trim()) {
      setFormError("Subcontractor vendor name is required.");
      return;
    }
    if (newTargetPrice === "" || isNaN(Number(newTargetPrice))) {
      setFormError("Please enter a valid numeric target price.");
      return;
    }

    const newRfqId = `rfq-${newVendor.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
    const newRfqItem: Rfq = {
      id: newRfqId,
      vendor: newVendor.trim(),
      package: newPackage,
      category: newCategory.trim() || "Sourcing Scope Details",
      priority: newPriority,
      targetPrice: Number(newTargetPrice),
      contactedDate: "",
      dueDate: "2026-06-02",
      bidAmount: newBidAmount === "" ? "" : Number(newBidAmount),
      leadTime: newLeadTime,
      paymentTerms: newPaymentTerms,
      status: newStatus,
      notes: newNotes.trim(),
      phone: newPhone.trim(),
      sourceUrl: newSourceUrl.trim() || "https://www.google.com"
    };

    onCreateRfq(newRfqItem);

    // Reset Form fields
    setNewVendor("");
    setNewPhone("");
    setNewNotes("");
    setNewLeadTime("");
    setNewPaymentTerms("");
    setNewBidAmount("");
    setFormError(null);
    setShowAddForm(false);
  };

  // Start Inline Editing Mode
  const startEditing = (rfq: Rfq) => {
    setEditingRfqId(rfq.id);
    setEditVendor(rfq.vendor);
    setEditPackage(rfq.package);
    setEditCategory(rfq.category);
    setEditPriority(rfq.priority);
    setEditTargetPrice(rfq.targetPrice);
  };

  // Save Inline Customizations
  const saveCustomizations = (id: string) => {
    if (!editVendor.trim()) {
      alert("Vendor name is required.");
      return;
    }
    const targetVal = editTargetPrice === "" ? 0 : Number(editTargetPrice);
    onUpdateRfq(id, {
      vendor: editVendor.trim(),
      package: editPackage,
      category: editCategory.trim(),
      priority: editPriority,
      targetPrice: targetVal
    });
    setEditingRfqId(null);
  };

  // Get distinct packages for filtering dropdown
  const uniquePackages = Array.from(new Set(rfqs.map(r => r.package))).sort();
  const statuses: RfqStatus[] = ["Not contacted", "Contacted", "Quotes due", "Evaluating", "Awarded", "Declined"];

  // Filter the RFQs
  const filteredRfqs = rfqs.filter(rfq => {
    const matchesSearch = rfq.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rfq.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPackage = selectedPackage === "All" || rfq.package === selectedPackage;
    const matchesStatus = selectedStatus === "All" || rfq.status === selectedStatus;
    return matchesSearch && matchesPackage && matchesStatus;
  });

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handeBidAmountChange = (id: string, value: string) => {
    if (value === "") {
      onUpdateRfq(id, { bidAmount: "" });
    } else {
      const parsed = Number(value);
      if (!isNaN(parsed)) {
        onUpdateRfq(id, { bidAmount: parsed });
      }
    }
  };

  return (
    <div className="space-y-6" id="rfqs-view-container">
      
      {/* Header and Controls */}
      <div className="bg-white border border-slate-200 rounded-sm p-5" id="rfqs-search-controls-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">RFQ Commercial Bid Management</h2>
            <p className="text-xs text-slate-500 mt-1">
              Analyze bid proposal returns, coordinate contractor leads, and verify pricing deltas.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setFormError(null);
              }}
              className="cursor-pointer flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-sm transition-all shadow-xs"
              title="Add a new subcontractor profile to this project session"
            >
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{showAddForm ? "Close Form" : "Add Subcontractor"}</span>
            </button>

            <div className="hidden lg:flex text-xs font-mono bg-slate-50 border border-slate-150 px-3 py-2 rounded-sm items-center gap-2 text-slate-600">
              <Info className="h-4 w-4 text-blue-500" />
              <span>Target comparator budget is persistent.</span>
            </div>
          </div>
        </div>

        {/* Collapsible Add Subcontractor Form Block */}
        {showAddForm && (
          <div className="bg-slate-50/35 border border-slate-200/80 rounded p-4 mt-4 space-y-4 shadow-inner" id="add-subcontractor-form-container">
            <div className="flex items-center justify-between border-b border-slate-150 pb-2">
              <div className="flex items-center space-x-2">
                <span className="p-1 px-1.5 bg-blue-50 text-blue-600 rounded">
                  <Plus className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                    Register New Subcontractor Sourcing Scope
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Establish a new subcontractor profile and map it against a baseline budget package category.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded text-xs flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Vendor & General Fields */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-500">Subcontractor Vendor Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Shoreline Electric LLC"
                    value={newVendor}
                    onChange={(e) => setNewVendor(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-500">Sourcing Package Category *</label>
                  <select
                    value={newPackage}
                    onChange={(e) => handlePackageChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {SEED_BUDGET_CATEGORIES.map(c => (
                      <option key={c.package} value={c.package}>{c.package}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-500">Core Scope Details</label>
                  <input 
                    type="text"
                    placeholder="e.g. Foundation, structural wall and floor waterproofing"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Pricing, Priority, Initial Status */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-500">Target Budget Capacity ($) *</label>
                  <input 
                    type="number"
                    required
                    placeholder="e.g. 75000"
                    value={newTargetPrice}
                    onChange={(e) => setNewTargetPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-500">Quoted Bid Amount ($ - Optional)</label>
                  <input 
                    type="number"
                    placeholder="Leave blank if pending review"
                    value={newBidAmount}
                    onChange={(e) => setNewBidAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-500">Subcontractor Engagement Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as RfqStatus)}
                    className="w-full bg-white border border-slate-200 rounded py-1.5 px-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Not contacted">Not contacted</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Quotes due">Quotes due</option>
                    <option value="Evaluating">Evaluating</option>
                    <option value="Awarded">Awarded</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>

                {/* Auxiliary fields */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-500">Sourcing Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full bg-white border border-slate-200 rounded py-1.5 px-2 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-500">Phone Contact</label>
                  <input 
                    type="text"
                    placeholder="e.g. 609-555-4122"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-500">URL / Website Link</label>
                  <input 
                    type="text"
                    placeholder="e.g. https://www.google.com"
                    value={newSourceUrl}
                    onChange={(e) => setNewSourceUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="cursor-pointer px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 bg-white text-slate-600 rounded-sm font-bold text-[10px] uppercase font-mono"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="cursor-pointer px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-sm font-bold text-[10px] uppercase font-mono flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Register Subcontractor
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100" id="rfq-filter-toolbar">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input 
              type="text"
              placeholder="Search vendor or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-55 border border-slate-200 rounded-sm text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap uppercase">Package:</span>
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-sm py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Scope Packages ({uniquePackages.length})</option>
              {uniquePackages.map(pkg => (
                <option key={pkg} value={pkg}>{pkg}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap uppercase">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-sm py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All statuses ({statuses.length})</option>
              {statuses.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main RFQ Interactive Tracker */}
      <div className="bg-white rounded-sm border border-slate-200 overflow-hidden" id="rfqs-main-table-container">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">Active RFQs ({filteredRfqs.length} listed)</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Edits preserve automatically on local session environment</span>
        </div>

        {filteredRfqs.length === 0 ? (
          <div className="text-center py-16 px-4" id="rfq-empty-state">
            <XCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700">No Match Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Your search term "{searchTerm}" and filter combination didn't match any of the seeded 19 RFQ records. Revise settings or search parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-150 font-mono text-[9px] uppercase tracking-wider">
                  <th className="py-2.5 px-4 min-w-[200px]">Subcontractor Lead</th>
                  <th className="py-2.5 px-3 min-w-[150px]">Package Scope Details</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Audit target</th>
                  <th className="py-2.5 px-3 min-w-[120px]">RFQ Bid amount ($)</th>
                  <th className="py-2.5 px-3">Delta vs Target</th>
                  <th className="py-2.5 px-3 min-w-[320px]">RFQ Management Controls (Editable Fields)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 align-top">
                {filteredRfqs.map((rfq) => {
                  const bidNum = rfq.bidAmount === "" ? null : Number(rfq.bidAmount);
                  const hasBid = bidNum !== null && !isNaN(bidNum);
                  const delta = hasBid ? (bidNum as number) - rfq.targetPrice : 0;
                  const isFavorable = delta <= 0;
                  const isCurrentlyEditing = editingRfqId === rfq.id;

                  return (
                    <tr 
                      key={rfq.id} 
                      className={`transition-colors ${
                        isCurrentlyEditing 
                          ? "bg-blue-50/15 hover:bg-blue-50/25 border-l-2 border-blue-600 font-medium" 
                          : "hover:bg-slate-50/40"
                      }`}
                    >
                      
                      {/* Subcontractor Meta Column */}
                      <td className="py-3 px-4">
                        {isCurrentlyEditing ? (
                          <div className="space-y-2.5 min-w-[200px]">
                            <div>
                              <label className="block text-[8px] uppercase tracking-wider text-blue-700 font-bold font-mono">Vendor Name *</label>
                              <input 
                                type="text"
                                value={editVendor}
                                onChange={(e) => setEditVendor(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-blue-400 rounded text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Phone Contact</label>
                              <input 
                                type="text"
                                value={rfq.phone || ""}
                                onChange={(e) => onUpdateRfq(rfq.id, { phone: e.target.value })}
                                placeholder="Phone"
                                className="w-full px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Website URL</label>
                              <input 
                                type="text"
                                value={rfq.sourceUrl || ""}
                                onChange={(e) => onUpdateRfq(rfq.id, { sourceUrl: e.target.value })}
                                placeholder="Website Link"
                                className="w-full px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-650 focus:outline-none"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-slate-800 text-xs">{rfq.vendor}</span>
                              <a 
                                href={rfq.sourceUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                title="Audit Vendor Source Link"
                                className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                            <span className="block text-[10px] text-slate-400 font-mono tracking-tight">{rfq.id}</span>
                            
                            {rfq.phone && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1.5 font-mono">
                                <Phone className="h-2.5 w-2.5 text-slate-400" />
                                <span>{rfq.phone}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Package Scope Details Column */}
                      <td className="py-3 px-3">
                        {isCurrentlyEditing ? (
                          <div className="space-y-2 min-w-[200px]">
                            <div>
                              <label className="block text-[8px] uppercase tracking-wider text-blue-700 font-bold font-mono">Scope Package</label>
                              <select
                                value={editPackage}
                                onChange={(e) => setEditPackage(e.target.value)}
                                className="w-full bg-white border border-blue-250 py-1 px-1.5 rounded text-[11px] text-slate-800 focus:outline-none"
                              >
                                {SEED_BUDGET_CATEGORIES.map(c => (
                                  <option key={c.package} value={c.package}>{c.package}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Scope Specifics</label>
                              <input 
                                type="text"
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[11px] text-slate-700 focus:outline-none"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="block font-semibold text-slate-700">{rfq.package}</span>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{rfq.category}</p>
                          </div>
                        )}
                      </td>

                      {/* Priority Tag Column */}
                      <td className="py-3 px-3">
                        {isCurrentlyEditing ? (
                          <div className="space-y-1">
                            <label className="block text-[8px] uppercase tracking-wider text-blue-700 font-bold font-mono text-center">Priority</label>
                            <select
                              value={editPriority}
                              onChange={(e) => setEditPriority(e.target.value as Priority)}
                              className="bg-white border border-blue-200 py-0.5 px-1 rounded text-xs text-slate-800"
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </div>
                        ) : (
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            rfq.priority === "High"
                              ? "bg-amber-100 text-amber-800 font-bold"
                              : rfq.priority === "Medium"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                          }`}>
                            {rfq.priority}
                          </span>
                        )}
                      </td>

                      {/* Package Target Price Column */}
                      <td className="py-3 px-3 font-mono text-slate-600 font-medium whitespace-nowrap">
                        {isCurrentlyEditing ? (
                          <div className="space-y-1">
                            <label className="block text-[8px] uppercase tracking-wider text-blue-700 font-bold font-mono">Target ($)</label>
                            <input 
                              type="number"
                              value={editTargetPrice}
                              onChange={(e) => setEditTargetPrice(e.target.value === "" ? "" : Number(e.target.value))}
                              className="w-24 px-1.5 py-0.5 bg-white border border-blue-250 rounded text-xs font-mono font-bold text-slate-850 focus:outline-none"
                            />
                          </div>
                        ) : (
                          formatUSD(rfq.targetPrice)
                        )}
                      </td>

                      {/* Bid Amount Input (Editable) */}
                      <td className="py-3 px-3">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400 pointer-events-none font-semibold">
                            $
                          </span>
                          <input 
                            type="number"
                            placeholder="Pending"
                            value={rfq.bidAmount}
                            onChange={(e) => handeBidAmountChange(rfq.id, e.target.value)}
                            className="w-full pl-5 pr-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white"
                          />
                        </div>
                      </td>

                      {/* Realtime Delta Calculator display */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {hasBid ? (
                          <div className="space-y-0.5">
                            <span className={`font-mono font-bold text-xs ${isFavorable ? "text-emerald-600" : "text-rose-600"}`}>
                              {isFavorable ? "" : "+"}{formatUSD(delta)}
                            </span>
                            <span className={`block text-[9px] font-semibold ${isFavorable ? "text-emerald-500" : "text-rose-400"}`}>
                              {isFavorable ? "UNDER BUDGET" : "GAP OVER TARGET"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">No Bid Yet</span>
                        )}
                      </td>

                      {/* Complete RFQ control panel form (Inline fields) */}
                      <td className="py-3 px-3 border-l border-slate-50">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          
                          {/* Status and dates select controls */}
                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase font-semibold text-slate-400">Status</label>
                            <select
                              value={rfq.status}
                              onChange={(e) => onUpdateRfq(rfq.id, { status: e.target.value as RfqStatus })}
                              className="w-full bg-slate-50 border border-slate-200 py-0.5 px-1.5 rounded text-[11px] text-slate-800"
                            >
                              <option value="Not contacted">Not contacted</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Quotes due">Quotes due</option>
                              <option value="Evaluating">Evaluating</option>
                              <option value="Awarded">Awarded</option>
                              <option value="Declined">Declined</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase font-semibold text-slate-400">Contact Date</label>
                            <input 
                              type="date"
                              value={rfq.contactedDate}
                              onChange={(e) => onUpdateRfq(rfq.id, { contactedDate: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 py-0.5 px-1 rounded text-[10px] text-slate-800 font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase font-semibold text-slate-400">Due Date</label>
                            <input 
                              type="date"
                              value={rfq.dueDate}
                              onChange={(e) => onUpdateRfq(rfq.id, { dueDate: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 py-0.5 px-1 rounded text-[10px] text-slate-800 font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase font-semibold text-slate-400">Lead time</label>
                            <input 
                              type="text"
                              placeholder="e.g. 4-6 weeks"
                              value={rfq.leadTime}
                              onChange={(e) => onUpdateRfq(rfq.id, { leadTime: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 py-0.5 px-1.5 rounded text-[11px] text-slate-800"
                            />
                          </div>

                          <div className="col-span-2 space-y-1">
                            <label className="block text-[9px] uppercase font-semibold text-slate-400">Payment terms</label>
                            <input 
                              type="text"
                              placeholder="e.g. 30% deposit, progress milestones"
                              value={rfq.paymentTerms}
                              onChange={(e) => onUpdateRfq(rfq.id, { paymentTerms: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 py-0.5 px-1.5 rounded text-[11px] text-slate-800"
                            />
                          </div>

                          <div className="col-span-2 space-y-1">
                            <label className="block text-[9px] uppercase font-semibold text-slate-400">Sourcing / Handover Notes</label>
                            <textarea 
                              rows={1}
                              placeholder="Add screening comments, exclusions or alternates..."
                              value={rfq.notes}
                              onChange={(e) => onUpdateRfq(rfq.id, { notes: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 py-1 px-1.5 rounded text-[11px] text-slate-800 resize-none"
                            />
                          </div>

                          {/* Interactive Metadata Edit Controls & Removal Triggers */}
                          <div className="col-span-2 border-t border-slate-100 pt-2.5 mt-1.5 flex items-center justify-between gap-2">
                            {isCurrentlyEditing ? (
                              <div className="w-full flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingRfqId(null)}
                                  className="px-2 py-1 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-sm text-[10px] uppercase font-mono font-bold flex items-center gap-1.5"
                                >
                                  <Undo2 className="h-3 w-3" />
                                  <span>Cancel</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => saveCustomizations(rfq.id)}
                                  className="px-2.5 py-1 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-[10px] uppercase font-mono font-bold flex items-center gap-1.5 shadow-xs animate-pulse"
                                >
                                  <Save className="h-3 w-3" />
                                  <span>Save Core</span>
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditing(rfq)}
                                  className="px-2 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 rounded-sm text-[10px] uppercase font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Customize subcontractor core credentials (name, scope, category, base target price)"
                                >
                                  <Edit2 className="h-3 w-3 text-blue-500" />
                                  <span>Customize Core</span>
                                </button>

                                {confirmDeleteId === rfq.id ? (
                                  <div className="flex items-center gap-1 animate-fadeIn">
                                    <span className="text-[9px] text-rose-600 font-bold font-mono">Confirm?</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onDeleteRfq(rfq.id);
                                        setConfirmDeleteId(null);
                                      }}
                                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xs text-[9px] uppercase font-bold cursor-pointer font-mono"
                                      title="Permanently remove subcontractor profile"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xs text-[9px] uppercase font-bold cursor-pointer font-mono"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(rfq.id)}
                                    className="px-2 py-1 text-slate-400 hover:text-rose-650 hover:bg-rose-50/45 rounded-sm text-[10px] uppercase font-mono font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                    title="De-register subcontractor scope item"
                                  >
                                    <Trash2 className="h-3 w-3 text-slate-400 hover:text-rose-600" />
                                    <span>Remove</span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
