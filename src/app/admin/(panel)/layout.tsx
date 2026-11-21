import { Suspense, type ReactNode } from "react";
import { getAdmin } from "@/lib/admin/auth";
import { logout } from "../actions";
import { AdminSidebar } from "./AdminSidebar";

async function SignedInAs() {
  const admin = await getAdmin();
  if (!admin) return null;
  return (
    <form action={logout} className="flex flex-col items-start gap-2 px-3">
      <span className="text-sm text-muted">Signed in as {admin}</span>
      <button type="submit" className="link-line">
        Sign out
      </button>
    </form>
  );
}

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <AdminSidebar
        footer={
          <Suspense fallback={null}>
            <SignedInAs />
          </Suspense>
        }
      />
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-12">
        {/* Every page checks the sign-in itself; this boundary lets them read the session cookie. */}
        <Suspense fallback={<p className="text-muted">Loading</p>}>{children}</Suspense>
      </main>
    </div>
  );
}
