import type { LegalPage, Service, ShippingRates } from "./types";

// Default text used until the same content is written in the Sanity studio.
// There are no sample paintings: the marketplace shows only what is in Sanity.
export const seedServices: Service[] = [
  {
    _id: "svc-paintings", slug: "paintings", title: "Paintings",
    summary: "Original paintings by Dr. Archana Gupta, available from the marketplace as originals or prints, or made to commission.",
    details: ["Originals are one of a kind. Selected works are also available as prints.", "Commissions are discussed one to one: subject, size, medium and timeline.", "Couriered across India and internationally."],
  },
  {
    _id: "svc-classes", slug: "art-classes", title: "Art Classes",
    summary: "Regular classes for beginners and practising artists, taught personally at the studio and at the residence in Bengaluru.",
    details: ["Many art forms taught under one roof.", "Guidance shaped by 40+ years of teaching.", "Message on WhatsApp for current batches and timings."],
  },
  {
    _id: "svc-workshops", slug: "workshops", title: "Workshops",
    summary: "Focused sessions on a single technique or art form, for individuals and groups.",
    details: ["Short-format, hands-on sessions.", "Suitable for groups, schools and organisations.", "Topics and dates are shared on Instagram and WhatsApp."],
  },
  {
    _id: "svc-demos", slug: "demos", title: "Demos",
    summary: "Live demonstrations of a technique from first stroke to finished piece.",
    details: ["Watch the full process and ask questions as it happens.", "Available for events, art groups and institutions."],
  },
  {
    _id: "svc-mandala", slug: "mandala", title: "Mandala",
    summary: "Mandala art: learn the geometry, patterning and patience behind it, or commission a finished piece.",
    details: ["Taught step by step, from grid to detailing.", "Finished mandala works appear in the marketplace."],
  },
  {
    _id: "svc-nippon", slug: "nippon-art", title: "Nippon Art",
    summary: "Nippon art taught and created at the studio, with finished pieces available to buy.",
    details: ["Learn the technique from the basics.", "Finished Nippon works appear in the marketplace."],
  },
];

// Courier charges used until real values are set in Sanity → Site settings.
export const seedShipping: ShippingRates = { indiaINR: 500, internationalINR: 2000 };

export const seedLegal: LegalPage[] = [
  {
    slug: "privacy", title: "Privacy Policy", updated: "2026-11-14", intro: "",
    sections: [
      { heading: "What we collect", body: "When you buy a painting we collect your name, email address, phone number and delivery address. When you enquire through WhatsApp, we receive whatever you choose to send us there." },
      { heading: "How we use it", body: "We use your details only to process your order, arrange the courier, and contact you about your purchase or enquiry. We do not sell your details or use them for advertising." },
      { heading: "Payments", body: "Payments are processed by Razorpay. Card, UPI and bank details are entered on Razorpay's secure checkout and never reach or get stored on this website." },
      { heading: "Who we share it with", body: "We share your name, phone number and address with the courier company delivering your painting, and order details with Razorpay to take payment. Nobody else." },
      { heading: "Accounts and cookies", body: "This website has no customer accounts. It does not use advertising or tracking cookies." },
      { heading: "Your choices", body: "You can ask us to correct or delete the details we hold about you by contacting us on the phone number on the contact page. We keep order records for as long as tax and accounting law requires." },
    ],
  },
  {
    slug: "terms", title: "Terms of Service", updated: "2026-11-14", intro: "",
    sections: [
      { heading: "About these terms", body: "This website is run by Archana's Art, Bengaluru, India. By using the site or buying from it you agree to these terms." },
      { heading: "The artworks", body: "Original artworks are made by hand and each is sold only once. Some works are also offered as prints, which are reproductions of the original. Colours can look slightly different on screen than in person, and small variations in texture and finish are part of handmade work." },
      { heading: "Prices and payment", body: "Prices are listed in Indian Rupees (INR). Courier charges are shown at checkout before you pay. Payment is taken in full at the time of order through Razorpay." },
      { heading: "Availability", body: "An original can be sold only once. If an original is sold to someone else before your payment completes, your payment will be refunded in full. Prints remain available after the original is sold." },
      { heading: "Copyright", body: "Buying a painting gives you ownership of the physical artwork. Copyright and reproduction rights stay with the artist unless agreed in writing." },
      { heading: "Classes and workshops", body: "Classes, workshops and demos are arranged directly with the studio. Fees, schedules and cancellation terms are confirmed when you book." },
      { heading: "Governing law", body: "These terms are governed by the laws of India, and the courts of Bengaluru have jurisdiction." },
    ],
  },
  {
    slug: "shipping-returns", title: "Shipping & Returns", updated: "2026-11-14", intro: "",
    sections: [
      { heading: "Where we ship", body: "We courier paintings across India and internationally." },
      { heading: "Packing and dispatch", body: "Each painting is packed by hand for safe transit. We will share the courier name and tracking number once your order is dispatched." },
      { heading: "Courier charges", body: "Standard courier is ₹500 within India and ₹2,000 for international delivery, added at checkout. These charges are subject to change; the charge shown at checkout before you pay is the one that applies to your order." },
      { heading: "International orders", body: "Customs duties, import taxes and clearance fees charged by the destination country are paid by the buyer and are not included in our prices." },
      { heading: "Damage in transit", body: "If your painting arrives damaged, contact us within 48 hours of delivery with photographs of the packaging and the artwork, and we will work out a repair, replacement or refund with you." },
      { heading: "Returns and cancellations", body: "Because originals are one-off pieces and prints are made to order, we do not accept returns for change of mind. An order can be cancelled for a full refund any time before it is dispatched." },
      { heading: "Refunds", body: "Approved refunds are made to the original payment method through Razorpay and usually take 5 to 7 working days to appear." },
    ],
  },
];
