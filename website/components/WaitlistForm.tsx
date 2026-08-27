"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    const { error } = await supabase.from("waitlist_signups").insert({ email });

    if (error) {
      setStatus("error");
      setErrorMessage(error.code === "23505" ? "You're already on the VIP list!" : error.message);
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3.5 text-sm font-medium text-emerald-800 dark:text-emerald-300 shadow-sm animate-in fade-in duration-300">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">✓</span>
        <span>You&apos;re on the VIP list! We&apos;ll notify you the minute Alinnia goes live on iOS & Android.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2.5 sm:flex-row relative">
      <div className="relative flex-1">
        <input
          type="email"
          required
          placeholder="Enter your email for early access..."
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          className="w-full rounded-full border border-black/10 bg-white px-5 py-3.5 text-sm text-[#042A1C] placeholder:text-[#67796E]/70 shadow-sm outline-none transition-all focus:border-[#14A85C] focus:ring-4 focus:ring-[#14A85C]/15 dark:border-white/15 dark:bg-[#121A16] dark:text-white dark:placeholder:text-[#9BB0A3]/60 dark:focus:border-[#14A85C]"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 cursor-pointer rounded-full bg-[#14A85C] hover:bg-[#0C8747] active:scale-[0.98] px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#14A85C]/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Joining…</span>
          </>
        ) : (
          <>
            <span>Get Early Access</span>
            <span>➔</span>
          </>
        )}
      </button>
      {status === "error" && (
        <p className="text-xs font-medium text-[#F0563E] text-left px-4 mt-1 sm:absolute sm:-bottom-6 sm:left-0">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
