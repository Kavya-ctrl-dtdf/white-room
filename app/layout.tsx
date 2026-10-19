import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource-variable/instrument-sans";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Footer, Nav, Toast } from "@/components/Shell";

export const metadata: Metadata = {
  title: "White Room: verified serviced apartments in Bengaluru",
  description:
    "Furnished serviced apartments in Bengaluru for 15 days to six months. Every home is visited and checked in person before it is listed.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body>
        <StoreProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
