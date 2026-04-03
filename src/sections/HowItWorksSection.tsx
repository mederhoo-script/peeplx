'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FileText, Wallet, CheckCircle } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    number: '1',
    title: 'Agree & create',
    description: 'Set the item, price, and terms. Invite your counterparty.',
    icon: FileText,
  },
  {
    number: '2',
    title: 'Pay into escrow',
    description: 'Buyer pays PeeplX. Funds are locked until delivery.',
    icon: Wallet,
  },
  {
    number: '3',
    title: 'Confirm & release',
    description: 'Both confirm. Funds move. Disputes optional.',
    icon: CheckCircle,
  },
]

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'top 55%',
            scrub: true,
          },
        }
      )

      gsap.fromTo(
        lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            end: 'top 50%',
            scrub: true,
          },
        }
      )

      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: `top ${70 - index * 5}%`,
                end: `top ${45 - index * 5}%`,
                scrub: true,
              },
            }
          )
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative py-[10vh] lg:py-[12vh] px-6 lg:px-[6vw] bg-peeplx-bg"
    >
      <div ref={titleRef} className="mb-12 lg:mb-16">
        <span className="eyebrow block mb-4">How it works</span>
        <h2 className="font-display font-bold text-peeplx-text text-[clamp(32px,3.6vw,56px)] leading-[1.0]">
          Three steps.
          <br />
          <span className="text-peeplx-accent">Zero stress.</span>
        </h2>
        <div
          ref={lineRef}
          className="w-24 h-[2px] bg-peeplx-accent mt-6 origin-left"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-[3vw]">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div
              key={step.number}
              ref={(el) => { cardsRef.current[index] = el }}
              className="card-dark p-6 lg:p-8 min-h-[320px] lg:min-h-[420px] flex flex-col group hover:-translate-y-1.5 transition-transform duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-display font-bold text-5xl lg:text-6xl text-peeplx-accent/20 group-hover:text-peeplx-accent/40 transition-colors">
                  {step.number}
                </span>
                <div className="w-12 h-12 rounded-xl bg-peeplx-accent/10 flex items-center justify-center group-hover:bg-peeplx-accent/20 transition-colors">
                  <Icon className="w-6 h-6 text-peeplx-accent" />
                </div>
              </div>

              <h3 className="font-display font-semibold text-xl lg:text-2xl text-peeplx-text mb-4">
                {step.title}
              </h3>
              <p className="text-peeplx-text-secondary leading-relaxed flex-grow">
                {step.description}
              </p>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-peeplx-accent" />
                  <span className="font-mono text-xs text-peeplx-text-secondary uppercase tracking-wider">
                    Step {step.number}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
