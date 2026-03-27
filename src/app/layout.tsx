import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "FairwayFund",
  description:
    "A modern golf charity subscription platform for score tracking, monthly draws, and transparent impact.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-white">
        <div className="relative min-h-screen overflow-hidden">
          <div className="aurora aurora-one" />
          <div className="aurora aurora-two" />
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
