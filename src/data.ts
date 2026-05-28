/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BudgetCategory, Rfq, Milestone, ActionItem } from "./types";

export const SEED_SUMMARY = {
  project: "11200 2nd Ave, Stone Harbor",
  subtitle: "Custom Residential Project",
  phase: "Pre-Construction / Buyout",
  lastUpdated: "May 28, 2026 10:15 AM",
  currentSov: 2342753.54,
  emailBudget: 2600000,
  budgetGap: 257246.46,
  savingsLow: 137596.02,
  savingsHigh: 290295,
  targetLow: 2205157.52,
  targetHigh: 2052458.54,
  allowanceOp: 64450
};

export const SEED_BUDGET_CATEGORIES: BudgetCategory[] = [
  { section: "Allowances", package: "BP-01 Allowance Buyout", baseline: 644500, targetPrice: 528490, savingsLow: 51560, savingsHigh: 116010, strategy: "Bid out allowance scope directly and cap or remove O&P on owner-direct purchases." },
  { section: "Roofing & Siding", package: "BP-02 Exterior Envelope", baseline: 313094.5, targetPrice: 266130.33, savingsLow: 25047.56, savingsHigh: 46964.17, strategy: "Separate material, labor, insulation, exterior trim, warranties, and coastal/wind-rating assumptions." },
  { section: "Wood", package: "BP-03 Framing, Decking & Rail", baseline: 289644.92, targetPrice: 254887.53, savingsLow: 14482.25, savingsHigh: 34757.39, strategy: "Quote lumber/truss package separately from framing, decking, rail, and post labor." },
  { section: "Doors & Windows", package: "BP-04 Doors & Windows", baseline: 256129.53, targetPrice: 225393.99, savingsLow: 15367.77, savingsHigh: 30735.54, strategy: "Price exact window/door schedule plus alternates, delivery, installation, and lead-time guarantees." },
  { section: "Concrete & Masonry", package: "BP-05 Concrete, Masonry & Hardscape", baseline: 196740, targetPrice: 177066, savingsLow: 9837, savingsHigh: 19674, strategy: "Break out foundation, slab, pavers, stone, vents, curb, apron, and sidewalk unit rates." },
  { section: "Mechanical Systems", package: "BP-06 Plumbing & HVAC", baseline: 125980, targetPrice: 115901.6, savingsLow: 5039.2, savingsHigh: 10078.4, strategy: "Bid plumbing and HVAC separately with fixture counts, equipment models, and warranty detail." },
  { section: "Finishes", package: "BP-08 Drywall & Paint", baseline: 99790, targetPrice: 84821.5, savingsLow: 7983.2, savingsHigh: 14968.5, strategy: "Bid drywall and painting separately with area assumptions, finish levels, primers, and coats." },
  { section: "Electrical", package: "BP-07 Electrical, Lighting & Low Voltage", baseline: 76905, targetPrice: 70752.6, savingsLow: 3076.2, savingsHigh: 6152.4, strategy: "Separate base electrical, fixture installation, service equipment, and low-voltage exclusions." },
  { section: "Site Work", package: "BP-09 Sitework & Disposal", baseline: 36000, targetPrice: 32400, savingsLow: 1800, savingsHigh: 3600, strategy: "Requote demolition, piling, dumpsters, backfill, and stormwater as early discrete packages." },
  { section: "Miscellaneous", package: "BP-10 Jobsite Operations", baseline: 31100, targetPrice: 27990, savingsLow: 1555, savingsHigh: 3110, strategy: "Convert porta-john, fence, cleaning, punch, and foreman costs into time/unit allowances." },
  { section: "General Conditions", package: "BP-13 General Conditions Audit", baseline: 24892, targetPrice: 23647.4, savingsLow: 497.84, savingsHigh: 1244.6, strategy: "Request receipts and quotes for permit, survey, warranty, rentals, utilities, and site costs." },
  { section: "Structural Steel", package: "BP-11 Structural Steel", baseline: 20000, targetPrice: 18800, savingsLow: 600, savingsHigh: 1200, strategy: "Confirm beam/column takeoff and request supplier/install alternates." },
  { section: "Specialties", package: "BP-12 Specialties", baseline: 15000, targetPrice: 13200, savingsLow: 750, savingsHigh: 1800, strategy: "Validate roll-down screens, shutters, and outdoor shower as direct-price or defer candidates." }
];

export const RAW_SEED_RFQS: Omit<Rfq, "targetPrice">[] = [
  { id: "rfq-seashore", package: "BP-02 Exterior Envelope", vendor: "Seashore Construction", category: "Roofing, siding, windows, doors, decks", sourceUrl: "https://www.seashoreconstruction.net/stone-harbor-nj/", phone: "", priority: "High", contactedDate: "", dueDate: "2026-06-02", bidAmount: "", leadTime: "", paymentTerms: "", status: "Not contacted", notes: "Ask for coastal/wind-rated assemblies, crew availability, and split material/labor pricing." },
  { id: "rfq-be-shore", package: "BP-02 Exterior Envelope", vendor: "Be Shore Exteriors", category: "Roofing, siding, windows, decks", sourceUrl: "https://beshoreexteriors.com/service-area/stone-harbor-nj.html", phone: "609-222-2485", priority: "High", contactedDate: "", dueDate: "2026-06-02", bidAmount: 274200, leadTime: "4-6 weeks", paymentTerms: "30% deposit", status: "Evaluating", notes: "Compare roof/siding/deck scope as a bundled exterior package." },
  { id: "rfq-shiplap", package: "BP-02 Exterior Envelope", vendor: "Shiplap Solutions LLC", category: "Exterior general contracting", sourceUrl: "https://www.shiplapsolutions.com/", phone: "609-778-8978", priority: "Medium", contactedDate: "", dueDate: "2026-06-02", bidAmount: "", leadTime: "", paymentTerms: "", status: "Not contacted", notes: "Local comparison bidder for roof/siding/decks." },
  { id: "rfq-cape-may-lumber", package: "BP-03 Framing, Decking & Rail", vendor: "Cape May Lumber", category: "Lumber, plywood, decking, trim materials", sourceUrl: "https://capemaylumber.com/products/products.htm", phone: "609-884-4488", priority: "High", contactedDate: "", dueDate: "2026-06-02", bidAmount: 249900, leadTime: "2-3 weeks", paymentTerms: "COD / account", status: "Evaluating", notes: "Request takeoff-based material price for framing, decking, rails, posts, and delivery." },
  { id: "rfq-stone-works", package: "BP-05 Concrete, Masonry & Hardscape", vendor: "Stone Works Masonry, Inc.", category: "Concrete, foundations, masonry, patios, driveways", sourceUrl: "https://www.stoneworksmasonryinc.com/", phone: "", priority: "High", contactedDate: "", dueDate: "2026-06-02", bidAmount: 181250, leadTime: "3 weeks", paymentTerms: "Milestones", status: "Evaluating", notes: "Need foundation/slab/paver/stone breakdown and unit rates." },
  { id: "rfq-la-terra", package: "BP-05 Concrete, Masonry & Hardscape", vendor: "La Terra Stone Corporation", category: "Hardscaping, pavers, exterior stone", sourceUrl: "https://www.laterrastone.com/hardscape-and-exterior-projects", phone: "", priority: "Medium", contactedDate: "", dueDate: "2026-06-02", bidAmount: "", leadTime: "", paymentTerms: "", status: "Not contacted", notes: "Use for hardscape, driveway/walkway, and allowance alternates." },
  { id: "rfq-court-house-mechanical", package: "BP-06 Plumbing & HVAC", vendor: "Court House Plumbing Heating & Air", category: "Plumbing and HVAC", sourceUrl: "https://www.courthousemechanical.com/", phone: "609-465-5950", priority: "High", contactedDate: "", dueDate: "2026-06-02", bidAmount: 118400, leadTime: "4 weeks", paymentTerms: "25% deposit", status: "Evaluating", notes: "Bid plumbing and HVAC separately with equipment schedule and fixture count." },
  { id: "rfq-reliable-plumbing", package: "BP-06 Plumbing & HVAC", vendor: "Reliable Plumbing & Heating", category: "Plumbing and heating", sourceUrl: "https://www.reliableplumbingandheat.com/", phone: "609-465-6177", priority: "Medium", contactedDate: "", dueDate: "2026-06-02", bidAmount: "", leadTime: "", paymentTerms: "", status: "Not contacted", notes: "Confirm new-construction capacity and schedule." },
  { id: "rfq-anzelone", package: "BP-07 Electrical, Lighting & Low Voltage", vendor: "Anzelone Electric Co.", category: "Residential/commercial electrical", sourceUrl: "https://www.anzeloneelectric.com/", phone: "609-465-1982", priority: "High", contactedDate: "", dueDate: "2026-06-02", bidAmount: 72100, leadTime: "3 weeks", paymentTerms: "Progress billing", status: "Evaluating", notes: "Request base electrical, fixture install, service equipment, and change-order rates." },
  { id: "rfq-maguire", package: "BP-07 Electrical, Lighting & Low Voltage", vendor: "Maguire Electrical Construction, LLC", category: "Electrical, fire alarm, controls, network", sourceUrl: "https://www.maguireelectricnj.com/", phone: "609-457-6717", priority: "Medium", contactedDate: "", dueDate: "2026-06-02", bidAmount: "", leadTime: "", paymentTerms: "", status: "Not contacted", notes: "Validate residential new-build availability." },
  { id: "rfq-rcm", package: "BP-07 Electrical, Lighting & Low Voltage", vendor: "R.C.M. Electrical Service", category: "New-construction electrical and wiring", sourceUrl: "https://www.rcmelectricalservice.com/", phone: "609-780-1451", priority: "Medium", contactedDate: "", dueDate: "2026-06-02", bidAmount: "", leadTime: "", paymentTerms: "", status: "Not contacted", notes: "Comparison bidder for base electrical and service upgrades." },
  { id: "rfq-ntelflex", package: "BP-07 Electrical, Lighting & Low Voltage", vendor: "ntelFLEX", category: "Home automation, audio/video, networking", sourceUrl: "https://ntelflex.com/", phone: "", priority: "High", contactedDate: "", dueDate: "2026-06-02", bidAmount: "", leadTime: "", paymentTerms: "", status: "Not contacted", notes: "Use for the $35K audio/stereo allowance and low-voltage alternates." },
  { id: "rfq-ferguson", package: "BP-01 Allowance Buyout", vendor: "Ferguson Bath, Kitchen & Lighting Gallery", category: "Bath, kitchen, lighting, appliances, plumbing fixtures", sourceUrl: "https://www.ferguson.com/store/nj/stone%2Bharbor/showroom-5932", phone: "609-368-8290", priority: "High", contactedDate: "", dueDate: "2026-06-02", bidAmount: "", leadTime: "", paymentTerms: "", status: "Not contacted", notes: "Use for fixtures, lighting, appliances, and owner-direct buyout packages." },
  { id: "rfq-cabinet-company", package: "BP-01 Allowance Buyout", vendor: "The Cabinet Company", category: "Cabinetry, countertops, closets", sourceUrl: "https://www.thecabinetco.co/", phone: "609-807-8928", priority: "High", contactedDate: "", dueDate: "2026-06-02", bidAmount: 498000, leadTime: "8-10 weeks", paymentTerms: "40% deposit", status: "Evaluating", notes: "Cabinetry, countertops, built-ins, closets, and value-engineered selections." },
  { id: "rfq-ocean-interiors", package: "BP-01 Allowance Buyout", vendor: "Ocean Interiors", category: "Cabinetry, tile, flooring, countertops, installation", sourceUrl: "https://oceaninteriorsnj.com/", phone: "609-685-7825", priority: "Medium", contactedDate: "", dueDate: "2026-06-02", bidAmount: "", leadTime: "", paymentTerms: "", status: "Not contacted", notes: "Comparison bidder for cabinets, flooring, tile, countertop, and install bundles." },
  { id: "rfq-coast-tile", package: "BP-01 Allowance Buyout", vendor: "Coast Tile - Avalon showroom", category: "Tile, stone, marble, flooring", sourceUrl: "https://www.stoneworld.com/articles/93950-coast-tile-opens-second-showroom", phone: "", priority: "Medium", contactedDate: "", dueDate: "2026-06-02", bidAmount: "", leadTime: "", paymentTerms: "", status: "Not contacted", notes: "Tile material price checks and alternates." },
  { id: "rfq-cape-flooring", package: "BP-01 Allowance Buyout", vendor: "Cape Commercial Flooring", category: "Hardwood, engineered wood, tile, natural stone, vinyl", sourceUrl: "https://capecommercialflooring.com/", phone: "609-457-9166", priority: "Medium", contactedDate: "", dueDate: "2026-06-02", bidAmount: "", leadTime: "", paymentTerms: "", status: "Not contacted", notes: "Hardwood/tile material and install comparison bid." },
  { id: "rfq-cape-interiors", package: "BP-01 Allowance Buyout", vendor: "Cape Interiors, LLC", category: "Tile, marble, hardwood, LVT, carpet", sourceUrl: "https://www.capeinteriors.net/", phone: "609-624-8285", priority: "Medium", contactedDate: "", dueDate: "2026-06-02", bidAmount: "", leadTime: "", paymentTerms: "", status: "Not contacted", notes: "Flooring and tile alternates." },
  { id: "rfq-south-jersey-elevator", package: "BP-01 Allowance Buyout", vendor: "South Jersey Elevator", category: "Residential elevator install/service", sourceUrl: "https://sjelevator.com/", phone: "609-545-8512", priority: "High", contactedDate: "", dueDate: "2026-06-02", bidAmount: "", leadTime: "", paymentTerms: "", status: "Not contacted", notes: "Confirm shaft requirements, model, lead time, and inspection support." }
];

// Dynamically compute targetPrice from matching category pack as requested
export const SEED_RFQS: Rfq[] = RAW_SEED_RFQS.map(rfq => {
  const cat = SEED_BUDGET_CATEGORIES.find(c => c.package === rfq.package);
  return {
    ...rfq,
    targetPrice: cat ? cat.targetPrice : 0
  };
});

export const SEED_MILESTONES: Milestone[] = [
  { id: "budget-bridge", name: "Reconcile budget bridge", owner: "GC / Owner", start: "2026-05-28", end: "2026-05-29", status: "At risk", notes: "Find the $257K difference between email budget and SOV total before vendor negotiations." },
  { id: "scope-freeze", name: "Freeze bid scope package", owner: "Architect / GC", start: "2026-05-29", end: "2026-05-29", status: "On track", notes: "Issue one comparable drawing/spec packet for every bidder." },
  { id: "rfqs-issued", name: "Issue high-leverage RFQs", owner: "Estimator", start: "2026-05-29", end: "2026-06-02", status: "On track", notes: "Send packages for allowances, envelope, framing, doors/windows, masonry, and MEP." },
  { id: "quote-due", name: "RFQ quote due date", owner: "Estimator", start: "2026-06-02", end: "2026-06-02", status: "On track", notes: "Collect comparable pricing and normalize exclusions." },
  { id: "commercial-terms", name: "Commercial terms negotiation", owner: "PM / GC", start: "2026-06-03", end: "2026-06-03", status: "On track", notes: "Cap or remove allowance O&P on owner-direct purchases." },
  { id: "vendor-awards", name: "Vendor awards", owner: "GC Team", start: "2026-06-04", end: "2026-06-05", status: "On track", notes: "Award by weighted score and locked lead time." },
  { id: "lead-items", name: "Critical lead items locked", owner: "PM", start: "2026-06-05", end: "2026-06-07", status: "At risk", notes: "Windows, folding door, elevator, cabinetry, and appliances govern schedule." }
];

export const SEED_ACTION_ITEMS: ActionItem[] = [
  { id: "approve-buyout", item: "Approve allowance buyout strategy", type: "Decision", owner: "GC", dueDate: "2026-05-30", priority: "High", status: "Open" },
  { id: "select-window-vendor", item: "Select doors/windows short list", type: "Decision", owner: "GC", dueDate: "2026-06-02", priority: "High", status: "Open" },
  { id: "mep-review", item: "MEP quote review", type: "Action", owner: "Estimator", dueDate: "2026-05-29", priority: "High", status: "In progress" },
  { id: "permitting-timeline", item: "Update permitting timeline", type: "Action", owner: "PM", dueDate: "2026-05-30", priority: "Medium", status: "Open" },
  { id: "lead-items-confirm", item: "Confirm long-lead items", type: "Action", owner: "PM", dueDate: "2026-05-28", priority: "Medium", status: "In progress" },
  { id: "interior-rfqs", item: "Send interior finish RFQs", type: "Action", owner: "Estimator", dueDate: "2026-06-03", priority: "Medium", status: "Open" },
  { id: "roofing-submittal", item: "Finalize roofing/siding submittal assumptions", type: "Action", owner: "PM", dueDate: "2026-05-30", priority: "Low", status: "Open" },
  { id: "plan-comments", item: "Resolve plan review comments", type: "Action", owner: "Architect", dueDate: "2026-06-05", priority: "Low", status: "Open" }
];
