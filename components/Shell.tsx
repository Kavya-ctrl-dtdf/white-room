"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icons";
import { useStore } from "@/lib/store";

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="20" height="20" stroke="#18212B" strokeWidth="2" />
        <path d="M23 3a12 12 0 00-12 0" stroke="#18212B" strokeWidth="1.4" fill="none" strokeDasharray="2 2" />
        <rect x="9.5" y="11" width="7" height="7" fill="#0E7C66" />
      </svg>
      <span className="font-display text-[19px] font-semibold tracking-[-0.03em]">White Room</span>
    </span>
  );
}

function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-seal px-1.5 text-xs font-semibold text-white tnum">
      {n}
    </span>
  );
}

export function Nav() {
  const pathname = usePathname();
  const { bookings, listings } = useStore();
  const [open, setOpen] = useState(false);

  const tripCount = bookings.filter((b) => ["requested", "confirmed", "issue"].includes(b.status)).length;
  const adminCount =
    listings.filter((l) => l.status === "pending").length + bookings.filter((b) => b.status === "issue").length;

  const links = [
    { href: "/stays", label: "Find a stay", badge: 0 },
    { href: "/trips", label: "My stays", badge: tripCount },
    { href: "/host", label: "For owners", badge: 0 },
    { href: "/admin", label: "Verification desk", badge: adminCount },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between px-5">
        <Link href="/" aria-label="White Room home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`inline-flex items-center rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors ${
                  active ? "bg-wall text-ink" : "text-graphite hover:text-ink"
                }`}
              >
                {l.label}
                <Badge n={l.badge} />
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Icon.Close /> : <Icon.Menu />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-line bg-white px-5 py-3 md:hidden" aria-label="Mobile">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`flex items-center rounded-lg px-3 py-3 text-base font-medium ${
                pathname.startsWith(l.href) ? "bg-wall" : ""
              }`}
            >
              {l.label}
              <Badge n={l.badge} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  const { reset } = useStore();
  return (
    <footer className="mt-24 border-t border-line bg-wall">
      <div className="mx-auto max-w-page px-5 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-graphite">
              Verified serviced apartments in Bengaluru for stays of 15 days to six months.
            </p>
          </div>
          <FooterCol
            title="Stay"
            links={[
              { href: "/stays", label: "Find a stay" },
              { href: "/stays?for=parents", label: "Parents visiting" },
              { href: "/stays?for=work", label: "Work and projects" },
              { href: "/stays?for=treatment", label: "Treatment and recovery" },
            ]}
          />
          <FooterCol
            title="Owners"
            links={[
              { href: "/host", label: "Owner dashboard" },
              { href: "/host/new", label: "List a property" },
              { href: "/admin", label: "Verification desk" },
            ]}
          />
          <FooterCol
            title="Your account"
            links={[
              { href: "/trips", label: "My stays" },
              { href: "/", label: "How a stay works" },
            ]}
          />
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 text-sm text-graphite md:flex-row md:items-center md:justify-between">
          <p>Demo build for validation. Listings, hosts and prices are sample data; payments run in test mode.</p>
          <button type="button" onClick={reset} className="btn btn-quiet btn-sm self-start">
            Reset demo data
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="font-display text-base">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm text-graphite">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Toast() {
  const { toastMessage } = useStore();
  if (!toastMessage) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="toast fixed bottom-6 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white shadow-lg"
    >
      {toastMessage}
    </div>
  );
}
