import type { Metadata } from "next";
import { SignInPage } from "../../src/views/SignInPage";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Bellymall to keep your basket and order history in one place.",
  alternates: { canonical: "/signin" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <SignInPage />;
}
