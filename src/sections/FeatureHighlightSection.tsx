'use client'

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, CreditCard } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function FeatureHighlightSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
        },
      });

      // SETTLE (0% - 30%)
      tl.fromTo(
        cardRef.current,
        { scale: 0.92, opacity: 0.6 },
        { scale: 1, opacity: 1, ease: 'none' },
        0
      )
        .fromTo(
          pillRef.current,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.05
        )
        .fromTo(
          headlineRef.current,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.08
        )
        .fromTo(
          bodyRef.current,
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.12
        )
        .fromTo(
          ctaRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.15
        );

      // Hold at 30% - 70%
      tl.to({}, { duration: 0.4 });

      // EXIT (70% - 100%)
      tl.to(
        [pillRef.current, headlineRef.current, bodyRef.current, ctaRef.current],
        { y: -18, opacity: 0.25, ease: 'power2.in' },
        0.7
      ).to(
        cardRef.current,
        { x: '-10vw', opacity: 0.35, ease: 'power2.in' },
        0.7
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pinned bg-peeplx-bg flex items-center justify-center z-20"
    >
      {/* Feature Card */}
      <div
        ref={cardRef}
        className="absolute left-[6vw] right-[6vw] top-[10vh] bottom-[10vh] rounded-[28px] overflow-hidden"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/feature_payments.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-peeplx-bg via-peeplx-bg/70 to-peeplx-bg/30" />
        </div>

        {/* Content */}
        <div className="absolute left-[5%] bottom-[10%] w-[90%] lg:w-[52%]">
          {/* Pill */}
          <div
            ref={pillRef}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/18 bg-white/5 backdrop-blur-sm mb-6"
          >
            <CreditCard className="w-4 h-4 text-peeplx-accent" />
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-peeplx-text">
              Flexible payments
            </span>
          </div>

          {/* Headline */}
          <h2
            ref={headlineRef}
            className="font-display font-bold text-peeplx-text text-[clamp(28px,3.5vw,52px)] leading-[1.0] mb-6"
          >
            Pay your way.
            <br />
            <span className="text-peeplx-accent">Get paid your way.</span>
          </h2>

          {/* Body */}
          <p
            ref={bodyRef}
            className="text-peeplx-text-secondary text-base lg:text-lg leading-relaxed mb-8 max-w-md"
          >
            Cards, bank transfer, or mobile money. PeeplX routes it into escrow 
            instantly—no shared account details needed.
          </p>

          {/* CTA */}
          <button
            ref={ctaRef}
            className="flex items-center gap-2 text-peeplx-accent font-medium group"
          >
            Explore payment options
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
