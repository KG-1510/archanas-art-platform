import { Suspense } from "react";
import { sanityConfigured } from "@/sanity/env";
import { Studio } from "./Studio";

export { metadata, viewport } from "next-sanity/studio";

export function generateStaticParams() {
  return [{ tool: [] }];
}

export default function StudioPage() {
  if (!sanityConfigured) {
    return (
      <main className="shell flex min-h-screen flex-col justify-center gap-5 py-20">
        <p className="eyebrow">Content studio</p>
        <h1 className="text-5xl">Sanity is not connected yet</h1>
        <p className="max-w-xl text-muted">
          Create a project at sanity.io/manage, then add NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET
          to .env.local and restart. Until then the site shows sample content.
        </p>
      </main>
    );
  }
  return (
    <Suspense fallback={null}>
      <Studio />
    </Suspense>
  );
}
