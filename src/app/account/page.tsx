import { redirect } from "next/navigation";

// One signed-in surface. The dashboard shows plan, usage and every tool, so
// a separate account page was a second place to look for the same facts.
export default function AccountPage() {
  redirect("/dashboard");
}
