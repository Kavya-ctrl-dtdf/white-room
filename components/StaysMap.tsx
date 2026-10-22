"use client";

import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker, TileLayer } from "leaflet";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";
import { PlanThumb } from "./ui";
import { BENGALURU, coordsFor } from "@/lib/geo";
import { formatINR, layoutLabel } from "@/lib/format";
import { quote } from "@/lib/pricing";
import type { Listing } from "@/lib/types";

type Layer = "street" | "satellite";
type LeafletModule = typeof import("leaflet");

const pinLabel = (n: number) => `₹${Math.round(n / 1000)}k`;

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
  const lastFit = useRef("");
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
      const m = L.map(host.current, { zoomControl: true }).setView(BENGALURU, 11);
      m.on("click", () => onActiveRef.current(null));
      map.current = m;
      setReady(true);
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      markers.current.clear();
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
  }, [ready, layer]);

  // Price pins follow the search results.
  useEffect(() => {
    const L = lib.current;
    const m = map.current;
    if (!ready || !L || !m) return;
    markers.current.forEach((mk) => mk.remove());
    markers.current.clear();
    const points: [number, number][] = [];
    for (const l of results) {
      const pos = coordsFor(l);
      points.push(pos);
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
    const key = results.map((r) => r.id).join(",");
    if (points.length > 0 && key !== lastFit.current) {
      m.fitBounds(L.latLngBounds(points).pad(0.25), { maxZoom: 14 });
    }
    lastFit.current = key;
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
    <div className="relative h-full min-h-[320px] overflow-hidden rounded-2xl border border-line bg-wall">
      <div ref={host} className="h-full w-full" aria-label="Map of verified homes" />

      <div className="absolute right-3 top-3 z-[500] flex flex-col items-end gap-2">
        <div className="flex rounded-full border border-line bg-white p-0.5 shadow-sm" role="group" aria-label="Map style">
          {(["street", "satellite"] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={layer === k}
              onClick={() => setLayer(k)}
              className={`rounded-full px-3 py-1 text-sm font-medium ${layer === k ? "bg-ink text-white" : "text-ink"}`}
            >
              {k === "street" ? "Map" : "Satellite"}
            </button>
          ))}
        </div>
        <button type="button" onClick={fit} className="btn btn-quiet btn-sm shadow-sm">
          Show all homes
        </button>
      </div>

      {results.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[500] mx-auto w-fit -translate-y-1/2 rounded-full bg-white px-4 py-2 text-sm shadow">
          No homes match these filters
        </div>
      )}

      {active && (
        <Link
          href={`/stays/${active.id}${carry}`}
          className="absolute bottom-3 left-3 right-3 z-[500] flex gap-3 rounded-2xl border border-line bg-white p-3 shadow-lg sm:right-auto sm:w-[340px]"
        >
          <PlanThumb listing={active} className="h-20 w-24 shrink-0 !p-1.5" />
          <span className="min-w-0">
            <span className="block text-xs text-graphite">
              {layoutLabel[active.layout]}, {active.sqft} sq ft, {active.area}
            </span>
            <span className="block truncate font-display text-base font-semibold leading-snug">{active.title}</span>
            <span className="mt-0.5 block text-sm tnum">
              <span className="font-semibold">{formatINR(quote(active.rent, months).perMonth)}</span>
              <span className="text-graphite"> a month, all in</span>
            </span>
            <span className="mt-0.5 flex items-center gap-1 text-xs text-graphite tnum">
              <Icon.Wifi size={13} /> {active.wifiMbps} Mbps measured
            </span>
          </span>
        </Link>
      )}
    </div>
  );
}
