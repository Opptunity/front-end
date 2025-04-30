"use client"

import { useEffect } from "react"
import LandingHeader from "@/components/LandingHeader"
import Hero from "@/components/hero"
import ValueProps from "@/components/value-props"
import Testimonials from "@/components/testimonials"
import HowItWorks from "@/components/how-it-works"
import AiMentorPreview from "@/components/ai-mentor-preview"
import PricingCta from "@/components/pricing-cta"
import FaqSection from "@/components/faq-section"
import SecondaryCta from "@/components/secondary-cta"
import Footer from "@/components/footer"
import PageTransition from "@/components/animations/page-transition"

export default function LandingPage() {
  // Smooth scroll implementation
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "A") {
        const href = target.getAttribute("href")
        if (href && href.startsWith("#")) {
          e.preventDefault()
          const element = document.getElementById(href.substring(1))
          if (element) {
            window.scrollTo({
              top: element.offsetTop - 80, // Adjust for header height
              behavior: "smooth",
            })
          }
        }
      }
    }

    document.addEventListener("click", handleAnchorClick)
    return () => document.removeEventListener("click", handleAnchorClick)
  }, [])

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <LandingHeader />
        <main className="flex-grow">
          <Hero />
          <ValueProps />
          <Testimonials />
          <HowItWorks />
          <AiMentorPreview />
          <PricingCta />
          <FaqSection />
          <SecondaryCta />
        </main>
        <Footer />
      </div>
    </PageTransition>
  )
}

