"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, "");
  return (
    <form action={action} className="flex flex-col gap-7">
      <label className="field">
        <span>Name</span>
        <input name="name" required maxLength={40} autoComplete="username" autoCapitalize="none" spellCheck={false} />
      </label>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" required maxLength={200} autoComplete="current-password" />
      </label>
      {error ? (
        <p role="alert" className="text-oxblood">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
