import { FacebookIcon, InstagramIcon, MapPinIcon, PhoneIcon, YouTubeIcon } from "@/components/Icons";
import { EnquiryForm } from "@/components/EnquiryForm";
import { PageIntro } from "@/components/PageIntro";
import { Reveal } from "@/components/Reveal";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { getServices } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { site, whatsappLink } from "@/lib/site";

export const metadata = pageMeta(
  "/contact",
  "Contact",
  "Contact Archana's Art in Bengaluru: phone, WhatsApp, studio and residence locations, Instagram, YouTube and Facebook.",
);

export default async function ContactPage() {
  const services = await getServices();

  return (
    <>
      <PageIntro eyebrow="Contact" title="Visit, call, or send a message">
        <p>The quickest way to reach {site.artist} is WhatsApp.</p>
      </PageIntro>

      <section className="shell grid gap-16 pb-24 md:grid-cols-2 md:pb-32">
        <Reveal stagger className="flex flex-col gap-10">
          <div>
            <h2 className="text-3xl">Phone &amp; WhatsApp</h2>
            <p className="mt-3 text-lg">
              <a href={`tel:${site.phoneE164}`} className="inline-flex items-center gap-3 hover:text-oxblood">
                <PhoneIcon className="h-5 w-5 text-oxblood" />
                {site.phoneDisplay}
              </a>
            </p>
            <a href={whatsappLink("Hello, I would like to know more about Archana's Art.")} target="_blank" rel="noopener noreferrer" className="btn mt-5">
              <WhatsAppIcon className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>

          <div>
            <h2 className="text-3xl">Art studio</h2>
            <address className="mt-3 not-italic text-muted">
              {site.studio.line1}
              <br />
              {site.studio.line2}
              <br />
              {site.studio.city} – {site.studio.postalCode}
            </address>
            <a href={site.maps.studio} target="_blank" rel="noopener noreferrer" className="link-line mt-4 inline-flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" />
              Open in Google Maps
            </a>
          </div>

          <div>
            <h2 className="text-3xl">Classes at the residence</h2>
            <address className="mt-3 not-italic text-muted">
              {site.address.line1}, {site.address.line2}
              <br />
              {site.address.city} – {site.address.postalCode}
            </address>
            <a href={site.maps.residence} target="_blank" rel="noopener noreferrer" className="link-line mt-4 inline-flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" />
              Open in Google Maps
            </a>
          </div>

          <div>
            <h2 className="text-3xl">Follow the work</h2>
            <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-4">
              <li>
                <a href={site.social.instagram} target="_blank" rel="noopener noreferrer me" className="link-line inline-flex items-center gap-2">
                  <InstagramIcon className="h-4 w-4" />
                  Instagram
                </a>
              </li>
              <li>
                <a href={site.social.youtube} target="_blank" rel="noopener noreferrer me" className="link-line inline-flex items-center gap-2">
                  <YouTubeIcon className="h-4 w-4" />
                  YouTube
                </a>
              </li>
              <li>
                <a href={site.social.facebook} target="_blank" rel="noopener noreferrer me" className="link-line inline-flex items-center gap-2">
                  <FacebookIcon className="h-4 w-4" />
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </Reveal>

        <Reveal className="border border-line bg-surface p-8 md:p-12 md:self-start">
          <h2 className="text-4xl">Send an enquiry</h2>
          <div className="mt-8">
            <EnquiryForm topics={[...services.map((s) => s.title), "Buying a painting", "Something else"]} />
          </div>
        </Reveal>
      </section>
    </>
  );
}
