import Image from "next/image";
import Link from "next/link";
import { FacebookIcon, InstagramIcon, MapPinIcon, PhoneIcon, YouTubeIcon } from "./Icons";
import { Lines } from "./Reveal";
import { WhatsAppIcon } from "./WhatsAppButton";
import { legalNav, nav, site, whatsappLink } from "@/lib/site";

// A fixed year keeps the footer static; update when the calendar turns.
const YEAR = 2026;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Image src="/logo.jpg" alt="Archana's Art logo: a painter's palette and brush" width={160} height={160} className="h-36 w-36 mix-blend-multiply" />
          <p className="font-display text-2xl font-medium">{site.name}</p>
          <p className="max-w-xs text-muted">
            The studio of {site.artist}. 40+ years of teaching and creating, all art forms under one roof.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-3">
          <p className="eyebrow">Explore</p>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-oxblood transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <p className="eyebrow">Visit</p>
          <address className="not-italic text-muted">
            {site.address.line1}
            <br />
            {site.address.line2}
            <br />
            {site.address.city} – {site.address.postalCode}
          </address>
          <a href={site.maps.studio} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 hover:text-oxblood transition-colors">
            <MapPinIcon />
            Art studio on Google Maps
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <p className="eyebrow">Connect</p>
          <a href={`tel:${site.phoneE164}`} className="inline-flex items-center gap-2.5 hover:text-oxblood transition-colors">
            <PhoneIcon />
            {site.phoneDisplay}
          </a>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 hover:text-oxblood transition-colors">
            <WhatsAppIcon className="h-[1.1em] w-[1.1em] shrink-0" />
            Chat on WhatsApp
          </a>
          <a href={site.social.instagram} target="_blank" rel="noopener noreferrer me" className="inline-flex items-center gap-2.5 hover:text-oxblood transition-colors">
            <InstagramIcon />
            Instagram
          </a>
          <a href={site.social.youtube} target="_blank" rel="noopener noreferrer me" className="inline-flex items-center gap-2.5 hover:text-oxblood transition-colors">
            <YouTubeIcon />
            YouTube
          </a>
          <a href={site.social.facebook} target="_blank" rel="noopener noreferrer me" className="inline-flex items-center gap-2.5 hover:text-oxblood transition-colors">
            <FacebookIcon />
            Facebook
          </a>
        </div>
      </div>

      <div aria-hidden="true">
      <Lines className="overflow-hidden border-t border-line">
        <p className="footer-mark line shell py-6 text-center font-display font-medium text-oxblood md:py-8">
          <span>
            Archana&rsquo;s <em>Art</em>
          </span>
        </p>
      </Lines>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-6 text-sm text-muted">
          <p>
            © {YEAR} {site.name}. All artworks © {site.artist}.
          </p>
          <ul className="flex flex-wrap gap-6">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-oxblood transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
