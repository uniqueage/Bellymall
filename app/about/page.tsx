import type { Metadata } from "next";
import { AboutPage } from "../../src/views/AboutPage";

export const metadata: Metadata = {
  title: "About & your orders",
  description:
    "One mall, every craving. Read the Bellymall story, track your orders and browse every stall under one roof.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <AboutPage />;
}
