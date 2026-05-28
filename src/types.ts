/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = "High" | "Medium" | "Low";
export type RfqStatus = "Not contacted" | "Contacted" | "Quotes due" | "Evaluating" | "Awarded" | "Declined";
export type MilestoneStatus = "On track" | "At risk" | "Blocked" | "Complete";
export type ActionStatus = "Open" | "In progress" | "Complete" | "Blocked";

export interface BudgetCategory {
  section: string;
  package: string;
  baseline: number;
  targetPrice: number;
  savingsLow: number;
  savingsHigh: number;
  strategy: string;
}

export interface VendorDocument {
  id: string;
  name: string;
  type: string; // "Quote Proposal" | "Insurance Cert" | "W-9 Form" | "Contract Draft" | "License Copy" | "Other"
  size: string;
  uploadedAt: string;
  blobData?: string; // Text contents or metadata mock
}

export interface VendorDetails {
  email?: string;
  licenseNumber?: string;
  liabilityInsurance?: string;
  businessAddress?: string;
  insuranceExpiry?: string;
}

export interface Rfq {
  id: string;
  package: string;
  vendor: string;
  category: string;
  sourceUrl: string;
  phone: string;
  priority: Priority;
  targetPrice: number; // Derived from matching budget category, or hardcoded originally
  contactedDate: string;
  dueDate: string;
  bidAmount: number | "";
  leadTime: string;
  paymentTerms: string;
  status: RfqStatus;
  notes: string;
  documents?: VendorDocument[];
  customDetails?: VendorDetails;
}

export interface Milestone {
  id: string;
  name: string;
  owner: string;
  start: string;
  end: string;
  status: MilestoneStatus;
  notes: string;
}

export interface ActionItem {
  id: string;
  item: string;
  type: "Decision" | "Action";
  owner: string;
  dueDate: string;
  priority: Priority;
  status: ActionStatus;
}

export interface DashboardState {
  rfqs: Rfq[];
  milestones: Milestone[];
  actions: ActionItem[];
}
