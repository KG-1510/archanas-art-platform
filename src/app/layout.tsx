import type { Metadata, Viewport } from "next";
import { Jost, Playfair_Display } from "next/font/google";
import { defaultShareImage } from "@/lib/meta";
import { site } from "@/lib/site";
import "./globals.css";

// Headings. Playfair Display has lining figures, so a "1" reads as a 1 (Cormorant's looked like a capital I).
const display = Playfair_Display({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { siteName: site.name, type: "website", locale: "en_IN", title: `${site.name} | ${site.tagline}`, description: site.description, images: [defaultShareImage] },
  twitter: { card: "summary_large_image", images: [defaultShareImage] },
};

export const viewport: Viewport = { themeColor: "#faf7f2" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" suppressHydrationWarning className={`${display.variable} ${jost.variable} h-full antialiased`}>
      <head>
        {/* Runs before first paint: marks JS as available (so the first-visit curtain can show and the
            entrance can wait for it), and skips the curtain on later pages in the same visit. A plain
            inline script, because next/script only runs once the framework has loaded. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(d){d.classList.add('js');try{if(sessionStorage.getItem('aa-loaded')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('seen');d.dataset.ready='1'}}catch(e){}})(document.documentElement)",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
