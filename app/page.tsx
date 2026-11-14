import type { Metadata } from "next";
import { HomePage } from "../src/views/HomePage";

export const metadata: Metadata = {
  title: { absolute: "Bellymall — Hungry? Enter the mall" },
  description:
    "From street cravings to chef specials — order jollof, swallow, suya, grills and snacks from 120+ stalls. One basket, one rider, hot in 25 minutes.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomePage />;
}
