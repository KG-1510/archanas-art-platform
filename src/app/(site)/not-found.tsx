import Link from "next/link";

export default function NotFound() {
  return (
    <section className="shell flex flex-col items-center py-28 text-center md:py-40">
      <p className="eyebrow">Page not found</p>
      <h1 className="mt-6 max-w-3xl text-5xl md:text-7xl">This page is not in the studio.</h1>
      <p className="mt-8 max-w-xl text-lg text-muted">The link may be old, or the painting may have been taken down.</p>
      <Link href="/shop" className="btn mt-10">
        Go to the marketplace
      </Link>
    </section>
  );
}
