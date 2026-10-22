"use client";

import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker, TileLayer } from "leaflet";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";
import { PlanThumb, VerifiedPill } from "./ui";
import { BENGALURU, coordsFor } from "@/lib/geo";
import { formatINR, layoutLabel } from "@/lib/format";
import { quote } from "@/lib/pricing";
import type { Listing } from "@/lib/types";

type Layer = "street" | "satellite";
type LeafletModule = typeof import("leaflet");

const ZOOM_SHOW_PINS = 12;
const pinLabel = (n: number) => `₹${Math.round(n / 1000)}k`;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

interface Props {
  results: Listing[];
  months: number;
  activeId: string | null;
  onActive: (id: string | null) => void;
  carry: string;
}

export default function StaysMap({ results, months, activeId, onActive, carry }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const lib = useRef<LeafletModule | null>(null);
  const tiles = useRef<TileLayer | null>(null);
  const markers = useRef<Map<string, Marker>>(new Map());
  const areaMarkers = useRef<Marker[]>([]);
  const lastFit = useRef("");
  const multiArea = useRef(true);
  const syncRef = useRef<() => void>(() => {});
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;

  const [ready, setReady] = useState(false);
  const [layer, setLayer] = useState<Layer>("street");

  // Create the map once, in the browser only.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("leaflet");
      const L = ((mod as unknown as { default?: LeafletModule }).default ?? mod) as LeafletModule;
      if (cancelled || !host.current) return;
      lib.current = L;
      const m = L.map(host.current, { zoomControl: true, zoomSnap: 0.5 }).setView(BENGALURU, 11);
      m.on("click", () => onActiveRef.current(null));
      // Zoomed out, homes group into area bubbles; zoomed in, they become price pills.
      // With homes in a single area there is nothing to group, so always show prices.
      const syncZoom = () => {
        const close = m.getZoom() >= ZOOM_SHOW_PINS || !multiArea.current;
        host.current?.classList.toggle("wr-close", close);
        host.current?.classList.toggle("wr-far", !close);
        host.current?.classList.toggle("wr-labels", m.getZoom() >= 11.5);
      };
      syncRef.current = syncZoom;
      m.on("zoomend", syncZoom);
      syncZoom();
      map.current = m;
      setReady(true);
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      markers.current.clear();
      areaMarkers.current = [];
      lastFit.current = "";
      setReady(false);
    };
  }, []);

  // Street or satellite tiles.
  useEffect(() => {
    const L = lib.current;
    const m = map.current;
    if (!ready || !L || !m) return;
    tiles.current?.remove();
    const t =
      layer === "street"
        ? L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors",
          })
        : L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
            maxZoom: 19,
            attribution: "Tiles © Esri",
          });
    t.addTo(m);
    tiles.current = t;
    host.current?.classList.toggle("wr-street", layer === "street");
  }, [ready, layer]);

  // Price pins and area bubbles follow the search results.
  useEffect(() => {
    const L = lib.current;
    const m = map.current;
    if (!ready || !L || !m) return;
    markers.current.forEach((mk) => mk.remove());
    markers.current.clear();
    areaMarkers.current.forEach((mk) => mk.remove());
    areaMarkers.current = [];

    const points: [number, number][] = [];
    const byArea = new Map<string, [number, number][]>();

    for (const l of results) {
      const pos = coordsFor(l);
      points.push(pos);
      byArea.set(l.area, [...(byArea.get(l.area) ?? []), pos]);
      const label = pinLabel(quote(l.rent, months).perMonth);
      const mk = L.marker(pos, {
        icon: L.divIcon({ className: "wr-pin", html: `<span>${label}</span>`, iconSize: [0, 0] }),
        title: l.title,
        keyboard: true,
      });
      mk.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        onActiveRef.current(l.id);
      });
      mk.addTo(m);
      markers.current.set(l.id, mk);
    }

    byArea.forEach((pts, area) => {
      const lat = pts.reduce((s, p) => s + p[0], 0) / pts.length;
      const lng = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      const mk = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "wr-area",
          html: `<span class="wr-area-b">${pts.length}</span><span class="wr-area-l">${esc(area)}</span>`,
          iconSize: [0, 0],
        }),
        title: `${area}, ${pts.length} ${pts.length === 1 ? "home" : "homes"}`,
        keyboard: true,
      });
      mk.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        m.fitBounds(L.latLngBounds(pts).pad(0.5), { maxZoom: 14 });
      });
      mk.addTo(m);
      areaMarkers.current.push(mk);
    });

    multiArea.current = byArea.size > 1;
    const key = results.map((r) => r.id).join(",");
    if (points.length > 0 && key !== lastFit.current) {
      m.fitBounds(L.latLngBounds(points).pad(0.25), { maxZoom: 14 });
    }
    lastFit.current = key;
    syncRef.current();
  }, [ready, results, months]);

  // Highlight the active pin, and keep it in view.
  useEffect(() => {
    const m = map.current;
    markers.current.forEach((mk, id) => {
      const on = id === activeId;
      mk.setZIndexOffset(on ? 1000 : 0);
      mk.getElement()?.classList.toggle("wr-pin-on", on);
    });
    if (ready && m && activeId) {
      const l = results.find((r) => r.id === activeId);
      if (l) {
        const pos = coordsFor(l);
        if (!m.getBounds().contains(pos)) m.panTo(pos);
      }
    }
  }, [activeId, results, ready]);

  function fit() {
    const L = lib.current;
    const m = map.current;
    if (!L || !m || results.length === 0) return;
    m.fitBounds(L.latLngBounds(results.map(coordsFor)).pad(0.25), { maxZoom: 14 });
  }

  const active = results.find((r) => r.id === activeId);

  return (
    <div className="relative isolate h-full min-h-[320px] overflow-hidden rounded-[28px] border border-line bg-wall shadow-sm">
      <div ref={host} className="h-full w-full" aria-label="Map of verified homes" />

      <div className="absolute right-3 top-3 z-[500] flex flex-col items-end gap-2">
        <div className="flex rounded-full border border-line bg-white/95 p-0.5 shadow-sm backdrop-blur" role="group" aria-label="Map style">
          {(["street", "satellite"] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={layer === k}
              onClick={() => setLayer(k)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${layer === k ? "bg-ink text-white" : "text-ink"}`}
            >
              {k === "street" ? "Map" : "Satellite"}
            </button>
          ))}
        </div>
        <button type="button" onClick={fit} className="btn btn-quiet btn-sm bg-white/95 shadow-sm backdrop-blur">
          Show all homes
        </button>
      </div>

      {results.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[500] mx-auto w-fit -translate-y-1/2 rounded-full bg-white px-4 py-2 text-sm shadow">
          No homes match these filters
        </div>
      )}

      {!active && results.length > 0 && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-[500] flex items-center gap-2 rounded-full border border-line bg-white/95 px-3.5 py-2 text-sm shadow-sm backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-seal" />
          <span className="font-semibold tnum">{results.length}</span>
          <span className="text-graphite">verified {results.length === 1 ? "home" : "homes"}, prices a month all in</span>
        </div>
      )}

      {active && (
        <div className="absolute bottom-4 left-4 right-4 z-[500] sm:right-auto sm:w-[380px]">
          <div className="relative overflow-hidden rounded-3xl border border-line bg-white shadow-xl">
            <span className="absolute inset-y-0 left-0 w-1 bg-seal" aria-hidden="true" />
            <button
              type="button"
              onClick={() => onActive(null)}
              aria-label="Close"
              className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-graphite shadow-sm hover:text-ink"
            >
              <Icon.Close size={16} />
            </button>
            <Link href={`/stays/${active.id}${carry}`} className="flex gap-4 p-4 pl-5">
              <PlanThumb listing={active} className="h-[104px] w-[116px] shrink-0 !rounded-2xl !p-2" />
              <span className="min-w-0 flex-1 pr-5">
                <VerifiedPill />
                <span className="mt-1.5 block truncate font-display text-[17px] font-semibold leading-snug">{active.title}</span>
                <span className="block text-xs text-graphite">
                  {layoutLabel[active.layout]}, {active.sqft} sq ft, {active.area}
                </span>
                <span className="mt-2 flex items-baseline gap-1.5 tnum">
                  <span className="font-display text-xl font-semibold tracking-tight">
                    {formatINR(quote(active.rent, months).perMonth)}
                  </span>
                  <span className="text-xs text-graphite">a month, all in</span>
                </span>
                <span className="mt-1 flex items-center gap-3 text-xs text-graphite tnum">
                  <span className="inline-flex items-center gap-1">
                    <Icon.Wifi size={13} /> {active.wifiMbps} Mbps
                  </span>
                  {active.rating && (
                    <span className="inline-flex items-center gap-1">
                      <Icon.Star size={12} className="text-amber" /> {active.rating.toFixed(1)}
                    </span>
                  )}
                </span>
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
