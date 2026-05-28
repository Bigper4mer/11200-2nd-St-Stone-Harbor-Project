/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { loadState, saveState, resetState, validateState } from "./storage";
import { Rfq, Milestone, ActionItem, DashboardState } from "./types";
import { SEED_SUMMARY } from "./data";

// Named Imports from Lucide icons
import { 
  BarChart3, 
  Layers, 
  HelpCircle,
  FileSpreadsheet, 
  CalendarDays, 
  Users2, 
  Briefcase, 
  FileText, 
  AlertOctagon, 
  Settings2,
  Menu,
  X,
  RefreshCw,
  Building,
  TrendingDown
} from "lucide-react";

// Views modular components imports
import { OverviewView } from "./components/OverviewView";
import { BudgetView } from "./components/BudgetView";
import { RfqsView } from "./components/RfqsView";
import { ScheduleView } from "./components/ScheduleView";
import { VendorsView } from "./components/VendorsView";
import { ReportsView } from "./components/ReportsView";
import { DocumentsView } from "./components/DocumentsView";
import { RisksView } from "./components/RisksView";
import { SettingsView } from "./components/SettingsView";

export default function App() {
  // Core Local State derived from localStorage
  const [dashboardData, setDashboardData] = useState<DashboardState>(() => loadState());
  const [currentView, setCurrentView] = useState<string>("overview");
  const [importError, setImportError] = useState<string | null>(null);
  
  // Mobile responsive layout sidebar visibility toggling
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Sync edits to localStorage on write state changes
  useEffect(() => {
    saveState(dashboardData);
  }, [dashboardData]);

  // View actions handlers passed down to subcomponents
  const handleCreateRfq = (newRfq: Rfq) => {
    setDashboardData((prev) => ({
      ...prev,
      rfqs: [newRfq, ...prev.rfqs]
    }));
  };

  const handleDeleteRfq = (id: string) => {
    setDashboardData((prev) => ({
      ...prev,
      rfqs: prev.rfqs.filter((r) => r.id !== id)
    }));
  };

  const handleUpdateRfq = (id: string, fields: Partial<Rfq>) => {
    setDashboardData((prev) => {
      const updatedRfqs = prev.rfqs.map((rfq) => {
        if (rfq.id === id) {
          // Cast bid amount to number or leave empty
          const bidAmount = fields.bidAmount === undefined ? rfq.bidAmount : fields.bidAmount;
          return {
            ...rfq,
            ...fields,
            bidAmount
          };
        }
        return rfq;
      });
      return {
        ...prev,
        rfqs: updatedRfqs
      };
    });
  };

  const handleUpdateMilestone = (id: string, fields: Partial<Milestone>) => {
    setDashboardData((prev) => {
      const updatedMilestones = prev.milestones.map((m) => {
        if (m.id === id) {
          return { ...m, ...fields };
        }
        return m;
      });
      return {
        ...prev,
        milestones: updatedMilestones
      };
    });
  };

  const handleReorderMilestones = (reorderedMilestones: Milestone[]) => {
    setDashboardData((prev) => ({
      ...prev,
      milestones: reorderedMilestones
    }));
  };

  const handleUpdateActionStatus = (id: string, status: any) => {
    setDashboardData((prev) => {
      const updatedActions = prev.actions.map((act) => {
        if (act.id === id) {
          return { ...act, status };
        }
        return act;
      });
      return {
        ...prev,
        actions: updatedActions
      };
    });
  };

  // Systems administrative events (Settings interactions)
  const handleExportData = () => {
    const rawData = JSON.stringify(dashboardData, null, 2);
    const blob = new Blob([rawData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Create temp download link element
    const link = document.createElement("a");
    link.href = url;
    link.download = "stone-harbor-buyout-state.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (rawJson: string): boolean => {
    try {
      const parsed = JSON.parse(rawJson);
      const validationError = validateState(parsed);
      
      if (validationError) {
        setImportError(validationError);
        return false;
      }
      
      // Successfully passed schema validation, apply and reload state
      setDashboardData({
        rfqs: parsed.rfqs,
        milestones: parsed.milestones,
        actions: parsed.actions
      });
      setImportError(null);
      return true;
    } catch (e) {
      setImportError("Invalid JSON structure: The uploaded configuration could not be deciphered by the parser.");
      return false;
    }
  };

  const handleResetData = () => {
    const freshState = resetState();
    setDashboardData(freshState);
    setImportError(null);
  };

  // Sidebar Views Configuration Array
  const navigationItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "budget", label: "Budget", icon: Layers },
    { id: "rfqs", label: "RFQs", icon: FileSpreadsheet },
    { id: "schedule", label: "Schedule", icon: CalendarDays },
    { id: "vendors", label: "Vendors", icon: Users2 },
    { id: "reports", label: "Reports", icon: Briefcase },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "risks", label: "Issues & Risks", icon: AlertOctagon },
    { id: "settings", label: "Settings", icon: Settings2 }
  ];

  // Dynamically render sidebar view based on routing state
  const renderViewContent = () => {
    switch (currentView) {
      case "overview":
        return (
          <OverviewView 
            rfqs={dashboardData.rfqs}
            milestones={dashboardData.milestones}
            actions={dashboardData.actions}
            onUpdateActionStatus={handleUpdateActionStatus}
            onNavigateToView={(v) => setCurrentView(v)}
          />
        );
      case "budget":
        return <BudgetView />;
      case "rfqs":
        return (
          <RfqsView 
            rfqs={dashboardData.rfqs}
            onUpdateRfq={handleUpdateRfq}
            onCreateRfq={handleCreateRfq}
            onDeleteRfq={handleDeleteRfq}
          />
        );
      case "schedule":
        return (
          <ScheduleView 
            milestones={dashboardData.milestones}
            onUpdateMilestone={handleUpdateMilestone}
            onReorderMilestones={handleReorderMilestones}
          />
        );
      case "vendors":
        return <VendorsView rfqs={dashboardData.rfqs} onUpdateRfq={handleUpdateRfq} />;
      case "reports":
        return <ReportsView rfqs={dashboardData.rfqs} />;
      case "documents":
        return <DocumentsView rfqs={dashboardData.rfqs} />;
      case "risks":
        return <RisksView />;
      case "settings":
        return (
          <SettingsView 
            onExport={handleExportData}
            onImport={handleImportData}
            onReset={handleResetData}
            importError={importError}
            setImportError={setImportError}
          />
        );
      default:
        return <div className="text-sm font-sans p-4">Unknown view state index loaded.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans" id="app-root-frame">
      
      {/* Top Banner Header */}
      <header className="bg-white border-b border-slate-200 h-16 shrink-0 flex items-center justify-between px-6 z-40 sticky top-0" id="main-header">
        <div className="flex items-center space-x-3">
          {/* Mobile Hamburguer menu toggle button */}
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded hover:bg-slate-100 lg:hidden text-slate-600 focus:outline-none"
            aria-label="Toggle navigation menu"
            id="mobile-navigation-toggle"
          >
            {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <div className="flex items-center space-x-2.5">
            <div className="bg-[#0f172a] border border-[#1e293b] w-9 h-9 rounded-sm flex items-center justify-center text-blue-500 font-bold text-sm">
              SH
            </div>
            <div>
              <h1 className="text-[13px] font-bold text-slate-800 tracking-wider leading-4 uppercase">
                {SEED_SUMMARY.project}
              </h1>
              <p className="text-[9px] text-slate-400 font-bold font-sans uppercase tracking-[0.05em] leading-normal mt-[1px]">
                {SEED_SUMMARY.subtitle} • <span className="text-blue-500">{SEED_SUMMARY.phase}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Global summary metadata strip */}
        <div className="hidden md:flex items-center space-x-5 text-[11px] font-mono">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase leading-none font-sans font-bold">Current SOV Proposed</span>
            <span className="text-slate-900 font-bold block mt-0.5">${SEED_SUMMARY.currentSov.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 block text-[9px] uppercase leading-none font-sans font-bold">Email target Ceiling</span>
            <span className="text-slate-905 font-bold block mt-0.5">${SEED_SUMMARY.emailBudget.toLocaleString()}</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 block text-[9px] uppercase leading-none font-sans font-bold">Excess Buyout Gap</span>
            <span className="text-rose-600 font-bold flex items-center gap-1 mt-0.5">
              <span>${SEED_SUMMARY.budgetGap.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main layout flow */}
      <div className="flex flex-1 relative" id="layout-body-wrapper">
        
        {/* Left Side Navigation Sidebar Framework */}
        <aside 
          className={`bg-[#0f172a] text-slate-300 w-56 shrink-0 flex flex-col border-r border-[#1e293b] fixed inset-y-0 left-0 pt-16 lg:pt-0 lg:static z-35 transition-transform duration-200 overflow-y-auto transform ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
          id="left-navigation-sidebar"
        >
          {/* Sidebar Top Mini Brand Label */}
          <div className="p-4 border-b border-slate-700/50 hidden lg:block">
            <h2 className="text-xs font-bold tracking-widest text-white uppercase">Stone Harbor</h2>
            <p className="text-[10px] text-slate-400">Project Controls v1.0</p>
          </div>

          {/* Navigation link elements */}
          <nav className="py-4 space-y-0.5 flex-1" id="sidebar-navigator">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs transition-all cursor-pointer border-l-4 ${
                    isActive 
                      ? "bg-blue-600/10 border-blue-500 text-white font-medium" 
                      : "border-transparent hover:bg-slate-800 hover:text-white"
                  }`}
                  id={`nav-item-${item.id}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-white text-blue-400" : "text-slate-400 hover:text-slate-100"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Sourcing footer info */}
          <div className="p-4 bg-slate-900/50 flex items-center space-x-2 text-[10px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
            <span>Persisted LocalStorage</span>
          </div>
        </aside>

        {/* Mobile menu modal backdrop wrapper */}
        {mobileSidebarOpen && (
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/45 z-30 lg:hidden"
            id="sidebar-backdrop-shim"
          />
        )}

        {/* Dynamic Center Panel Work Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 overflow-y-auto" id="main-view-panel-container">
          {renderViewContent()}
        </main>

      </div>

    </div>
  );
}
