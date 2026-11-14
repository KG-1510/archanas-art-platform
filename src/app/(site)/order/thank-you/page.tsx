import type { Metadata } from "next";
import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

export default function ThankYouPage() {
  return (
    <section className="shell flex flex-col items-center py-28 text-center md:py-40">
      <p className="eyebrow rise">Payment received</p>
      <h1 className="rise rise-2 mt-6 max-w-3xl text-5xl md:text-7xl">Thank you. The painting is yours.</h1>
      <p className="rise rise-3 mt-8 max-w-xl text-lg text-muted">
        {site.artist} will pack it by hand and contact you on the phone number or email you gave with the courier
        name and tracking number.
      </p>
      <div className="rise rise-4 mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/shop" className="btn">
          Back to the marketplace
        </Link>
        <a href={whatsappLink("Hello, I have just bought a painting from the website.")} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
          Message the studio
        </a>
      </div>
    </section>
  );
}
