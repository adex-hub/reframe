import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reframe",
  description: "Slide the pieces. Reframe the masterpiece.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600&family=Space+Grotesk:wght@700&family=Newsreader:ital,wght@0,500;1,400&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
