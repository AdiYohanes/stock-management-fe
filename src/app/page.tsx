import { redirect } from "next/navigation";

export const metadata = {
  title: "Stock Management System",
  description: "Redirecting...",
};

export default function RootPage() {
  redirect("/login");
}
