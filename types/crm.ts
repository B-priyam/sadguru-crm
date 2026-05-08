export type PipelineStage =
  | "new_lead"
  | "contacted"
  | "site_visit"
  | "negotiation"
  | "booking_confirmed"
  | "deal_closed"
  | "lost";

export const PIPELINE_STAGES: { id: PipelineStage; label: string }[] = [
  { id: "new_lead", label: "New Lead" },
  { id: "contacted", label: "Contacted" },
  { id: "site_visit", label: "Site Visit" },
  { id: "negotiation", label: "Negotiation" },
  { id: "booking_confirmed", label: "Booking Confirmed" },
  { id: "deal_closed", label: "Deal Closed" },
  { id: "lost", label: "Lost" },
];

export type PropertyType =
  | "1bhk"
  | "2bhk"
  | "3bhk"
  | "4bhk"
  | "villa"
  | "plot"
  | "commercial";
export type LeadSource =
  | "referral"
  | "website"
  | "social_media"
  | "walk_in"
  | "portal"
  | "other";
export type PaymentStatus = "pending" | "partial" | "completed";

export const DEFAULT_PROPERTIES = [
  "Sunrise Heights, Sector 45",
  "Green Valley Villas",
  "Downtown Plaza",
  "Lake View Residency",
  "Palm Orchid",
  "Metro Commercial Hub",
  "Garden Estate",
  "Royal Enclave",
  "City Center Mall",
  "Heritage Plots",
];

export type UnitType = "1bhk" | "2bhk" | "3bhk" | "4bhk" | "5bhk";

export const UNIT_TYPES: { value: UnitType; label: string }[] = [
  { value: "1bhk", label: "1 BHK" },
  { value: "2bhk", label: "2 BHK" },
  { value: "3bhk", label: "3 BHK" },
  { value: "4bhk", label: "4 BHK" },
  { value: "5bhk", label: "5 BHK" },
];

export interface PropertyUnit {
  type: string;
  price: string;
  area: string;
}

export interface Property {
  id?: string;
  name: string;
  location: string;
  units: PropertyUnit[];
}

export interface ClientNote {
  text: string;
  createdAt: Date;
}

export interface Booking {
  propertyName: string;
  bookingAmount: number;
  bookingDate: string;
  paymentStatus: PaymentStatus;
  commissionEarned: number;
}

export interface FollowUp {
  id: string;
  date: Date;
  note: string;
  completed?: boolean;
}

export interface Client {
  id?: string;
  name: string;
  number: string;
  // email: string;
  budget?: string;
  interestedProperty?: string;
  // selectedUnit?: string;
  propertyType?: string;
  propertyArea?: string;
  // leadSource: LeadSource;
  notes: ClientNote[];
  // dateAdded: string;
  stage: PipelineStage;
  // lastContact: string;
  visit?: string;
  // booking?: Booking;
  followUp: FollowUp[];
  income?: string;
  location?: string;
  occupation?: string;
  residence?: string;
}

export type FormFields =
  | "name"
  | "number"
  | "budget"
  | "location"
  | "income"
  | "occupation"
  | "residence"
  | "selectedPropertyId"
  | "stage"
  | "visit"
  | "visitTime"
  | "note";
