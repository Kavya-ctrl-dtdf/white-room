import type { Host, Layout, Listing, Nearby, Segment } from "./types";

export const HOSTS: Host[] = [
  { id: "h1", name: "Lakshmi Serviced Homes", since: 2017, replyHours: 2 },
  { id: "h2", name: "Greenleaf Stays", since: 2019, replyHours: 3 },
  { id: "h3", name: "Orbit Residences", since: 2016, replyHours: 1 },
  { id: "h4", name: "Southgate Suites", since: 2020, replyHours: 4 },
  { id: "h5", name: "Northview Homes", since: 2018, replyHours: 3 },
  { id: "h6", name: "Nest and Co. Apartments", since: 2021, replyHours: 2 },
];

export const AREAS = [
  "Whitefield",
  "Outer Ring Road",
  "Electronic City",
  "Koramangala",
  "HSR Layout",
  "Indiranagar",
  "Old Airport Road",
  "Hebbal",
];

export const BASE_AMENITIES = [
  "Air conditioning",
  "Washing machine",
  "Fridge",
  "RO drinking water",
  "Power backup",
  "Geyser",
];

export const OPTIONAL_AMENITIES = [
  "Microwave",
  "Work desk",
  "Smart TV",
  "Parking",
  "Gym",
  "Cook on request",
  "Wheelchair friendly",
  "Caregiver bed",
];

export const SEGMENTS: Record<Segment, { label: string; short: string; blurb: string }> = {
  parents: {
    label: "Parents visiting",
    short: "Parents",
    blurb: "Ground floor or a lift, an Indian kitchen and a hospital close by. You can book on their behalf.",
  },
  work: {
    label: "Work and projects",
    short: "Work",
    blurb: "A proper desk, Wi-Fi we measured, a GST invoice, and stays from 15 days for hybrid and remote work.",
  },
  treatment: {
    label: "Treatment and recovery",
    short: "Treatment",
    blurb: "Distance to named hospitals, a caregiver bed where possible, and easy extensions.",
  },
};

export const CHECKLIST: { group: string; items: string[] }[] = [
  {
    group: "Safety",
    items: [
      "Main door lock works",
      "Fire extinguisher present",
      "Guard or CCTV at entry",
      "Power backup tested",
      "Gas line and stove safe",
      "Emergency contacts displayed",
    ],
  },
  {
    group: "Rooms",
    items: [
      "Home matches listing photos",
      "Beds and mattresses clean",
      "AC or fans working",
      "Geyser working",
      "Steady water supply",
      "Washing machine working",
    ],
  },
  {
    group: "Kitchen",
    items: [
      "Fridge working",
      "Stove and utensils present",
      "RO or safe drinking water",
      "Microwave present",
      "Counters and storage clean",
      "Exhaust or chimney working",
    ],
  },
  {
    group: "Work and connectivity",
    items: [
      "Wi-Fi speed measured",
      "Desk and chair present",
      "Sockets near the desk",
      "Mobile signal indoors",
      "Quiet during the day",
      "Good lighting",
    ],
  },
  {
    group: "Owner and terms",
    items: [
      "Owner ID verified",
      "Ownership or lease proof seen",
      "Rent matches listing",
      "No hidden charges",
      "Electricity cap stated",
      "Protection terms accepted",
    ],
  },
];

export const CHECK_COUNT = 30;

const h = (name: string, km: number): Nearby => ({ name, km, kind: "hospital" });
const o = (name: string, km: number): Nearby => ({ name, km, kind: "office" });
const m = (name: string, km: number): Nearby => ({ name, km, kind: "metro" });

interface Seed {
  id: string;
  title: string;
  area: string;
  address: string;
  layout: Layout;
  sqft: number;
  rent: number;
  wifi: number;
  floor: number;
  lift: boolean;
  seg: Segment[];
  nearby: Nearby[];
  host: string;
  verifiedOn?: string;
  stays: number;
  rating?: number;
  housekeeping?: number;
  minMonths?: number;
  extra?: string[];
  description: string;
}

const SEEDS: Seed[] = [
  {
    id: "wr-101", title: "Garden-facing 1 BHK near Manipal Hospital", area: "Old Airport Road",
    address: "Kodihalli Main Road, Old Airport Road", layout: "1bhk", sqft: 620, rent: 52000, wifi: 88, floor: 1, lift: true,
    seg: ["parents", "treatment"], nearby: [h("Manipal Hospital, Old Airport Road", 1.2), m("Indiranagar Metro", 2.6)],
    host: "h1", verifiedOn: "2026-10-12", stays: 23, rating: 4.9, housekeeping: 5,
    extra: ["Microwave", "Cook on request", "Caregiver bed", "Wheelchair friendly"],
    description: "A first-floor flat with a lift and a small garden view, ten minutes from Manipal Hospital. The kitchen is set up for Indian cooking and a cook can be arranged.",
  },
  {
    id: "wr-102", title: "Ground-floor 2 BHK on a quiet lane", area: "Indiranagar",
    address: "12th Cross, Indiranagar 1st Stage", layout: "2bhk", sqft: 980, rent: 92000, wifi: 120, floor: 0, lift: false,
    seg: ["parents", "work"], nearby: [m("Indiranagar Metro", 0.8), h("Manipal Hospital", 2.9)],
    host: "h1", verifiedOn: "2026-09-28", stays: 31, rating: 4.8, extra: ["Work desk", "Smart TV", "Parking"],
    description: "No stairs from the gate to the front door, which suits older parents. The second bedroom has a desk if someone needs to work from home.",
  },
  {
    id: "wr-103", title: "Studio with a proper work desk", area: "Old Airport Road",
    address: "HAL 3rd Stage, Old Airport Road", layout: "studio", sqft: 420, rent: 38000, wifi: 150, floor: 3, lift: true,
    seg: ["work"], nearby: [o("Embassy GolfLinks", 2.4), h("Manipal Hospital", 1.8)],
    host: "h1", verifiedOn: "2026-10-03", stays: 17, rating: 4.7, extra: ["Work desk", "Smart TV"],
    description: "A single room with a full-size desk, an ergonomic chair and sockets at the desk. Wi-Fi measured at 150 Mbps on our visit.",
  },
  {
    id: "wr-201", title: "Bright 1 BHK walking distance from ITPL", area: "Whitefield",
    address: "Varthur Road, near ITPL, Whitefield", layout: "1bhk", sqft: 600, rent: 42000, wifi: 100, floor: 4, lift: true,
    seg: ["work"], nearby: [o("ITPL Tech Park", 1.1), m("Kadugodi Tree Park Metro", 1.6)],
    host: "h2", verifiedOn: "2026-10-08", stays: 42, rating: 4.8, extra: ["Work desk", "Microwave", "Smart TV"],
    description: "A fourth-floor flat that gets morning light and is a short walk from ITPL. Popular with people on two-month project postings.",
  },
  {
    id: "wr-202", title: "2 BHK with a lift, near Vydehi Hospital", area: "Whitefield",
    address: "Hope Farm Junction, Whitefield", layout: "2bhk", sqft: 1050, rent: 68000, wifi: 95, floor: 2, lift: true,
    seg: ["parents", "work", "treatment"], nearby: [h("Vydehi Hospital", 2.0), o("ITPL", 2.8)],
    host: "h2", verifiedOn: "2026-09-19", stays: 28, rating: 4.7, extra: ["Microwave", "Caregiver bed", "Work desk"],
    description: "A second-floor flat with a lift, two bedrooms and a caregiver bed. Vydehi Hospital is two kilometres away.",
  },
  {
    id: "wr-203", title: "Compact studio for a short project", area: "Whitefield",
    address: "Hoodi Circle, Whitefield", layout: "studio", sqft: 380, rent: 34000, wifi: 80, floor: 5, lift: true,
    seg: ["work"], nearby: [m("Hoodi Metro", 0.9)],
    host: "h2", verifiedOn: "2026-08-30", stays: 19, rating: 4.6, extra: ["Work desk"],
    description: "A small, tidy studio on the fifth floor, close to Hoodi Metro. Good for one person for a few weeks.",
  },
  {
    id: "wr-204", title: "3 BHK for a family between homes", area: "Whitefield",
    address: "Kadugodi Main Road, Whitefield", layout: "3bhk", sqft: 1450, rent: 98000, wifi: 110, floor: 1, lift: true,
    seg: ["parents"], nearby: [h("Vydehi Hospital", 4.2)],
    host: "h2", verifiedOn: "2026-10-01", stays: 11, rating: 4.8, minMonths: 2, extra: ["Smart TV", "Parking", "Cook on request"],
    description: "Three bedrooms and a large living room for a family waiting on a new home. Parking for two cars is included.",
  },
  {
    id: "wr-301", title: "1 BHK five minutes from Ecospace", area: "Outer Ring Road",
    address: "Bellandur, Outer Ring Road", layout: "1bhk", sqft: 650, rent: 52000, wifi: 140, floor: 6, lift: true,
    seg: ["work"], nearby: [o("RMZ Ecospace", 0.9), h("Sakra World Hospital", 2.2)],
    host: "h3", verifiedOn: "2026-10-14", stays: 54, rating: 4.9, extra: ["Work desk", "Smart TV", "Gym"],
    description: "A sixth-floor flat with 140 Mbps Wi-Fi and a desk by the window. The building has a small gym.",
  },
  {
    id: "wr-302", title: "Two-bedroom flat with a study corner", area: "Outer Ring Road",
    address: "Devarabeesanahalli, Outer Ring Road", layout: "2bhk", sqft: 1100, rent: 82000, wifi: 130, floor: 3, lift: true,
    seg: ["work", "parents"], nearby: [o("Prestige Tech Park", 0.7), h("Sakra World Hospital", 3.0)],
    host: "h3", verifiedOn: "2026-09-25", stays: 26, rating: 4.8, extra: ["Work desk", "Microwave", "Parking"],
    description: "Two bedrooms and a study corner, 700 metres from Prestige Tech Park. Works for a couple or a parent visiting a working child.",
  },
  {
    id: "wr-303", title: "Studio with the fastest Wi-Fi we have measured", area: "Outer Ring Road",
    address: "Marathahalli Bridge, Outer Ring Road", layout: "studio", sqft: 450, rent: 41000, wifi: 160, floor: 7, lift: true,
    seg: ["work"], nearby: [o("Marathahalli tech corridor", 0.5)],
    host: "h3", verifiedOn: "2026-10-10", stays: 33, rating: 4.7, extra: ["Work desk", "Smart TV"],
    description: "We measured 160 Mbps here, the highest on our list. Seventh floor, with a desk and a second monitor on request.",
  },
  {
    id: "wr-401", title: "1 BHK close to Infosys and Narayana Health City", area: "Electronic City",
    address: "Hosur Road, Electronic City Phase 1", layout: "1bhk", sqft: 580, rent: 32000, wifi: 90, floor: 2, lift: true,
    seg: ["work", "treatment"], nearby: [o("Infosys campus", 1.2), h("Narayana Health City", 4.5)],
    host: "h4", verifiedOn: "2026-09-15", stays: 38, rating: 4.6, extra: ["Work desk", "Microwave"],
    description: "A second-floor flat that works for office staff and for families visiting Narayana Health City. Rent is among the lowest we list.",
  },
  {
    id: "wr-402", title: "2 BHK for patients and caregivers", area: "Electronic City",
    address: "Bommasandra Road, Electronic City", layout: "2bhk", sqft: 1000, rent: 54000, wifi: 85, floor: 1, lift: true,
    seg: ["parents", "treatment"], nearby: [h("Narayana Health City", 3.8), m("Bommasandra Metro", 1.4)],
    host: "h4", verifiedOn: "2026-10-06", stays: 21, rating: 4.8, housekeeping: 6,
    extra: ["Caregiver bed", "Wheelchair friendly", "Cook on request"],
    description: "A first-floor flat with a lift, a caregiver bed and wide doorways. Housekeeping comes six days a week.",
  },
  {
    id: "wr-403", title: "Budget studio near the Phase 2 campuses", area: "Electronic City",
    address: "Neeladri Road, Electronic City Phase 2", layout: "studio", sqft: 360, rent: 27000, wifi: 75, floor: 4, lift: true,
    seg: ["work"], nearby: [o("Electronic City Phase 2", 1.0)],
    host: "h4", verifiedOn: "2026-09-02", stays: 47, rating: 4.5, extra: ["Work desk"],
    description: "The lowest rent on the platform. A plain, clean studio a short walk from the Phase 2 offices.",
  },
  {
    id: "wr-404", title: "Quiet 1 BHK nearest to Narayana Health City", area: "Electronic City",
    address: "Doddathogur Road, Electronic City", layout: "1bhk", sqft: 600, rent: 36000, wifi: 80, floor: 0, lift: false,
    seg: ["treatment", "parents"], nearby: [h("Narayana Health City", 2.9)],
    host: "h4", verifiedOn: "2026-10-15", stays: 9, rating: 4.9, extra: ["Caregiver bed", "Wheelchair friendly"],
    description: "A ground-floor flat on a quiet street with a step-free entrance. The closest home on our list to Narayana Health City.",
  },
  {
    id: "wr-501", title: "1 BHK beside Aster CMI Hospital", area: "Hebbal",
    address: "Bellary Road, Hebbal", layout: "1bhk", sqft: 640, rent: 46000, wifi: 100, floor: 2, lift: true,
    seg: ["parents", "treatment"], nearby: [h("Aster CMI Hospital", 1.0), o("Manyata Tech Park", 2.5)],
    host: "h5", verifiedOn: "2026-09-22", stays: 15, rating: 4.8, extra: ["Caregiver bed", "Microwave"],
    description: "A second-floor flat with a lift, one kilometre from Aster CMI Hospital. The bedroom has a second bed for a caregiver.",
  },
  {
    id: "wr-502", title: "2 BHK near Manyata Tech Park", area: "Hebbal",
    address: "Nagawara Main Road, Hebbal", layout: "2bhk", sqft: 1020, rent: 72000, wifi: 105, floor: 5, lift: true,
    seg: ["work", "parents"], nearby: [o("Manyata Tech Park", 1.1), h("Aster CMI Hospital", 3.4)],
    host: "h5", verifiedOn: "2026-10-09", stays: 24, rating: 4.7, extra: ["Work desk", "Smart TV", "Parking"],
    description: "Two bedrooms on the fifth floor with a view over the lake. Manyata Tech Park is a ten-minute walk.",
  },
  {
    id: "wr-601", title: "1 BHK in the middle of Koramangala", area: "Koramangala",
    address: "5th Block, Koramangala", layout: "1bhk", sqft: 600, rent: 60000, wifi: 150, floor: 3, lift: true,
    seg: ["work"], nearby: [h("St John's Medical College Hospital", 2.0)],
    host: "h6", verifiedOn: "2026-10-11", stays: 36, rating: 4.8, extra: ["Work desk", "Smart TV", "Microwave"],
    description: "Walk to cafes and co-working spaces from the door. Wi-Fi measured at 150 Mbps.",
  },
  {
    id: "wr-602", title: "Large 2 BHK for visiting family", area: "Koramangala",
    address: "6th Block, Koramangala", layout: "2bhk", sqft: 1000, rent: 98000, wifi: 130, floor: 2, lift: true,
    seg: ["parents", "work"], nearby: [h("St John's Medical College Hospital", 1.4)],
    host: "h6", verifiedOn: "2026-09-27", stays: 18, rating: 4.9, extra: ["Smart TV", "Cook on request", "Parking", "Work desk"],
    description: "A large flat with two full bedrooms and a big balcony. St John's hospital is under 1.5 km away.",
  },
  {
    id: "wr-603", title: "1 BHK on a tree-lined HSR street", area: "HSR Layout",
    address: "Sector 2, HSR Layout", layout: "1bhk", sqft: 620, rent: 50000, wifi: 120, floor: 1, lift: true,
    seg: ["work"], nearby: [o("HSR startup offices", 0.8)],
    host: "h6", verifiedOn: "2026-10-05", stays: 29, rating: 4.7, extra: ["Work desk", "Smart TV"],
    description: "A calm first-floor flat on a leafy street, with several startup offices within a ten-minute walk.",
  },
  {
    id: "wr-604", title: "2 BHK with a lift and a balcony", area: "HSR Layout",
    address: "Sector 6, HSR Layout", layout: "2bhk", sqft: 1050, rent: 78000, wifi: 110, floor: 4, lift: true,
    seg: ["parents"], nearby: [h("Narayana Multispeciality Hospital, HSR", 1.5)],
    host: "h6", verifiedOn: "2026-09-12", stays: 14, rating: 4.6, extra: ["Smart TV", "Microwave", "Wheelchair friendly"],
    description: "A fourth-floor flat with a lift and a wide balcony. Narayana Multispeciality Hospital is 1.5 km away.",
  },
  {
    id: "wr-701", title: "Newly furnished 1 BHK in Marathahalli", area: "Outer Ring Road",
    address: "Kundalahalli Gate, Marathahalli", layout: "1bhk", sqft: 590, rent: 39000, wifi: 100, floor: 2, lift: true,
    seg: ["work"], nearby: [o("Marathahalli tech corridor", 0.8)],
    host: "h3", stays: 0, extra: ["Work desk"],
    description: "A newly furnished flat, waiting for our visit. Furniture is less than six months old.",
  },
  {
    id: "wr-702", title: "Studio near Hebbal flyover", area: "Hebbal",
    address: "Kempapura, near Hebbal flyover", layout: "studio", sqft: 400, rent: 33000, wifi: 90, floor: 3, lift: true,
    seg: ["work", "treatment"], nearby: [h("Aster CMI Hospital", 2.1)],
    host: "h5", stays: 0, extra: ["Work desk"],
    description: "A compact studio close to the flyover, waiting for our visit. Suits a short stay near Aster CMI Hospital.",
  },
];

export const SEED_LISTINGS: Listing[] = SEEDS.map((s, i) => ({
  id: s.id,
  title: s.title,
  area: s.area,
  address: s.address,
  layout: s.layout,
  sqft: s.sqft,
  rent: s.rent,
  electricityUnits: 150,
  housekeeping: s.housekeeping ?? 3,
  wifiMbps: s.wifi,
  floor: s.floor,
  lift: s.lift,
  segments: s.seg,
  amenities: [...BASE_AMENITIES, ...(s.extra ?? [])],
  nearby: s.nearby,
  hostId: s.host,
  // Work homes take 15-day stays for hybrid and remote workers.
  minMonths: s.minMonths ?? (s.seg.includes("work") ? 0.5 : 1),
  description: s.description,
  variant: (i % 2) as 0 | 1,
  status: s.verifiedOn ? "verified" : "pending",
  verifiedOn: s.verifiedOn,
  stays: s.stays,
  rating: s.rating,
}));

export const hostById = (id: string): Host => HOSTS.find((x) => x.id === id) ?? HOSTS[0];

export function relevantNearby(l: Listing, seg?: Segment | "") {
  const wantHospital = seg === "parents" || seg === "treatment";
  const kind = wantHospital ? "hospital" : seg === "work" ? "office" : undefined;
  const pool = kind ? l.nearby.filter((n) => n.kind === kind) : [];
  const list = pool.length ? pool : l.nearby;
  return [...list].sort((a, b) => a.km - b.km)[0];
}
