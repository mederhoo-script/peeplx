'use client'

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Mail, IdCard, Phone, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const badges = [
  { label: 'Email verified', icon: Mail },
  { label: 'ID verified', icon: IdCard },
  { label: 'Phone verified', icon: Phone },
];

const graphData = [30, 45, 35, 55, 48, 62, 58, 75, 70, 88];

export default function TrustScoreSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const badgesRef = useRef<(HTMLDivElement | null)[]>([]);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

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
        textRef.current,
        { x: -60, opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      )
        .fromTo(
          cardRef.current,
          { x: 60, opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0
        )
        .fromTo(
          scoreRef.current,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, ease: 'none' },
          0.1
        );

      // Arc stroke animation
      if (arcRef.current) {
        const circumference = 2 * Math.PI * 80;
        tl.fromTo(
          arcRef.current,
          { strokeDashoffset: circumference },
          { strokeDashoffset: circumference * 0.12, ease: 'none' },
          0.1
        );
      }

      // Badges stagger
      badgesRef.current.forEach((badge, index) => {
        if (badge) {
          tl.fromTo(
            badge,
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, ease: 'none' },
            0.15 + index * 0.03
          );
        }
      });

      // Graph bars
      barsRef.current.forEach((bar, index) => {
        if (bar) {
          tl.fromTo(
            bar,
            { scaleY: 0 },
            { scaleY: 1, ease: 'none' },
            0.2 + index * 0.02
          );
        }
      });

      // Hold at 30% - 70%
      tl.to({}, { duration: 0.4 });

      // EXIT (70% - 100%)
      tl.to(
        textRef.current,
        { x: '-10vw', opacity: 0.25, ease: 'power2.in' },
        0.7
      )
        .to(
          cardRef.current,
          { x: '10vw', opacity: 0.25, ease: 'power2.in' },
          0.7
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pinned bg-peeplx-bg flex items-center z-[60]"
    >
      {/* Left Text Block */}
      <div
        ref={textRef}
        className="absolute left-[6vw] top-[24vh] w-[40vw] max-w-lg"
      >
        <span className="eyebrow block mb-4">Portable Trust Score</span>
        <h2 className="font-display font-bold text-peeplx-text text-[clamp(28px,3.5vw,52px)] leading-[1.0] mb-6">
          Take your score
          <br />
          <span className="text-peeplx-accent">anywhere.</span>
        </h2>
        <p className="text-peeplx-text-secondary text-base lg:text-lg leading-relaxed mb-8">
          Your PeeplX score travels with you. Share it on marketplaces, social, 
          or contracts—so trust becomes portable.
        </p>
        <button className="flex items-center gap-2 text-peeplx-accent font-medium group">
          View your score
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Right Score Card */}
      <div
        ref={cardRef}
        className="absolute right-[6vw] top-[14vh] w-[40vw] max-w-md h-[72vh] card-dark card-glow flex flex-col"
      >
        {/* Card Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-peeplx-accent" />
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-peeplx-text-secondary">
              Trust Score
            </span>
          </div>
        </div>

        {/* Score Display */}
        <div ref={scoreRef} className="flex flex-col items-center pt-8 pb-6 relative">
          {/* SVG Arc */}
          <svg className="w-48 h-24" viewBox="0 0 200 100">
            {/* Background arc */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${Math.PI * 80} ${Math.PI * 80}`}
              strokeDashoffset={Math.PI * 80}
              transform="rotate(-180 100 100)"
            />
            {/* Progress arc */}
            <circle
              ref={arcRef}
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#B6FF2E"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 80}`}
              strokeDashoffset={2 * Math.PI * 80}
              transform="rotate(-180 100 100)"
            />
          </svg>
          
          {/* Score Number */}
          <div className="absolute top-16 flex flex-col items-center">
            <span className="font-display font-bold text-[clamp(56px,6vw,96px)] text-peeplx-text leading-none">
              88
            </span>
            <span className="font-mono text-sm text-peeplx-accent uppercase tracking-wider mt-1">
              High trust
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div
                  key={index}
                  ref={(el) => { badgesRef.current[index] = el; }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-peeplx-accent/10 border border-peeplx-accent/20"
                >
                  <Icon className="w-3.5 h-3.5 text-peeplx-accent" />
                  <span className="text-xs text-peeplx-text">{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mini Graph */}
        <div className="px-6 py-4 flex-grow">
          <p className="font-mono text-xs text-peeplx-text-secondary uppercase tracking-wider mb-4">
            12-Month History
          </p>
          <div className="flex items-end justify-between h-24 gap-1">
            {graphData.map((value, index) => (
              <div
                key={index}
                ref={(el) => { barsRef.current[index] = el; }}
                className="flex-1 bg-peeplx-accent/30 rounded-t-sm origin-bottom hover:bg-peeplx-accent/50 transition-colors"
                style={{ height: `${value}%` }}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-peeplx-text-secondary">Last updated</span>
            <span className="text-peeplx-text">Just now</span>
          </div>
        </div>
      </div>
    </section>
  );
}
