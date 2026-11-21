import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NotFoundBody } from "@/components/NotFoundBody";

export const metadata = { title: "Page not found", robots: { index: false } };

/** Shown for any address that does not exist, anywhere on the site. */
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <NotFoundBody />
      </main>
      <Footer />
    </>
  );
}
