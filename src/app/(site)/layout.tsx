import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { Loader } from "@/components/Loader";
import { ScrollFX } from "@/components/ScrollFX";
import { WebMCPTools } from "@/components/WebMCPTools";
import { WhatsAppFloat } from "@/components/WhatsAppButton";
import { site } from "@/lib/site";

const organization = {
  "@context": "https://schema.org",
  "@type": ["ArtGallery", "LocalBusiness"],
  "@id": `${site.url}/#studio`,
  name: site.name,
  description: site.description,
  url: site.url,
  telephone: site.phoneE164,
  founder: { "@type": "Person", name: site.artist, jobTitle: "Artist and art teacher" },
  address: {
    "@type": "PostalAddress",
    streetAddress: `${site.address.line1}, ${site.address.line2}`,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  sameAs: [site.social.instagram, site.social.youtube, site.social.facebook],
};

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-3 focus:text-ivory"
      >
        Skip to content
      </a>
      <Loader />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
      <ScrollFX />
      <WebMCPTools />
      <JsonLd data={organization} />
    </>
  );
}
