import { redirect } from "next/navigation";
import { Suspense } from "react";
import { adminConfigured, getAdmin } from "@/lib/admin/auth";
import { LoginForm } from "./LoginForm";

async function Gate() {
  if (await getAdmin()) redirect("/admin");
  if (!adminConfigured()) {
    return (
      <p className="text-muted">
        The admin panel is not set up yet. Add <code>ADMIN_USERS</code> and <code>ADMIN_SESSION_SECRET</code> to the environment, then reload. The README has the steps.
      </p>
    );
  }
  return <LoginForm />;
}

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <p className="eyebrow">Archana&rsquo;s Art</p>
      <h1 className="mt-4 text-4xl">Admin sign in</h1>
      <div className="mt-10">
        <Suspense fallback={<p className="text-muted">Loading</p>}>
          <Gate />
        </Suspense>
      </div>
    </main>
  );
}
