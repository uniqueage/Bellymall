import type { Metadata } from "next";
import { AdminPage } from "../../src/views/AdminPage";

export const metadata: Metadata = {
  title: "Admin dashboard",
  description: "Bellymall control room — products, stalls, sellers, orders, customers and content.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminPage />;
}
