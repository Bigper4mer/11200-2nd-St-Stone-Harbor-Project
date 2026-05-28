/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Milestone, MilestoneStatus } from "../types";
import { 
  Calendar, 
  User, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MinusCircle, 
  HelpCircle,
  FileText,
  Info,
  GripVertical
} from "lucide-react";

interface ScheduleViewProps {
  milestones: Milestone[];
  onUpdateMilestone: (id: string, fields: Partial<Milestone>) => void;
  onReorderMilestones: (reorderedMilestones: Milestone[]) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ 
  milestones, 
  onUpdateMilestone,
  onReorderMilestones
}) => {
  // Drag and Drop State Controls
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Auto-Save Toast States
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear active timers on component unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (debouncedToastTimerRef.current) clearTimeout(debouncedToastTimerRef.current);
    };
  }, []);

  const triggerAutosaveToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const triggerAutosaveToastDebounced = (msg: string) => {
    if (debouncedToastTimerRef.current) {
      clearTimeout(debouncedToastTimerRef.current);
    }

    debouncedToastTimerRef.current = setTimeout(() => {
      triggerAutosaveToast(msg);
    }, 1200); // 1.2 second debounce to keypress events
  };

  const handleFieldUpdate = (id: string, fields: Partial<Milestone>) => {
    onUpdateMilestone(id, fields);

    const isDropdownOrDateStatus = "status" in fields || "start" in fields || "end" in fields;
    if (isDropdownOrDateStatus) {
      triggerAutosaveToast("Milestone parameters changed. State synced successfully.");
    } else {
      triggerAutosaveToastDebounced("Autosaved latest typing modifications to localStorage.");
    }
  };

  // Drag-and-Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === targetIndex) return;

    const newList = [...milestones];
    const itemToMove = newList[draggingIndex];
    newList.splice(draggingIndex, 1);
    newList.splice(targetIndex, 0, itemToMove);

    onReorderMilestones(newList);
    triggerAutosaveToast("Milestone sequence layout updated and auto-saved.");

    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-6 relative" id="schedule-view-container">
      
      {/* View Header */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="schedule-header">
        <div>
          <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">Project Schedule Milestone Timeline</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage long-lead buyout sequences, quote finalization constraints, and trade coordination milestones.
          </p>
        </div>
        
        {/* Stat strip summary */}
        <div className="flex gap-4 font-mono text-xs text-slate-600 bg-slate-50 flex-wrap p-3 rounded-sm border border-slate-150">
          <div>
            <span className="block text-[9px] uppercase text-slate-400 font-bold">Total Milestones</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">{milestones.length}</span>
          </div>
          <div className="w-px bg-slate-200" />
          <div>
            <span className="block text-[9px] uppercase text-slate-400 font-bold">Complete</span>
            <span className="font-bold text-emerald-600 text-sm mt-0.5 block">
              {milestones.filter(m => m.status === "Complete").length}
            </span>
          </div>
          <div className="w-px bg-slate-200" />
          <div>
            <span className="block text-[9px] uppercase text-slate-400 font-bold">At Risk / Blocked</span>
            <span className="font-bold text-rose-600 text-sm mt-0.5 block">
              {milestones.filter(m => m.status === "At risk" || m.status === "Blocked").length}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Left - Editable Interactive List, Right - Simple Timeline Indicator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="schedule-split-layout">
        
        {/* Left 8 columns: Compact Editable Milestone Form Table */}
        <div className="lg:col-span-8 bg-white rounded-sm border border-slate-200 overflow-hidden" id="milestones-table-card">
          <div className="p-4 border-b border-slate-150 bg-slate-50/50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 tracking-wider uppercase">Active Gantt Buyout Milestones</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Drag handle to reorder • Click fields to modify</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-150 uppercase font-mono text-[9px] tracking-wider">
                  <th className="py-2.5 px-3 w-[45px] text-center">Reorder</th>
                  <th className="py-2.5 px-4 w-[240px]">Milestone Scope / Notes</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3 min-w-[125px]">Start / End Date</th>
                  <th className="py-2.5 px-3 w-[120px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {milestones.map((milestone, index) => (
                  <tr 
                    key={milestone.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`transition-colors duration-150 ${
                      draggingIndex === index 
                        ? "opacity-30 bg-blue-50/35 border-y-2 border-dashed border-slate-300" 
                        : dragOverIndex === index
                          ? "bg-blue-50/80 border-t-2 border-b-2 border-blue-500 brightness-95"
                          : "hover:bg-slate-50/50"
                    }`}
                  >
                    {/* Drag Handle cell */}
                    <td className="py-3 px-3 text-center align-middle border-r border-slate-100">
                      <div 
                        className="flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-blue-600 transition-colors p-1"
                        title="Drag to rearrange milestone order"
                      >
                        <GripVertical className="h-4 w-4" />
                      </div>
                    </td>
                    
                    {/* Milestone Name, ID & Editable notes */}
                    <td className="py-3 px-4">
                      <div className="space-y-1.5" onDragStart={(e) => e.stopPropagation()}>
                        <div>
                          <span className="font-bold text-slate-800 text-xs block">{milestone.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono">ID: {milestone.id}</span>
                        </div>
                        <div>
                          <input 
                            type="text"
                            value={milestone.notes}
                            onChange={(e) => handleFieldUpdate(milestone.id, { notes: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[11px] text-slate-600 focus:bg-white focus:outline-none"
                            placeholder="Add milestone commentary or exclusion notes..."
                          />
                        </div>
                      </div>
                    </td>

                    {/* Owner Input */}
                    <td className="py-3 px-3">
                      <div className="relative" onDragStart={(e) => e.stopPropagation()}>
                        <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-slate-400 pointer-events-none">
                          <User className="h-3 w-3" />
                        </span>
                        <input
                          type="text"
                          value={milestone.owner}
                          onChange={(e) => handleFieldUpdate(milestone.id, { owner: e.target.value })}
                          className="w-full pl-5 pr-1 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </td>

                    {/* Start & End Dates */}
                    <td className="py-3 px-3 font-mono">
                      <div className="space-y-1 text-[10px]" onDragStart={(e) => e.stopPropagation()}>
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-400 min-w-[30px] uppercase text-[9px]">Start:</span>
                          <input 
                            type="date"
                            value={milestone.start}
                            onChange={(e) => handleFieldUpdate(milestone.id, { start: e.target.value })}
                            className="bg-slate-50 border border-slate-200 rounded p-[2px] w-full text-slate-800"
                          />
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-400 min-w-[30px] uppercase text-[9px]">End:</span>
                          <input 
                            type="date"
                            value={milestone.end}
                            onChange={(e) => handleFieldUpdate(milestone.id, { end: e.target.value })}
                            className="bg-slate-50 border border-slate-200 rounded p-[2px] w-full text-slate-800"
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Select dropdown */}
                    <td className="py-3 px-3">
                      <select
                        onDragStart={(e) => e.stopPropagation()}
                        value={milestone.status}
                        onChange={(e) => handleFieldUpdate(milestone.id, { status: e.target.value as MilestoneStatus })}
                        className={`w-full py-1 px-1.5 rounded text-[11px] font-semibold border ${
                          milestone.status === "Complete" 
                            ? "bg-slate-100 text-slate-600 border-slate-200" 
                            : milestone.status === "Blocked"
                              ? "bg-rose-50 text-rose-700 border-rose-200 font-bold"
                              : milestone.status === "At risk"
                                ? "bg-amber-50 text-amber-700 border-amber-200 font-semibold"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        <option value="On track">On track</option>
                        <option value="At risk">At risk</option>
                        <option value="Blocked">Blocked</option>
                        <option value="Complete">Complete</option>
                      </select>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 columns: Graphical Timeline Flow Display */}
        <div className="lg:col-span-4 bg-white rounded-sm border border-slate-200 p-5" id="timeline-flow-panel">
          <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-5">Milestone Roadmap Stream</h3>
          
          <div className="relative pl-6 space-y-6 before:absolute before:inset-y-0 before:left-2.5 before:w-0.5 before:bg-slate-100" id="roadmap-stream-list">
            {milestones.map((m) => {
              const isOnTrack = m.status === "On track";
              const isAtRisk = m.status === "At risk";
              const isBlocked = m.status === "Blocked";
              const isComplete = m.status === "Complete";

              return (
                <div key={m.id} className="relative text-xs">
                  {/* Circle Indicator */}
                  <div className={`absolute -left-6 top-1 rounded-full p-[2px] ring-4 ${
                    isComplete 
                      ? "bg-slate-400 ring-slate-50 text-white" 
                      : isBlocked
                        ? "bg-rose-600 ring-rose-50 text-white"
                        : isAtRisk
                          ? "bg-amber-500 ring-amber-50 text-white"
                          : "bg-blue-600 ring-blue-50 text-white"
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className="h-2.5 w-2.5" />
                    ) : isBlocked ? (
                      <AlertCircle className="h-2.5 w-2.5" />
                    ) : isAtRisk ? (
                      <Clock className="h-2.5 w-2.5" />
                    ) : (
                      <MinusCircle className="h-2.5 w-2.5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${isComplete ? "text-slate-400 line-through" : "text-slate-800"}`}>
                        {m.name}
                      </span>
                      <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.25 rounded ${
                        isComplete 
                          ? "bg-slate-100 text-slate-500" 
                          : isBlocked 
                            ? "bg-rose-100 text-rose-700" 
                            : isAtRisk 
                              ? "bg-amber-100 text-amber-700" 
                              : "bg-blue-100 text-blue-700"
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-500">
                      <span>Owner: <strong className="text-slate-700">{m.owner}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-slate-400">{m.start} to {m.end}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed flex gap-2">
            <Info className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Note: Critical buyout dates are verified against vendor capacity timelines and seasonal material Lead times.</span>
          </div>
        </div>

      </div>

      {/* Floating Auto-save Toast Indicator */}
      <div 
        className={`fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white border border-slate-700 p-3 px-4 rounded shadow-2xl flex items-center gap-3 text-xs font-sans transition-all duration-300 ease-out transform ${
          showToast 
            ? "translate-y-0 opacity-100 scale-100 pointer-events-auto" 
            : "translate-y-4 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-emerald-500 rounded-full p-1 text-white shrink-0">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-slate-200 uppercase tracking-wider text-[9px] font-mono leading-none">Autosave Status</p>
          <p className="text-[11px] text-slate-300 mt-1 font-medium">{toastMessage}</p>
        </div>
        <button 
          onClick={() => setShowToast(false)}
          className="text-slate-400 hover:text-white cursor-pointer ml-1 text-xs select-none p-1 font-bold"
          title="Dismiss status alert"
        >
          ✕
        </button>
      </div>

    </div>
  );
};
