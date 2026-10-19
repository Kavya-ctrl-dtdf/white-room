"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SEED_LISTINGS } from "./data";
import type { Booking, Listing } from "./types";

const KEY = "white-room-demo-v1";

interface State {
  listings: Listing[];
  bookings: Booking[];
}

interface Store extends State {
  ready: boolean;
  toastMessage: string | null;
  addBooking: (b: Booking) => void;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  addListing: (l: Listing) => void;
  updateListing: (id: string, patch: Partial<Listing>) => void;
  reset: () => void;
  toast: (message: string) => void;
}

const seed = (): State => ({ listings: SEED_LISTINGS, bookings: [] });

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(seed);
  const [ready, setReady] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        if (Array.isArray(parsed.listings) && Array.isArray(parsed.bookings)) setState(parsed);
      }
    } catch {
      /* storage unavailable or corrupt: keep seed data */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  const toast = useCallback((message: string) => {
    setToastMessage(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMessage(null), 3200);
  }, []);

  const addBooking = useCallback((b: Booking) => setState((s) => ({ ...s, bookings: [b, ...s.bookings] })), []);
  const updateBooking = useCallback(
    (id: string, patch: Partial<Booking>) =>
      setState((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
    [],
  );
  const addListing = useCallback((l: Listing) => setState((s) => ({ ...s, listings: [...s.listings, l] })), []);
  const updateListing = useCallback(
    (id: string, patch: Partial<Listing>) =>
      setState((s) => ({ ...s, listings: s.listings.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
    [],
  );
  const reset = useCallback(() => {
    setState(seed());
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    toast("Demo data reset");
  }, [toast]);

  const value = useMemo<Store>(
    () => ({ ...state, ready, toastMessage, addBooking, updateBooking, addListing, updateListing, reset, toast }),
    [state, ready, toastMessage, addBooking, updateBooking, addListing, updateListing, reset, toast],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
