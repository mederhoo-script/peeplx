import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from './components/Navigation';
import HeroSection from './sections/HeroSection';
import HowItWorksSection from './sections/HowItWorksSection';
import FeatureHighlightSection from './sections/FeatureHighlightSection';
import TrustProfileSection from './sections/TrustProfileSection';
import SafetySection from './sections/SafetySection';
import VerificationSection from './sections/VerificationSection';
import TrustScoreSection from './sections/TrustScoreSection';
import TestimonialsSection from './sections/TestimonialsSection';
import FooterSection from './sections/FooterSection';

gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    // Wait for all ScrollTriggers to be created
    const timeout = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter((st) => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      
      if (!maxScroll || pinned.length === 0) return;

      // Build ranges and snap targets from pinned sections
      const pinnedRanges = pinned.map((st) => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      // Global snap configuration
      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            // Check if within any pinned range (with small buffer)
            const inPinned = pinnedRanges.some(
              (r) => value >= r.start - 0.02 && value <= r.end + 0.02
            );
            
            if (!inPinned) return value; // Flowing section: free scroll

            // Find nearest pinned center
            const target = pinnedRanges.reduce(
              (closest, r) =>
                Math.abs(r.center - value) < Math.abs(closest - value)
                  ? r.center
                  : closest,
              pinnedRanges[0]?.center ?? 0
            );

            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        },
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="relative bg-peeplx-bg min-h-screen">
      {/* Grain Overlay */}
      <div className="grain-overlay" />
      
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="relative">
        {/* Section 1: Hero - pin: false */}
        <HeroSection />

        {/* Section 2: How It Works - pin: false */}
        <HowItWorksSection />

        {/* Section 3: Feature Highlight - pin: true */}
        <div className="relative z-20">
          <FeatureHighlightSection />
        </div>

        {/* Section 4: Trust Profile - pin: true */}
        <div className="relative z-30">
          <TrustProfileSection />
        </div>

        {/* Section 5: Safety - pin: true */}
        <div className="relative z-40">
          <SafetySection />
        </div>

        {/* Section 6: Verification - pin: true */}
        <div className="relative z-50">
          <VerificationSection />
        </div>

        {/* Section 7: Trust Score - pin: true */}
        <div className="relative z-[60]">
          <TrustScoreSection />
        </div>

        {/* Section 8: Testimonials - pin: false */}
        <TestimonialsSection />

        {/* Section 9: Footer - pin: false */}
        <FooterSection />
      </main>
    </div>
  );
}

export default App;
