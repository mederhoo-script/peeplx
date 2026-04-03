'use client'

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote, Star } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "I sold a camera to someone in another state. Escrow made it feel local.",
    author: 'Tunde',
    location: 'Lagos',
    rating: 5,
  },
  {
    quote: "The QR profile is genius. One scan and buyers stop asking for 'proof'.",
    author: 'Zainab',
    location: 'Abuja',
    rating: 5,
  },
  {
    quote: "Dispute was resolved in 48 hours. Fair, fast, and transparent.",
    author: 'Chidi',
    location: 'Port Harcourt',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'top 55%',
            scrub: true,
          },
        }
      );

      // Cards animation with stagger
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: `top ${75 - index * 5}%`,
                end: `top ${50 - index * 5}%`,
                scrub: true,
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-[10vh] lg:py-[12vh] px-6 lg:px-[6vw] bg-peeplx-bg"
    >
      {/* Title Block */}
      <div ref={titleRef} className="mb-12 lg:mb-16">
        <span className="eyebrow block mb-4">Testimonials</span>
        <h2 className="font-display font-bold text-peeplx-text text-[clamp(32px,3.6vw,56px)] leading-[1.0]">
          People are
          <span className="text-peeplx-accent"> saying.</span>
        </h2>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-[3vw]">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            ref={(el) => { cardsRef.current[index] = el; }}
            className="card-dark p-6 lg:p-8 flex flex-col group hover:-translate-y-1.5 transition-transform duration-300"
          >
            {/* Quote Icon */}
            <div className="mb-6">
              <Quote className="w-8 h-8 text-peeplx-accent/40" />
            </div>

            {/* Quote Text */}
            <p className="text-peeplx-text text-lg lg:text-xl leading-relaxed flex-grow mb-6">
              "{testimonial.quote}"
            </p>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-peeplx-accent text-peeplx-accent" />
              ))}
            </div>

            {/* Author */}
            <div className="pt-4 border-t border-white/10">
              <p className="font-display font-semibold text-peeplx-text">
                {testimonial.author}
              </p>
              <p className="text-sm text-peeplx-text-secondary">
                {testimonial.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
