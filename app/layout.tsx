import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alinnia Studios | Creators of Everland",
  description:
    "Alinnia Studios is an independent game development studio. Pre-register for Everland — the next-generation territorial conquest and grand strategy game.",
  keywords: [
    "Alinnia Studios",
    "Everland",
    "Conquer Countries",
    "Strategy Game",
    "Territorial Strategy",
    "Grand Strategy",
    "Indie Game Studio",
    "World Domination Game",
  ],
  authors: [{ name: "Alinnia Studios" }],
  openGraph: {
    title: "Alinnia Studios | Creators of Everland",
    description:
      "Master the map. Command armies, forge alliances, and conquer continents in Everland. Join the Closed Alpha.",
    url: "https://alinnia.com",
    siteName: "Alinnia Studios",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alinnia Studios | Creators of Everland",
    description:
      "Master the map. Command armies, forge alliances, and conquer continents in Everland. Join the Closed Alpha.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark font-sans">
      <body className="min-h-full flex flex-col bg-[#070a12] text-[#f1f5f9] tactical-grid selection:bg-[#00f0ff]/30 selection:text-[#00f0ff]">
        {children}
      </body>
    </html>
  );
}
