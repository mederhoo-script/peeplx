import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const liveTransactions = [
  { buyer: '@kola_01', seller: '@zara.tech', item: 'iPhone 15 Pro', amount: '₦890,000' },
  { buyer: '@tunde_dev', seller: '@amara_b', item: 'MacBook Pro M3', amount: '₦1,450,000' },
  { buyer: '@chioma_s', seller: '@david_o', item: 'PS5 Console', amount: '₦580,000' },
  { buyer: '@femi_t', seller: '@ngozi_k', item: 'Samsung S24', amount: '₦720,000' },
  { buyer: '@bola_m', seller: '@kenny_p', item: 'AirPods Pro', amount: '₦180,000' },
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animation (on load)
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      
      tl.fromTo(bgRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.6 }
      )
      .fromTo(headlineRef.current, 
        { y: 24, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.7 }, 
        '-=0.3'
      )
      .fromTo(subheadlineRef.current, 
        { y: 24, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6 }, 
        '-=0.5'
      )
      .fromTo(ctaRef.current, 
        { y: 16, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5 }, 
        '-=0.4'
      )
      .fromTo(bannerRef.current, 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.7 }, 
        '-=0.3'
      );

      // Scroll-driven exit animation
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=130%',
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          if (progress > 0.7) {
            const exitProgress = (progress - 0.7) / 0.3;
            gsap.set([headlineRef.current, subheadlineRef.current, ctaRef.current], {
              y: -18 * exitProgress,
              opacity: 1 - exitProgress * 0.75,
            });
            gsap.set(bannerRef.current, {
              y: 18 * exitProgress,
              opacity: 1 - exitProgress * 0.75,
            });
          }
        },
        onLeaveBack: () => {
          gsap.set([headlineRef.current, subheadlineRef.current, ctaRef.current, bannerRef.current], {
            y: 0,
            opacity: 1,
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden"
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/hero_lifestyle.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-peeplx-bg/35 via-peeplx-bg/60 to-peeplx-bg/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 lg:px-[6vw] pt-[72px]">
        {/* Headline */}
        <h1
          ref={headlineRef}
          className="font-display font-bold text-peeplx-text max-w-[62vw] text-[clamp(36px,5vw,76px)] leading-[0.95] tracking-[-0.02em] mt-[10vh]"
        >
          Trade with strangers.
          <br />
          <span className="text-peeplx-accent">Keep your peace of mind.</span>
        </h1>

        {/* Subheadline */}
        <p
          ref={subheadlineRef}
          className="mt-8 text-peeplx-text-secondary text-lg lg:text-xl max-w-[44vw] leading-relaxed"
        >
          PeeplX holds funds until both sides confirm delivery—so you can buy, 
          sell, and swap without the stress.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-wrap items-center gap-4 mt-10">
          <button className="btn-accent flex items-center gap-2 group">
            Create an escrow
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button 
            onClick={scrollToHowItWorks}
            className="btn-outline flex items-center gap-2"
          >
            See how it works
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Live Transaction Banner */}
        <div
          ref={bannerRef}
          className="absolute bottom-[7vh] left-6 right-6 lg:left-[6vw] lg:right-[6vw]"
        >
          <div className="card-dark card-glow p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-peeplx-accent live-pulse" />
              <span className="font-mono text-xs uppercase tracking-[0.12em] text-peeplx-accent">
                Live transactions
              </span>
            </div>
            
            <div className="overflow-hidden">
              <div className="flex gap-4 animate-marquee whitespace-nowrap">
                {[...liveTransactions, ...liveTransactions].map((tx, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5"
                  >
                    <span className="text-sm text-peeplx-text-secondary">{tx.buyer}</span>
                    <span className="text-peeplx-accent">↔</span>
                    <span className="text-sm text-peeplx-text-secondary">{tx.seller}</span>
                    <span className="w-[1px] h-4 bg-white/20" />
                    <span className="text-sm text-peeplx-text">{tx.item}</span>
                    <span className="text-sm font-mono text-peeplx-accent">{tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
