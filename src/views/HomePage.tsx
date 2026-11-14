"use client";

import { Hero } from "../components/Hero";
import { Stats } from "../components/Stats";
import { Features } from "../components/Features";
import { Directory } from "../components/Directory";
import { Picks } from "../components/Picks";
import { Gallery } from "../components/Gallery";
import { Deal } from "../components/Deal";
import { HowItWorks } from "../components/HowItWorks";
import { CtaPanel } from "../components/CtaPanel";

export function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <Directory />
      <Picks />
      <Gallery />
      <Deal />
      <HowItWorks />
      <CtaPanel />
    </>
  );
}
