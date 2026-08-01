export const site = {
  name: "Elyrafashion",
  /** Display lockup — "ELYRA" in ink, "Fashion" in rose-gold, as in the logo artwork. */
  wordmark: { head: "ELYRA", tail: "Fashion" },
  tagline: "925 Sterling Silver Jewellery",
  phone: "+91 81693 02654",
  phoneHref: "tel:+918169302654",
  whatsapp: "918169302654",
  email: "support@elyrafashion.in",
  about:
    "At Elyrafashion, we believe jewellery is more than adornment — it is an extension of who you are. Every piece is thoughtfully handcrafted in 925 sterling silver to celebrate individuality, elevate everyday style, and honour the moments that make life meaningful.",
  instagram: "https://instagram.com/",
  copyright: `© ${new Date().getFullYear()} ELYRAFashion. All Rights Reserved.`,
};

export const announcements = [
  "🚚 FREE SHIPPING AVAILABLE ON ALL ORDERS",
  "💳 COD Available  |  5% Flat Off on First Order",
  "✨ 925 Sterling Silver  |  Certified  |  Easy 7-Day Returns",
];

export const trustStrip = [
  { label: "925 Sterling Silver", icon: "silver" },
  { label: "Free Shipping", icon: "shipping" },
  { label: "COD Available", icon: "cod" },
  { label: "Easy 7-Day Returns", icon: "returns" },
  { label: "Certified", icon: "certified" },
] as const;

export const whyUs = [
  {
    title: "FREE SHIPPING",
    text: "Get free shipping on all orders across India, with no minimum cart value.",
    icon: "truck",
  },
  {
    title: "BIS CERTIFIED",
    text: "Every product is BIS hallmarked 925 sterling silver, tested for purity.",
    icon: "badge",
  },
  {
    title: "24/7 SUPPORT",
    text: "Dedicated customer care over WhatsApp, any day of the week.",
    icon: "headset",
  },
  {
    title: "SECURE PAYMENTS",
    text: "All major cards, UPI and net banking accepted on an encrypted checkout.",
    icon: "lock",
  },
];

export const footerBadges = [
  "100% Authentic Silver",
  "COD Available",
  "Secure Payments",
  "Easy Returns",
  "Pan India Delivery",
];

export const popularSearches = ["Ring", "Earring", "Pendant", "Necklace", "Bracelet", "Anklet"];
