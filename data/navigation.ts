import type { NavItem } from "@/lib/types";

export const mainNav: NavItem[] = [
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Bestseller", href: "/collections/bestseller" },
  {
    label: "For Her",
    href: "/collections/women",
    children: [
      { label: "Rings", href: "/collections/rings" },
      { label: "Neckchains", href: "/collections/neck-chains" },
      { label: "Earrings", href: "/collections/earrings" },
      { label: "Anklets", href: "/collections/anklets" },
      { label: "Bracelets", href: "/collections/bracelets" },
      { label: "Pendant Sets", href: "/collections/pendants" },
    ],
  },
  {
    label: "For Him",
    href: "/collections/men",
    children: [
      { label: "Bracelets", href: "/collections/bracelets-men" },
      { label: "Kurta Buttons", href: "/collections/kurta-buttons" },
      { label: "Rings", href: "/collections/men-rings" },
      { label: "Brooches", href: "/collections/brooches" },
    ],
  },
  {
    label: "Gifting",
    href: "/collections/gifts",
    children: [
      { label: "Birthday", href: "/collections/birthday" },
      { label: "Anniversary", href: "/collections/anniversary" },
      { label: "Gift for Her", href: "/collections/gift-for-her" },
      { label: "Gift for Him", href: "/collections/gift-for-him" },
    ],
  },
  { label: "Rakhi Collection 2026", href: "/collections/rakhi-2026" },
];

export const footerCategories: NavItem[] = [
  { label: "All Jewellery", href: "/collections/all" },
  { label: "Rings", href: "/collections/rings" },
  { label: "Bracelets", href: "/collections/bracelets" },
  { label: "Pendants", href: "/collections/pendants" },
  { label: "Anklets", href: "/collections/anklets" },
  { label: "Earrings", href: "/collections/earrings" },
];

export const footerQuickLinks: NavItem[] = [
  { label: "About Us", href: "/pages/about-us" },
  { label: "Contact", href: "/pages/contact-us" },
  { label: "Track My Order", href: "/pages/track-order" },
  { label: "Certificate of Authenticity", href: "/pages/certificate-of-authenticity" },
  { label: "Jewellery Care", href: "/pages/jewellery-care" },
  { label: "Privacy Policy", href: "/policies/privacy-policy" },
  { label: "Shipping Policy", href: "/policies/shipping-policy" },
  { label: "Terms of Service", href: "/policies/terms-of-service" },
  { label: "Return & Refund Policy", href: "/policies/refund-policy" },
];
