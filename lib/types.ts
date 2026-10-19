export type Layout = "studio" | "1bhk" | "2bhk" | "3bhk";
export type Segment = "parents" | "work" | "treatment";
export type ListingStatus = "verified" | "pending" | "changes";
export type NearbyKind = "hospital" | "office" | "metro";

export interface Nearby {
  name: string;
  km: number;
  kind: NearbyKind;
}

export interface Host {
  id: string;
  name: string;
  since: number;
  replyHours: number;
}

export interface Listing {
  id: string;
  title: string;
  area: string;
  address: string;
  layout: Layout;
  sqft: number;
  rent: number;
  electricityUnits: number;
  housekeeping: number;
  wifiMbps: number;
  floor: number;
  lift: boolean;
  segments: Segment[];
  amenities: string[];
  nearby: Nearby[];
  hostId: string;
  minMonths: number;
  description: string;
  variant: 0 | 1;
  status: ListingStatus;
  verifiedOn?: string;
  stays: number;
  rating?: number;
}

export type BookingStatus =
  | "requested"
  | "confirmed"
  | "declined"
  | "cancelled"
  | "moved_in"
  | "issue"
  | "resolved";

export interface Booking {
  id: string;
  listingId: string;
  months: number;
  moveIn: string;
  forSomeoneElse: boolean;
  bookerName: string;
  bookerPhone: string;
  guestName: string;
  guestPhone: string;
  relation?: string;
  monthly: number;
  total: number;
  paidNow: number;
  method: "upi" | "card";
  status: BookingStatus;
  createdAt: string;
  issue?: { note: string; at: string; resolution?: string };
}
