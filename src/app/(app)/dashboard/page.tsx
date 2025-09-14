// Server component that just redirects home for now
import { redirect } from "next/navigation";

export default function DashboardRedirect() {
  redirect("/"); // or "/pricing"
}

