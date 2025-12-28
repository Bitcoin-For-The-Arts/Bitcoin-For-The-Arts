import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import SiteFooter from "@/components/SiteFooter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bitcoinforthearts.org"),
  title: {
    default: "Bitcoin for the Arts",
    template: "%s • Bitcoin for the Arts",
  },
  description:
    "A nonprofit supporting artists with Bitcoin micro-grants, workshops, residencies, and productions — with radical transparency.",
  applicationName: "Bitcoin for the Arts",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://bitcoinforthearts.org",
    title: "Bitcoin for the Arts",
    description:
      "Supporting artists with Bitcoin micro-grants, workshops, residencies, and productions — with radical transparency.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-white text-black`}
      >
        <Navigation />
        <div className="min-h-[calc(100svh-64px)]">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
