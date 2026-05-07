import { redirect } from "next/navigation"

export default function StartPage() {
  redirect("/auth/signup/wizard")
}
