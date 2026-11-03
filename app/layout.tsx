import type { Metadata, Viewport } from "next";
import { Figtree, Newsreader, Space_Grotesk } from "next/font/google";
import { Clarity } from "@/components/clarity";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reframe",
  description: "Slide the pieces. Reframe the masterpiece.",
};

// Self-hosted and preloaded by next/font: no requests to Google, and no layout shift when they load.
// All three are variable fonts, so one file each covers every weight the app uses.
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const newsreader = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-newsreader" });

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${figtree.variable} ${spaceGrotesk.variable} ${newsreader.variable}`}>
      <body>
        {children}
        <Clarity />
      </body>
    </html>
  );
}
