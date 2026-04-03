import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Lock, Scale, ShieldCheck, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const principles = [
  {
    text: 'Funds are held in escrow—not released until confirmation.',
    icon: Lock,
  },
  {
    text: 'Disputes are reviewed with evidence, not opinions.',
    icon: Scale,
  },
  {
    text: 'Identity verification reduces fraud before it starts.',
    icon: ShieldCheck,
  },
  {
    text: 'Payouts are fast once both parties agree.',
    icon: Zap,
  },
];

export default function SafetySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const principlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const headlineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

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
      principlesRef.current.forEach((principle, index) => {
        if (principle) {
          tl.fromTo(
            principle,
            { x: -50, opacity: 0 },
            { x: 0, opacity: 1, ease: 'none' },
            index * 0.03
          );
        }
      });

      tl.fromTo(
        headlineRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );

      tl.fromTo(
        lineRef.current,
        { scaleY: 0 },
        { scaleY: 1, ease: 'none' },
        0.15
      );

      // Hold at 30% - 70%
      tl.to({}, { duration: 0.4 });

      // EXIT (70% - 100%)
      tl.to(
        principlesRef.current.filter(Boolean),
        { x: '-10vw', opacity: 0.25, ease: 'power2.in', stagger: 0.02 },
        0.7
      )
        .to(
          headlineRef.current,
          { x: '10vw', opacity: 0.25, ease: 'power2.in' },
          0.7
        )
        .to(
          lineRef.current,
          { scaleY: 0, ease: 'power2.in' },
          0.7
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="safety"
      className="section-pinned z-40"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/safety_skyline.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-peeplx-bg/65" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        {/* Left Principles List */}
        <div className="absolute left-[6vw] top-[22vh] w-[34vw] max-w-md">
          {principles.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <div
                key={index}
                ref={(el) => { principlesRef.current[index] = el; }}
                className="flex items-start gap-4 py-5 border-b border-white/14"
              >
                <div className="w-10 h-10 rounded-lg bg-peeplx-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-peeplx-accent" />
                </div>
                <p className="text-peeplx-text leading-relaxed pt-2">
                  {principle.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Vertical Line */}
        <div
          ref={lineRef}
          className="absolute left-[44vw] top-[25vh] bottom-[25vh] w-[1px] bg-white/20 origin-top hidden lg:block"
        />

        {/* Right Headline Block */}
        <div
          ref={headlineRef}
          className="absolute right-[6vw] top-[26vh] w-[44vw] max-w-xl text-right"
        >
          <h2 className="font-display font-bold text-peeplx-text text-[clamp(28px,3.5vw,52px)] leading-[1.0] mb-6">
            We don't take sides.
            <br />
            <span className="text-peeplx-accent">We follow the rules.</span>
          </h2>
          <p className="text-peeplx-text-secondary text-base lg:text-lg">
            Clear terms. Fair process. Fast resolution.
          </p>
        </div>
      </div>
    </section>
  );
}
