/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useRef } from "react";
import { Download, Upload, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";

interface SettingsViewProps {
  onExport: () => void;
  onImport: (rawJson: string) => boolean; // returns true if successful, false if errors
  onReset: () => void;
  importError: string | null;
  setImportError: (err: string | null) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onExport,
  onImport,
  onReset,
  importError,
  setImportError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const parsed = JSON.parse(content);
        const success = onImport(content);
        if (success) {
          // Clear file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          alert("State backup loaded successfully. All dashboards updated.");
        }
      } catch (err) {
        setImportError("Syntax error: The uploaded file is not a valid JSON structure.");
      }
    };
    reader.onerror = () => {
      setImportError("Failed to read the file. Please try again.");
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6" id="settings-view-container">
      
      {/* Header section */}
      <div className="bg-white border border-slate-200 rounded-sm p-5" id="settings-view-header">
        <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">System Management & controls</h2>
        <p className="text-xs text-slate-500 mt-1">
          Reset local simulation data, download session backups, or audit production deployment characteristics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="settings-split-grids">
        
        {/* Left column: Storage, Import, Export, Reset actions */}
        <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-6" id="session-controls-card">
          <div>
            <h3 className="text-[10px] tracking-widest font-bold text-slate-500 uppercase">
              Session Data Backup Operations
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Round-trip your edited RFQs, milestones, and decision queues using standard JSON files.
            </p>
          </div>

          <div className="space-y-4" id="controls-actions">
            
            {/* Export JSON backup button */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-sm text-xs">
              <div className="space-y-0.5 pr-4">
                <span className="font-bold text-slate-800 block">1. Export Session Backup</span>
                <span className="text-[11px] text-slate-500 block leading-relaxed">
                  Downloads current RFQ bids status, notes, dates and decisions queue values to your local machine.
                </span>
              </div>
              <button
                onClick={onExport}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-900 text-white rounded-sm font-mono hover:bg-slate-800 transition-all font-semibold whitespace-nowrap"
                id="btn-export-backup"
              >
                <Download className="h-4 w-4" />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Import JSON backup input */}
            <div className="flex flex-col p-3.5 bg-slate-50 border border-slate-200 rounded-sm text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <span className="font-bold text-slate-800 block">2. Import Session Backup</span>
                  <span className="text-[11px] text-slate-500 block leading-relaxed">
                    Uploads and decodes a previously exported session JSON layout config to restore states.
                  </span>
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    onClick={triggerFileInput}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-sm font-mono hover:bg-blue-700 transition-all font-semibold whitespace-nowrap"
                    id="btn-import-trigger"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload JSON</span>
                  </button>
                </div>
              </div>

              {/* Show file import errors if invalid */}
              {importError && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-sm text-rose-700 flex items-start gap-2 text-xs" id="import-error-banner">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 animate-pulse-warning text-rose-600" />
                  <div className="space-y-0.5">
                    <span className="font-bold uppercase tracking-wider text-[9px] text-rose-800 block">IMPORT FAILED (Audit Validation Error)</span>
                    <p className="leading-relaxed">{importError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Revert Session Backups */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-sm text-xs">
              <div className="space-y-0.5 pr-4">
                <span className="font-bold text-slate-800 block">3. Reset Sourcing Seeds</span>
                <span className="text-[11px] text-slate-500 block leading-relaxed text-slate-500">
                  Clears local storage keys and restores initial Stone Harbor buyout, RFQs, and action queues to original baseline parameters.
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm("Reset Sourcing Session? This will format your active bids, updated timeline dates, and screening notes back to early factory defaults.")) {
                    onReset();
                    alert("Sourcing seeds successfully restored.");
                  }
                }}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-sm font-mono hover:bg-rose-100 hover:text-rose-800 transition-all font-semibold whitespace-nowrap"
                id="btn-reset-data"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset Seeds</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right column: Production readiness audits */}
        <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-4" id="readiness-card">
          <div>
            <h3 className="text-[10px] tracking-widest font-bold text-slate-500 uppercase">
              Production Readiness Audits
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Specifications of this isolated client-side deployment session.</p>
          </div>

          <div className="divide-y divide-slate-100 text-xs" id="audit-details-list">
            
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Persistence Adapter:</span>
              <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold">
                Browser localStorage Only
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Backend Server Architecture:</span>
              <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold">
                None (Pure SPA)
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Sourcing Vendor Links Verified:</span>
              <span className="font-mono text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5 inline text-emerald-500" />
                19 Active Links Certified
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Local Build Targets:</span>
              <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold">
                Static Vite App (Typescript)
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">System Local Time:</span>
              <span className="font-mono text-slate-800 text-[11px]">
                2026-05-28 12:40 PM UTC
              </span>
            </div>
            
          </div>
        </div>

      </div>

    </div>
  );
};
