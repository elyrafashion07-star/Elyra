export type StaticPage = {
  slug: string;
  title: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
};

export const infoPages: StaticPage[] = [
  {
    slug: "about-us",
    title: "About Us",
    intro:
      "Elyrafashion is a 925 sterling silver jewellery studio built on one idea — that fine silver should be worn, not saved for occasions.",
    sections: [
      {
        heading: "Our Story",
        body: [
          "Elyrafashion began with a small workbench and a stubborn belief: that everyday jewellery deserves the same care as heirloom pieces. What started as a handful of designs has grown into a full collection of rings, chains, anklets, pendants and men's silver — each one hallmarked, hand-finished and made to be worn hard.",
          "We work only in 925 sterling silver. Not plated brass, not alloy. Every batch is BIS hallmarked before it leaves our workshop, and every order ships with a certificate of authenticity.",
        ],
      },
      {
        heading: "How We Make It",
        body: [
          "Designs are drawn in-house, cast in small batches, then hand-finished by karigars who have been working silver for decades. Stones are set by hand. Every piece is polished, checked and weighed before packing.",
          "Small batches mean we can keep quality tight and prices honest — you are paying for the silver and the craft, not for a long retail chain.",
        ],
      },
      {
        heading: "What We Promise",
        body: [
          "BIS hallmarked 925 sterling silver on every piece. Free shipping across India. Secure online payments — UPI, cards, net banking and wallets. Easy 7-day returns, no questions asked. And a WhatsApp line that an actual human answers.",
        ],
      },
    ],
  },
  {
    slug: "contact-us",
    title: "Contact Us",
    intro: "Questions about an order, a size, or a custom piece? We usually reply within a few hours.",
    sections: [
      {
        heading: "Reach Us",
        body: [
          "WhatsApp and phone: +91 92176 20575 — Monday to Saturday, 10:00 AM to 7:00 PM IST.",
          "Email: elyrafashion07@gmail.com — we answer every mail within one working day.",
        ],
      },
      {
        heading: "Order Support",
        body: [
          "Have your order number ready and we can pull up tracking, arrange an exchange, or check stock on a size in one message.",
          "For bulk, corporate or wedding-party orders, mail us with quantities and a rough timeline and we will send a quote.",
        ],
      },
    ],
  },
  {
    slug: "jewellery-care",
    title: "Jewellery Care",
    intro: "Sterling silver is durable, but it likes a little attention. Here is how to keep yours bright.",
    sections: [
      {
        heading: "Everyday Habits",
        body: [
          "Put jewellery on last — after perfume, lotion and hairspray. Take it off first, before swimming, showering or the gym. Chlorine and salt water dull silver faster than anything else.",
          "Sweat and humidity cause tarnish. Wipe pieces with a soft dry cloth after wearing.",
        ],
      },
      {
        heading: "Cleaning",
        body: [
          "For light tarnish, use the polishing cloth included with your order. Rub gently in straight lines, not circles.",
          "For chains and textured pieces, use a drop of mild dish soap in warm water, a soft toothbrush, then rinse and pat dry completely. Never use toothpaste or baking soda on plated or stone-set pieces.",
        ],
      },
      {
        heading: "Storage",
        body: [
          "Store each piece separately in the pouch it arrived in, away from air and light. An anti-tarnish strip in your box buys you months.",
          "Gold-plated silver should never be scrubbed — wipe only, and avoid polishing cloths, which strip plating.",
        ],
      },
    ],
  },
  {
    slug: "certificate-of-authenticity",
    title: "Certificate of Authenticity",
    intro:
      "Every Elyrafashion piece ships with a certificate confirming its purity, weight and hallmark. Here is what that means.",
    sections: [
      {
        heading: "What It Certifies",
        body: [
          "The certificate records the metal purity (925 sterling silver), the piece weight, the stone type where applicable, and the BIS hallmark reference.",
          "It is your proof of purity for resale, insurance or exchange — keep it with the piece.",
        ],
      },
      {
        heading: "How We Test",
        body: [
          "Every batch is assayed before it is hallmarked. Silver that does not meet the 92.5% threshold does not get packed, full stop.",
          "Pieces are then inspected individually for setting security, clasp strength and finish before they are boxed.",
        ],
      },
    ],
  },
  {
    slug: "track-order",
    title: "Track My Order",
    intro: "Your tracking link is emailed and WhatsApped the moment your parcel is picked up.",
    sections: [
      {
        heading: "Finding Your Tracking",
        body: [
          "Check the shipping confirmation email for a tracking number and courier name. Tracking usually goes live 12–24 hours after dispatch.",
          "If your order was placed as a guest, message us on WhatsApp with your phone number and we will look it up.",
        ],
      },
      {
        heading: "Delivery Timelines",
        body: [
          "Metros: 2–4 working days. Rest of India: 4–7 working days. Orders are dispatched within 24–48 hours of confirmation.",
          "Since every order is paid for online, dispatch begins as soon as the payment is confirmed.",
        ],
      },
    ],
  },
];

export const policyPages: StaticPage[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    intro: "We collect the minimum we need to get your order to you, and we do not sell it to anyone.",
    sections: [
      {
        heading: "What We Collect",
        body: [
          "Name, shipping address, phone number and email — used only to process, ship and support your order.",
          "Payment details are handled entirely by our payment gateway. We never see or store your card or UPI credentials.",
        ],
      },
      {
        heading: "How We Use It",
        body: [
          "To fulfil orders, send delivery updates, handle returns, and — only if you opt in — send occasional offers. You can unsubscribe from any email in one click.",
          "We share data only with couriers and payment processors, and only what they need to do their job.",
        ],
      },
      {
        heading: "Your Rights",
        body: [
          "Write to elyrafashion07@gmail.com to access, correct or delete your data. We action requests within 30 days.",
        ],
      },
    ],
  },
  {
    slug: "shipping-policy",
    title: "Shipping Policy",
    intro: "Free shipping on every order across India, with no minimum cart value.",
    sections: [
      {
        heading: "Dispatch",
        body: [
          "Orders placed before 2:00 PM IST on a working day are usually dispatched the same day. Everything else goes out within 24–48 hours.",
          "You will receive a tracking link on email and WhatsApp at dispatch.",
        ],
      },
      {
        heading: "Delivery",
        body: [
          "Metro cities: 2–4 working days. Rest of India: 4–7 working days. Remote pin codes may take longer.",
          "We currently ship within India only. For international enquiries, write to us.",
        ],
      },
      {
        heading: "Payment",
        body: [
          "All orders are prepaid. We accept UPI, cards, net banking and wallets through our payment partner — your card details never touch our servers.",
          "Cash on delivery is not available.",
        ],
      },
    ],
  },
  {
    slug: "refund-policy",
    title: "Return & Refund Policy",
    intro: "Easy 7-day returns. If a piece is not right, send it back.",
    sections: [
      {
        heading: "Eligibility",
        body: [
          "Returns are accepted within 7 days of delivery, on unworn pieces in original packaging with the certificate of authenticity included.",
          "Customised, engraved and pierced items (including earrings, for hygiene reasons) cannot be returned unless they arrived damaged.",
        ],
      },
      {
        heading: "How to Return",
        body: [
          "Message us on WhatsApp with your order number and a photo. We will arrange a reverse pickup wherever the courier services it.",
          "Once the piece reaches us and passes inspection, refunds are issued to the original payment method within 5–7 working days.",
        ],
      },
      {
        heading: "Exchanges",
        body: [
          "Size exchanges on rings and chains are free once per order. Just tell us the size you need when you raise the request.",
        ],
      },
    ],
  },
  {
    slug: "terms-of-service",
    title: "Terms of Service",
    intro: "The ground rules for buying from Elyrafashion.",
    sections: [
      {
        heading: "Orders & Pricing",
        body: [
          "All prices are in Indian Rupees and inclusive of applicable taxes. We reserve the right to correct pricing errors and to cancel an order if a listing was clearly mispriced, with a full refund.",
          "Placing an order is an offer to buy; the contract is formed when we confirm dispatch.",
        ],
      },
      {
        heading: "Product Representation",
        body: [
          "Silver is a natural material and hand-finishing means small variations in polish, oxidation and stone tone are normal. Screen colours may differ slightly from the piece in hand.",
          "Weights listed are nominal and may vary within a small tolerance.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "Our liability for any order is limited to the amount you paid for it. We are not liable for damage caused by misuse, chemical exposure, or repairs carried out elsewhere.",
        ],
      },
    ],
  },
];

export const allStaticPages = [...infoPages, ...policyPages];
