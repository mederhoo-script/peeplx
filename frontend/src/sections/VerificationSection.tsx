import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Fingerprint, Shield, Lock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function VerificationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
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
        { x: -70, opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      )
        .fromTo(
          textRef.current,
          { x: 60, opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.05
        )
        .fromTo(
          ctaRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.1
        );

      // Scan line animation during settle
      tl.fromTo(
        scanLineRef.current,
        { y: '-120%' },
        { y: '120%', ease: 'none', duration: 0.3 },
        0
      );

      // Hold at 30% - 70%
      tl.to({}, { duration: 0.4 });

      // EXIT (70% - 100%)
      tl.to(
        cardRef.current,
        { x: '-12vw', opacity: 0.3, ease: 'power2.in' },
        0.7
      )
        .to(
          [textRef.current, ctaRef.current],
          { x: '12vw', opacity: 0.3, ease: 'power2.in' },
          0.7
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="verification"
      className="section-pinned bg-peeplx-bg flex items-center z-50"
    >
      {/* Left ID Card Panel */}
      <div
        ref={cardRef}
        className="absolute left-[6vw] top-[12vh] w-[46vw] max-w-xl h-[76vh] card-dark card-glow overflow-hidden"
      >
        {/* Card Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/verification_id.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-peeplx-bg via-peeplx-bg/60 to-transparent" />
        </div>

        {/* Scan Line */}
        <div
          ref={scanLineRef}
          className="absolute left-0 right-0 h-[2px] bg-peeplx-accent/35"
          style={{ top: '20%' }}
        />

        {/* Card Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-peeplx-accent/20 flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-peeplx-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-peeplx-text">
                Government ID
              </h3>
              <p className="font-mono text-xs text-peeplx-text-secondary uppercase tracking-wider">
                Verification Required
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-peeplx-text-secondary text-sm">
            <Lock className="w-4 h-4" />
            <span>Encrypted. Never shared without consent.</span>
          </div>
        </div>

        {/* Security Badge */}
        <div className="absolute top-6 right-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-peeplx-accent/20 border border-peeplx-accent/30">
            <Shield className="w-4 h-4 text-peeplx-accent" />
            <span className="font-mono text-xs text-peeplx-accent uppercase tracking-wider">
              Secure
            </span>
          </div>
        </div>
      </div>

      {/* Right Text Block */}
      <div
        ref={textRef}
        className="absolute right-[6vw] top-[26vh] w-[40vw] max-w-lg"
      >
        <span className="eyebrow block mb-4">Verification</span>
        <h2 className="font-display font-bold text-peeplx-text text-[clamp(28px,3.5vw,52px)] leading-[1.0] mb-6">
          Prove it's you.
          <br />
          <span className="text-peeplx-accent">Unlock more trust.</span>
        </h2>
        <p className="text-peeplx-text-secondary text-base lg:text-lg leading-relaxed">
          Link your government ID and a quick selfie check. Verified users get 
          higher limits and faster dispute resolution.
        </p>
      </div>

      {/* CTA */}
      <button
        ref={ctaRef}
        className="absolute right-[6vw] top-[58vh] btn-accent flex items-center gap-2 group"
      >
        Start verification
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>
    </section>
  );
}
