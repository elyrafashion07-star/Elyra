import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import MobileToolbar from "@/components/layout/MobileToolbar";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import { site } from "@/data/site";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const body = Jost({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description:
    "Shop BIS-certified 925 sterling silver jewellery — rings, anklets, bracelets, pendants, rakhis and men's silver. Free shipping across India, COD available, easy 7-day returns.",
  keywords: ["925 sterling silver", "silver jewellery India", "anklets", "rakhi", "silver rings"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* pb clears the fixed MobileToolbar (h-14) so the footer isn't hidden behind it. */}
      <body className={`${display.variable} ${body.variable} pb-14 antialiased xl:pb-0`}>
        <AnnouncementBar />
        <Header />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
        <MobileToolbar />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
