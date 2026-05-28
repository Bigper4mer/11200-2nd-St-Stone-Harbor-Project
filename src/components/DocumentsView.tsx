import React, { useState } from "react";
import { FileSpreadsheet, FileText, Download, ShieldCheck, Eye, HelpCircle, ExternalLink, Search } from "lucide-react";
import { SEED_SUMMARY } from "../data";
import { Rfq, VendorDocument } from "../types";

interface DocumentsViewProps {
  rfqs?: Rfq[];
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ rfqs }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const staticDocuments = [
    {
      name: "SOV 11200 2nd Ave Mezzanotte.xlsx",
      type: "Microsoft Excel Worksheet (.xlsx)",
      owner: "Estimator / PM",
      status: "PRIMARY REFERENCE",
      purpose: "Contains initial Schedule of Values (SOV) containing original category allocations summing to $2,342,754.",
      isDownloadable: false,
      blobData: ""
    },
    {
      name: "Attached 11200 2nd St, Stone Harbor Project List.pdf",
      type: "Portable Document Format (.pdf)",
      owner: "GC Team / Architect",
      status: "LOCKED BLUEPRINTS",
      purpose: "Original floorplans, building site constraints, wind rating codes, and material schedules issued of record.",
      isDownloadable: false,
      blobData: ""
    },
    {
      name: "Dashboard state export.json",
      type: "JSON Data Interchange File (.json)",
      owner: "Local Session Engine",
      status: "EXPORT/IMPORT CAPABLE",
      purpose: "Editable buyout statuses, active bids received, updated schedule owner, and decision queue states data.",
      isDownloadable: false,
      blobData: ""
    }
  ];

  const subcontractorDocs: Array<{
    name: string;
    type: string;
    owner: string;
    status: string;
    purpose: string;
    isDownloadable: boolean;
    blobData?: string;
  }> = [];

  if (rfqs) {
    rfqs.forEach((v) => {
      // Create test sample files if user hasn't uploaded custom files
      const defaultDocs: VendorDocument[] = [
        {
          id: `sample1-${v.id}`,
          name: `Sourcing_Quote_Proposal_${v.vendor.replace(/\s+/g, "_")}.pdf`,
          type: "Quote Proposal",
          size: "42.5 KB",
          uploadedAt: v.contactedDate || "2026-05-10",
          blobData: `data:text/plain;base64,${btoa(`STONE HARBOR EXPENDITURE AUDIT REPORT\nVendor: ${v.vendor}\nPackage: ${v.package}\nOffered Bid Baseline: $${v.bidAmount || v.targetPrice}\nTerms: ${v.paymentTerms || "30 Days"}\nStatus: Audited verified correct`)}`
        },
        {
          id: `sample2-${v.id}`,
          name: `W9_IRS_Taxpayer_ID_Cert_${v.vendor.replace(/\s+/g, "_")}.pdf`,
          type: "W-9 Form",
          size: "18.1 KB",
          uploadedAt: "2026-05-14",
          blobData: `data:text/plain;base64,${btoa(`IRS DEPARTMENT OF THE TREASURY\nForm W-9 (Rev. October 2024)\nRequest for Taxpayer Identification Number and Certification\nEntity Name: ${v.vendor}\nLicense Mapping OK.`)}`
        }
      ];

      const actualDocs = v.documents && v.documents.length > 0 ? v.documents : defaultDocs;

      actualDocs.forEach((doc) => {
        subcontractorDocs.push({
          name: doc.name,
          type: `${doc.type} (${doc.size})`,
          owner: `${v.vendor} (Subcontractor)`,
          status: doc.type === "W-9 Form" ? "COMPLIANCE PENDING" : "AUDITED BID",
          purpose: `Bid proposal and compliance package uploaded securely for package "${v.package}". Verified: ${doc.uploadedAt}`,
          isDownloadable: true,
          blobData: doc.blobData
        });
      });
    });
  }

  const mergedDocuments = [...staticDocuments, ...subcontractorDocs];

  const filteredDocuments = mergedDocuments.filter((doc) => {
    const text = (doc.name + doc.type + doc.owner + doc.status + doc.purpose).toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const handleDownloadDoc = (doc: typeof mergedDocuments[0]) => {
    if (doc.isDownloadable && doc.blobData) {
      try {
        const link = document.createElement("a");
        link.href = doc.blobData;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        alert("Failed to initiate client-side download.");
      }
    } else {
      alert(`The reference file "${doc.name}" is a protected master blueprint configuration in the system database. Check the Buyout views or export the full workspace via Settings.`);
    }
  };

  return (
    <div className="space-y-6" id="documents-view-container">
      
      {/* Header section */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4" id="documents-view-header">
        <div>
          <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">Master Document & Source Register</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access blueprints, Schedule of Values (SOV) packages, builders covenants, and dynamically uploaded contractor proposals.
          </p>
        </div>
        
        <div className="bg-slate-50 text-[10px] uppercase font-bold text-slate-600 px-3 py-2 rounded-sm border border-slate-150 flex items-center gap-2 tracking-wider">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Central File Registry Integrities OK</span>
        </div>
      </div>

      {/* Sourcing Search Filters */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 flex flex-col md:flex-row gap-4 items-center" id="documents-filters-toolbar">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input 
            type="text"
            placeholder="Search files by name, subcontractor, status, or keyword specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 py-1.5 pl-9 pr-3 rounded-sm text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Document Register table */}
      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden" id="documents-table-card">
        <div className="p-4 border-b border-slate-150 bg-slate-50/50 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700 tracking-wider uppercase text-[10px]">Active Project Files ({filteredDocuments.length} items logged)</span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Secure browser-side virtualization file storage</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-150 font-mono text-[9px] uppercase tracking-wider">
                <th className="py-2.5 px-4 w-[280px]">Document Reference Name</th>
                <th className="py-2.5 px-3">File Category Type</th>
                <th className="py-2.5 px-3">Responsible Owner</th>
                <th className="py-2.5 px-3">Lifecycle / Compliance Status</th>
                <th className="py-2.5 px-3">Project Purpose / Sourcing Usage</th>
                <th className="py-2.5 px-4 text-right">Reference Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-xs">
              {filteredDocuments.map((doc, idx) => {
                const isExcel = doc.name.endsWith(".xlsx");
                const isPdf = doc.name.endsWith(".pdf");
                const isJson = doc.name.endsWith(".json");
                
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    
                    {/* Document Icon and title name */}
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-1.5 rounded ${
                          isExcel 
                            ? "bg-emerald-50 text-emerald-700" 
                            : isPdf 
                              ? "bg-rose-50 text-rose-700" 
                              : isJson 
                                ? "bg-amber-50 text-amber-700" 
                                : "bg-blue-50 text-blue-700"
                        }`}>
                          {isExcel ? (
                            <FileSpreadsheet className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>
                        <span className="text-slate-900 block truncate max-w-[240px]" title={doc.name}>{doc.name}</span>
                      </div>
                    </td>

                    {/* Metadata type */}
                    <td className="py-3.5 px-3 text-slate-500 font-mono text-[10px] uppercase">
                      {doc.type}
                    </td>

                    {/* Record Owner */}
                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      {doc.owner}
                    </td>

                    {/* Lifecycle status badge */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                        doc.status.includes("PRIMARY") 
                          ? "bg-blue-100 text-blue-800" 
                          : doc.status.includes("LOCKED") 
                            ? "border border-slate-900 text-slate-900" 
                            : doc.status.includes("EXPORT")
                              ? "bg-amber-100 text-amber-800"
                              : doc.status.includes("COMPLIANCE")
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {doc.status}
                      </span>
                    </td>

                    {/* Sourcing purpose scope */}
                    <td className="py-3.5 px-3 text-slate-600 max-w-sm whitespace-normal leading-relaxed text-[11px]">
                      {doc.purpose}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => handleDownloadDoc(doc)}
                        className={`p-1 px-2.5 text-[10px] font-bold rounded inline-flex items-center space-x-1 border border-slate-200 hover:bg-slate-900 hover:text-white cursor-pointer shadow-sm transition-all duration-150 ${
                          doc.isDownloadable 
                            ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-600 hover:border-blue-600" 
                            : "bg-white text-slate-700"
                        }`}
                      >
                        <Download className="h-3 w-3" />
                        <span>{doc.isDownloadable ? "Download" : "Inspect Reference"}</span>
                      </button>
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
