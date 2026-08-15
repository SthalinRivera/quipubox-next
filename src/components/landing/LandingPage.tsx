"use client";

import LandingNavbar from "./LandingNavbar";
import LandingHero from "./LandingHero";
import LandingStats from "./LandingStats";
import LandingProblems from "./LandingProblems";
import LandingMobileApp from "./LandingMobileApp";
import LandingBenefits from "./LandingBenefits";
import LandingHowItWorks from "./LandingHowItWorks";
import LandingPricing from "./LandingPricing";
import LandingTestimonials from "./LandingTestimonials";
import LandingFAQ from "./LandingFAQ";
import LandingContact from "./LandingContact";
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
        <LandingMobileApp />
        <LandingBenefits />
        <LandingHowItWorks />
        <LandingPricing />
        <LandingTestimonials />
        <LandingFAQ />
        <LandingContact />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
