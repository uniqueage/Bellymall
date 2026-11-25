import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "../src/App";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bellymall-ng.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bellymall — Hungry? Enter the mall",
    template: "%s · Bellymall",
  },
  description:
    "Bellymall is the food hall in your pocket — jollof, swallow, suya, snacks and everything you love, delivered hot in minutes.",
  applicationName: "Bellymall",
  keywords: ["Bellymall", "food delivery", "Lagos food", "jollof", "suya", "food hall"],
  openGraph: {
    type: "website",
    siteName: "Bellymall",
    title: "Bellymall — Hungry? Enter the mall",
    description:
      "From street cravings to chef specials — 120+ stalls under one roof, delivered hot in minutes.",
    url: "/",
    images: [
      {
        url: "/images/rice-feast-pans.jpg",
        width: 1200,
        height: 630,
        alt: "A spread of seasoned rice, grilled chicken and plantain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bellymall — Hungry? Enter the mall",
    description: "120+ stalls under one roof, delivered hot in minutes.",
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='18' fill='%232B1A12'/%3E%3Ctext x='32' y='44' font-family='Georgia,serif' font-size='34' fill='%23F7F0E6' text-anchor='middle'%3EB%3C/text%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2B1A12",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
