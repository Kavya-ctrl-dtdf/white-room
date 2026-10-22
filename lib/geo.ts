import type { Listing } from "./types";

export type LatLng = [number, number];

export const BENGALURU: LatLng = [12.9716, 77.5946];

export const AREA_CENTERS: Record<string, LatLng> = {
  Whitefield: [12.9857, 77.7357],
  "Outer Ring Road": [12.9352, 77.6925],
  "Electronic City": [12.8456, 77.6603],
  Koramangala: [12.9352, 77.6245],
  "HSR Layout": [12.9116, 77.6389],
  Indiranagar: [12.9784, 77.6408],
  "Old Airport Road": [12.9591, 77.6489],
  Hebbal: [13.0358, 77.597],
};

// Approximate street locations for the sample homes. Not exact addresses.
const HOME_COORDS: Record<string, LatLng> = {
  "wr-101": [12.9602, 77.646],
  "wr-102": [12.979, 77.64],
  "wr-103": [12.9655, 77.658],
  "wr-201": [12.985, 77.734],
  "wr-202": [12.9808, 77.7511],
  "wr-203": [12.9919, 77.716],
  "wr-204": [12.9996, 77.7621],
  "wr-301": [12.93, 77.678],
  "wr-302": [12.934, 77.694],
  "wr-303": [12.9569, 77.7011],
  "wr-401": [12.848, 77.662],
  "wr-402": [12.82, 77.675],
  "wr-403": [12.833, 77.678],
  "wr-404": [12.856, 77.67],
  "wr-501": [13.0452, 77.5948],
  "wr-502": [13.0452, 77.618],
  "wr-601": [12.934, 77.62],
  "wr-602": [12.938, 77.625],
  "wr-603": [12.912, 77.645],
  "wr-604": [12.905, 77.642],
  "wr-701": [12.965, 77.715],
  "wr-702": [13.048, 77.604],
};

/** A home's map position: its known spot, or its area centre nudged by its id so pins do not stack. */
export function coordsFor(l: Listing): LatLng {
  const known = HOME_COORDS[l.id];
  if (known) return known;
  const base = AREA_CENTERS[l.area] ?? BENGALURU;
  let h = 0;
  for (const ch of l.id) h = (h * 31 + ch.charCodeAt(0)) % 1000;
  return [base[0] + ((h % 20) - 10) * 0.0006, base[1] + (((h >> 2) % 20) - 10) * 0.0006];
}
