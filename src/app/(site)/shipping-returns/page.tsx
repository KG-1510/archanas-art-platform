import { LegalPageView } from "@/components/LegalPageView";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("/shipping-returns", "Shipping & Returns", "Courier, international delivery, damage, returns and refund terms for artworks bought from Archana's Art.");

export default function Page() {
  return <LegalPageView slug="shipping-returns" />;
}
