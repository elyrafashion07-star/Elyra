export const site = {
  name: "Elyrafashion",
  /** Display lockup — "ELYRA" in ink, "Fashion" in rose-gold, as in the logo artwork. */
  wordmark: { head: "ELYRA", tail: "Fashion" },
  tagline: "925 Sterling Silver Jewellery",
  phone: "+91 92176 20575",
  phoneHref: "tel:+919217620575",
  whatsapp: "919217620575",
  email: "elyrafashion07@gmail.com",
  about:
    "At Elyrafashion, we believe jewellery is more than adornment — it is an extension of who you are. Every piece is thoughtfully handcrafted in 925 sterling silver to celebrate individuality, elevate everyday style, and honour the moments that make life meaningful.",
  // Share links carry per-visitor tracking parameters (igsh, mibextid, rdid…)
  // that mean nothing to anyone else — these are the plain canonical URLs.
  instagram: "https://www.instagram.com/elyrafashion.in",
  facebook: "https://www.facebook.com/profile.php?id=61592668559526",
  copyright: `© ${new Date().getFullYear()} ELYRAFashion. All Rights Reserved.`,
};

export const announcements = [
  "🚚 FREE SHIPPING AVAILABLE ON ALL ORDERS",
  "💳 Secure Online Payments  |  5% Flat Off on First Order",
  "✨ 925 Sterling Silver  |  Certified  |  Easy 7-Day Returns",
];

export const trustStrip = [
  { label: "925 Sterling Silver", icon: "silver" },
  { label: "Free Shipping", icon: "shipping" },
  { label: "Secure Payments", icon: "payments" },
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
  "UPI · Cards · Net Banking",
  "Secure Payments",
  "Easy Returns",
  "Pan India Delivery",
];

export const popularSearches = ["Ring", "Earring", "Pendant", "Necklace", "Bracelet", "Anklet"];
