import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { QrCode, User, TrendingUp, Shield } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function TrustProfileSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

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
          avatarRef.current,
          { scale: 0.85, opacity: 0 },
          { scale: 1, opacity: 1, ease: 'none' },
          0.1
        )
        .fromTo(
          qrRef.current,
          { scale: 0.96, opacity: 0 },
          { scale: 1, opacity: 1, ease: 'none' },
          0.15
        );

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
      id="trust-profile"
      className="section-pinned bg-peeplx-bg flex items-center z-30"
    >
      {/* Left Text Block */}
      <div
        ref={textRef}
        className="absolute left-[6vw] top-[22vh] w-[40vw] max-w-xl"
      >
        <span className="eyebrow block mb-4">Portable Trust</span>
        <h2 className="font-display font-bold text-peeplx-text text-[clamp(28px,3.5vw,52px)] leading-[1.0] mb-6">
          Your reputation,
          <br />
          <span className="text-peeplx-accent">everywhere.</span>
        </h2>
        <p className="text-peeplx-text-secondary text-base lg:text-lg leading-relaxed">
          Share your PeeplX profile link or QR code. Buyers and sellers can 
          verify your track record before they commit.
        </p>
      </div>

      {/* Right Profile Card */}
      <div
        ref={cardRef}
        className="absolute right-[6vw] top-[16vh] w-[40vw] max-w-md h-[68vh] card-dark card-glow flex flex-col"
      >
        {/* Card Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-peeplx-accent" />
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-peeplx-text-secondary">
              Verified Profile
            </span>
          </div>
        </div>

        {/* Avatar Section */}
        <div ref={avatarRef} className="flex flex-col items-center pt-8 pb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-peeplx-accent to-peeplx-accent/50 flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-peeplx-bg" />
          </div>
          <h3 className="font-display font-semibold text-xl text-peeplx-text">
            Amara Okafor
          </h3>
          <p className="font-mono text-sm text-peeplx-text-secondary mt-1">
            @amara.okafor
          </p>
        </div>

        {/* QR Code Section */}
        <div ref={qrRef} className="px-6 flex-grow">
          <div className="bg-white rounded-2xl p-6 flex items-center justify-center">
            <div className="relative">
              <QrCode className="w-32 h-32 text-peeplx-bg" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-peeplx-accent flex items-center justify-center">
                  <Shield className="w-5 h-5 text-peeplx-bg" />
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-peeplx-text-secondary mt-4">
            Scan to verify profile
          </p>
        </div>

        {/* Stats Row */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-peeplx-accent" />
              <span className="text-sm text-peeplx-text-secondary">12 deals</span>
            </div>
            <div className="w-[1px] h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-peeplx-accent">100%</span>
              <span className="text-sm text-peeplx-text-secondary">success</span>
            </div>
            <div className="w-[1px] h-4 bg-white/20" />
            <span className="text-sm text-peeplx-text-secondary">Since 2024</span>
          </div>
        </div>
      </div>
    </section>
  );
}
