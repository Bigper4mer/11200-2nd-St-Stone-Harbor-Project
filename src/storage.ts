/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DashboardState } from "./types";
import { SEED_RFQS, SEED_MILESTONES, SEED_ACTION_ITEMS } from "./data";

const STORAGE_KEY = "stone-harbor-project-dashboard:v1";

export function loadState(): DashboardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        rfqs: SEED_RFQS.map(r => ({ ...r })),
        milestones: SEED_MILESTONES.map(m => ({ ...m })),
        actions: SEED_ACTION_ITEMS.map(a => ({ ...a }))
      };
    }
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.rfqs) && Array.isArray(parsed.milestones) && Array.isArray(parsed.actions)) {
      // Ensure all fields exist
      const rfqs = parsed.rfqs.map((rfq: any) => {
        // Find matching budget category to keep targetPrice computed synchronously
        return {
          ...rfq,
          bidAmount: rfq.bidAmount === "" ? "" : Number(rfq.bidAmount)
        };
      });
      return {
        rfqs,
        milestones: parsed.milestones,
        actions: parsed.actions
      };
    }
  } catch (e) {
    console.error("Error loading state from localStorage", e);
  }
  return {
    rfqs: SEED_RFQS.map(r => ({ ...r })),
    milestones: SEED_MILESTONES.map(m => ({ ...m })),
    actions: SEED_ACTION_ITEMS.map(a => ({ ...a }))
  };
}

export function saveState(state: DashboardState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Error saving state to localStorage", e);
  }
}

export function resetState(): DashboardState {
  const defaultState: DashboardState = {
    rfqs: SEED_RFQS.map(r => ({ ...r })),
    milestones: SEED_MILESTONES.map(m => ({ ...m })),
    actions: SEED_ACTION_ITEMS.map(a => ({ ...a }))
  };
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Error clearing localStorage", e);
  }
  saveState(defaultState);
  return defaultState;
}

export function validateState(data: any): string | null {
  if (!data || typeof data !== "object") {
    return "Invalid data format. Must be a JSON object.";
  }
  if (!Array.isArray(data.rfqs)) {
    return "Missing or invalid 'rfqs' array.";
  }
  if (!Array.isArray(data.milestones)) {
    return "Missing or invalid 'milestones' array.";
  }
  if (!Array.isArray(data.actions)) {
    return "Missing or invalid 'actions' array.";
  }

  // Check structure check for first element
  if (data.rfqs.length > 0) {
    const r = data.rfqs[0];
    if (typeof r.id !== "string" || typeof r.vendor !== "string" || typeof r.package !== "string") {
      return "Invalid RFQ element schema. 'id', 'vendor', and 'package' are required text fields.";
    }
  }
  if (data.milestones.length > 0) {
    const m = data.milestones[0];
    if (typeof m.id !== "string" || typeof m.name !== "string" || typeof m.status !== "string") {
      return "Invalid Milestone element schema. 'id', 'name', and 'status' are required.";
    }
  }
  if (data.actions.length > 0) {
    const a = data.actions[0];
    if (typeof a.id !== "string" || typeof a.item !== "string" || typeof a.status !== "string") {
      return "Invalid Action Item element schema. 'id', 'item', and 'status' are required.";
    }
  }

  return null; // Passed validation
}
