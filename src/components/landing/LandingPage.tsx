"use client";

import LandingNavbar from "./LandingNavbar";
import LandingHero from "./LandingHero";
import LandingStats from "./LandingStats";
import LandingProblems from "./LandingProblems";

import LandingBenefits from "./LandingBenefits";
import LandingHowItWorks from "./LandingHowItWorks";
import LandingPricing from "./LandingPricing";

import LandingFAQ from "./LandingFAQ";

import LandingCTA from "./LandingCTA";
import LandingFooter from "./LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingStats />
        <LandingProblems />

        <LandingBenefits />
        <LandingHowItWorks />
        <LandingPricing />

        <LandingFAQ />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
