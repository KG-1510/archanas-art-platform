import Link from "next/link";
import { whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./WhatsAppButton";

/** The "page not found" message, used for unknown addresses and for paintings that no longer exist. */
export function NotFoundBody() {
  return (
    <section className="shell flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p aria-hidden="true" className="font-display text-[clamp(6rem,24vw,16rem)] font-medium leading-none text-oxblood">
        4<em className="text-brass">0</em>4
      </p>
      <p className="eyebrow mt-6">Page not found</p>
      <h1 className="mega mt-4 max-w-3xl text-4xl md:text-6xl">
        This canvas is still <em className="text-oxblood">blank</em>.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted">
        The page you were looking for is not here. The link may be old, or the painting may have found a new home.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Link href="/" className="btn">
          Go back home
        </Link>
        <Link href="/shop" className="btn btn-ghost">
          Visit the gallery
        </Link>
      </div>
      <a
        href={whatsappLink("Hello, I was looking for a page on the Archana's Art website and could not find it.")}
        target="_blank"
        rel="noopener noreferrer"
        className="link-line mt-10 inline-flex items-center gap-2"
      >
        <WhatsAppIcon className="h-4 w-4" />
        Or ask us on WhatsApp
      </a>
    </section>
  );
}
