"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const { error } = await supabase.from("waitlist_signups").insert({ email });

    if (error) {
      setStatus("error");
      setErrorMessage(error.code === "23505" ? "You're already on the list." : error.message);
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <p className="rounded-full border border-emerald-800/30 bg-emerald-900/10 px-6 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
        You&apos;re on the list — we&apos;ll email you when NutriKitchen is ready.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm text-black outline-none focus:border-emerald-600 dark:border-white/15 dark:bg-white/5 dark:text-white"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
      >
        {status === "loading" ? "Joining…" : "Notify me"}
      </button>
      {status === "error" && <p className="text-sm text-red-500 sm:absolute">{errorMessage}</p>}
    </form>
  );
}
