import { redirect } from "next/navigation";

export default function GenerateBillingRedirect() {
  redirect("/dashboard/tagihan/manual");
}
