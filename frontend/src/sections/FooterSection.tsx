import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, MessageCircle, Shield, Twitter, Linkedin, Mail } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const footerLinks = {
  Product: ['How it works', 'Trust Score', 'Verification', 'Fees'],
  Company: ['About', 'Careers', 'Press'],
  Legal: ['Terms', 'Privacy', 'Disputes'],
  Contact: ['support@peeplx.com', 'Twitter/X', 'LinkedIn'],
};

export default function FooterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // CTA animation
      gsap.fromTo(
        ctaRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
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

      // Footer animation
      gsap.fromTo(
        footerRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            end: 'top 70%',
            scrub: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-peeplx-bg"
    >
      {/* Radial Gradient Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(182, 255, 46, 0.08) 0%, transparent 50%)',
        }}
      />

      {/* CTA Block */}
      <div
        ref={ctaRef}
        className="relative z-10 py-[14vh] px-6 lg:px-[6vw] text-center"
      >
        <h2 className="font-display font-bold text-peeplx-text text-[clamp(32px,4vw,64px)] leading-[1.0] mb-6">
          Ready to trade
          <span className="text-peeplx-accent"> safer?</span>
        </h2>
        <p className="text-peeplx-text-secondary text-lg lg:text-xl max-w-md mx-auto mb-10">
          Create your first escrow in under 2 minutes. No monthly fees.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button className="btn-accent flex items-center gap-2 group">
            Get started free
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button className="btn-outline flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Talk to support
          </button>
        </div>
      </div>

      {/* Footer */}
      <div
        ref={footerRef}
        className="relative z-10 border-t border-white/10 py-[6vh] px-6 lg:px-[6vw]"
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-peeplx-accent flex items-center justify-center">
                <Shield className="w-5 h-5 text-peeplx-bg" />
              </div>
              <span className="font-display font-bold text-xl text-peeplx-text">
                PeeplX
              </span>
            </div>
            <p className="text-sm text-peeplx-text-secondary leading-relaxed">
              Building trust in digital commerce across Africa.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-mono text-xs uppercase tracking-[0.12em] text-peeplx-text-secondary mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <button className="text-sm text-peeplx-text hover:text-peeplx-accent transition-colors">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-peeplx-text-secondary">
            © 2024 PeeplX. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-peeplx-accent/20 transition-colors">
              <Twitter className="w-4 h-4 text-peeplx-text" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-peeplx-accent/20 transition-colors">
              <Linkedin className="w-4 h-4 text-peeplx-text" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-peeplx-accent/20 transition-colors">
              <Mail className="w-4 h-4 text-peeplx-text" />
            </button>
          </div>
        </div>

        {/* Built in Lagos */}
        <div className="mt-8 text-center">
          <p className="text-xs text-peeplx-text-secondary/60">
            Built with ❤️ in Lagos, Nigeria 🇳🇬
          </p>
        </div>
      </div>
    </section>
  );
}
