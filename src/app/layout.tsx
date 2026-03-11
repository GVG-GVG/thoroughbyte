import type { Metadata } from "next";
import "./globals.css";

// Note: Inter font is already loaded via link tag in globals.css
// Using system fonts as fallback to avoid connectivity issues during build

export const metadata: Metadata = {
  title: "ThoroughByte — Breeze Intelligence for Two-Year-Old Sales",
  description: "Multi-factor breeze analysis that rates every two-year-old before they race. Validated against 1,474 horses and $89M in real earnings.",
  openGraph: {
    type: "website",
    title: "ThoroughByte — Breeze Intelligence for Two-Year-Old Sales",
    description: "A proprietary algorithmic model that predicts racetrack performance before the starting gate opens. Validated against 1,474 horses and $89M in real earnings.",
    url: "https://thoroughbyte.com",
  },
  twitter: {
    card: "summary",
    title: "ThoroughByte — Breeze Intelligence",
    description: "Proprietary 2YO rating system validated against $89M in real earnings.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
