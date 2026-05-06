import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const GUIDE_PRICE_CENTS = 7900 // $79.00
