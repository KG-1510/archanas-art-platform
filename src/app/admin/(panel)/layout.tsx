import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { getAdmin } from "@/lib/admin/auth";
import { logout } from "../actions";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/stock", label: "Stock" },
];

async function SignedInAs() {
  const admin = await getAdmin();
  if (!admin) return null;
  return (
    <form action={logout} className="flex items-center gap-4">
      <span className="text-sm text-muted">Signed in as {admin}</span>
      <button type="submit" className="link-line">
        Sign out
      </button>
    </form>
  );
}

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className="shell flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <Link href="/admin" className="font-display text-2xl">
              Archana&rsquo;s Art <span className="text-oxblood">admin</span>
            </Link>
            <nav aria-label="Admin">
              <ul className="flex gap-6">
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[0.8rem] font-medium uppercase tracking-[0.2em] hover:text-oxblood">
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/studio" className="text-[0.8rem] font-medium uppercase tracking-[0.2em] text-muted hover:text-oxblood">
                    Studio
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-[0.8rem] font-medium uppercase tracking-[0.2em] text-muted hover:text-oxblood">
                    Website
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <Suspense fallback={null}>
            <SignedInAs />
          </Suspense>
        </div>
      </header>
      <main className="shell flex-1 py-10 md:py-14">
        {/* Every page checks the sign-in itself; this boundary lets them read the session cookie. */}
        <Suspense fallback={<p className="text-muted">Loading</p>}>{children}</Suspense>
      </main>
    </>
  );
}
