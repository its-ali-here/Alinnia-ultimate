# Alinnia

Refillable cleaning products for Pakistan — concentrate tablets and reusable bottles, in the spirit of Blueland.

The idea: buy a forever bottle once, then reorder cheap, low-waste concentrate refills instead of shipping water (and plastic) across the country every time you run out of cleaner.

---

## Status

This repo was reset to a fresh foundation:

- New Supabase schema for products, variants, subscriptions, orders, and addresses (see [DATABASE.md](./DATABASE.md))
- New Blueland-style landing page with placeholder products and Pakistan-focused copy
- Shop, cart, checkout, and account/subscription pages are not built yet — coming in a follow-up pass

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives)
- Supabase (Postgres + Auth)
- Stripe (payments — to be wired up with the shop)

## Development

```bash
pnpm install
pnpm dev
```
