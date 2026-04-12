'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Check, ChevronDown, ChevronUp, Menu, X,
  Shield, Zap, Clock, Users, Lock, Star, TrendingUp,
} from 'lucide-react'

const stats = [
  { value: '₦2.4B+', label: 'Secured in escrow' },
  { value: '50K+', label: 'Happy users' },
  { value: '99.8%', label: 'Success rate' },
  { value: '< 2min', label: 'Setup time' },
]

const features = [
  {
    icon: Shield,
    title: 'Funds Protected',
    desc: 'Money stays locked until both parties are satisfied. Zero risk of disappearing sellers.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Zap,
    title: 'Instant Setup',
    desc: 'Create an escrow deal in under 2 minutes. No paperwork, no branches, no waiting.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Lock,
    title: 'Bank-Level Security',
    desc: 'End-to-end encryption. All funds held with licensed financial partners in Nigeria.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Users,
    title: 'Built for Nigeria',
    desc: "Naira-native, supports all major banks and mobile money. Designed for Nigerians.",
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: TrendingUp,
    title: 'Smart Trust Score',
    desc: "Every user builds a reputation. Know who you're dealing with before you send a kobo.",
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: Clock,
    title: 'Fast Disputes',
    desc: 'If something goes wrong, our team resolves disputes within 48 hours. Always.',
    color: 'bg-red-50 text-red-600',
  },
]

const steps = [
  {
    number: '01',
    title: 'Create the deal',
    desc: 'Set the terms — item, price, delivery timeline. Share the link with your buyer or seller.',
  },
  {
    number: '02',
    title: 'Funds go in',
    desc: 'The buyer deposits payment into PeeplX escrow. Both sides get notified instantly.',
  },
  {
    number: '03',
    title: 'Trade happens',
    desc: 'Delivery, handover, or digital transfer happens. Seller ships, buyer inspects.',
  },
  {
    number: '04',
    title: 'Everyone wins',
    desc: 'Buyer confirms receipt. Funds release to seller immediately. Deal closed. ✓',
  },
]

const testimonials = [
  {
    quote:
      "Sold a MacBook to someone I met on Twitter. Normally I'd be scared, but PeeplX made the whole thing completely stress-free.",
    name: 'Chioma Eze',
    role: 'Freelance Designer, Lagos',
    stars: 5,
  },
  {
    quote:
      "I've been scammed twice on Jiji. Since I started using PeeplX, zero issues. The trust score feature is a game changer.",
    name: 'Emeka Okonkwo',
    role: 'Tech Entrepreneur, Abuja',
    stars: 5,
  },
  {
    quote:
      'As a vendor who sells online, PeeplX gives my customers confidence to buy from me. Sales went up 40% in the first month.',
    name: 'Fatima Bello',
    role: 'Online Retailer, Kano',
    stars: 5,
  },
]

const faqs = [
  {
    q: 'How does PeeplX escrow work?',
    a: 'You create an escrow deal, the buyer deposits funds, and PeeplX holds them securely until the buyer confirms delivery. Simple, transparent, and safe for everyone.',
  },
  {
    q: 'What are the fees?',
    a: 'We charge a small percentage on completed transactions only. No monthly fees, no setup fees, no hidden charges. You only pay when a deal closes successfully.',
  },
  {
    q: 'What happens in a dispute?',
    a: 'Our dispute resolution team reviews evidence from both parties and makes a fair, transparent decision within 48 hours.',
  },
  {
    q: 'Which payment methods are supported?',
    a: 'Bank transfer, debit cards, and most major Nigerian mobile money services are all supported.',
  },
  {
    q: 'Is my money safe with PeeplX?',
    a: 'Yes. All funds are held with CBN-licensed financial partners and never mixed with operational funds. Your money is always protected.',
  },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* ── NAVBAR ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[68px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">PeeplX</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm text-gray-600">
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a>
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">Reviews</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
            >
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="text-sm bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Get started
            </Link>
          </div>

          <button className="md:hidden p-2 text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-5 py-6 flex flex-col gap-5">
            <a href="#how-it-works" className="text-base text-gray-700" onClick={() => setMenuOpen(false)}>
              How it works
            </a>
            <a href="#features" className="text-base text-gray-700" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="#testimonials" className="text-base text-gray-700" onClick={() => setMenuOpen(false)}>
              Reviews
            </a>
            <a href="#faq" className="text-base text-gray-700" onClick={() => setMenuOpen(false)}>
              FAQ
            </a>
            <div className="flex gap-3 pt-2">
              <Link
                href="/auth/login"
                className="flex-1 text-center py-2.5 border border-gray-200 rounded-full text-sm text-gray-700"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="flex-1 text-center py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium"
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div
          className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full -translate-y-1/3 translate-x-1/4 blur-3xl opacity-60 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #e0e7ff 0%, #f3e8ff 50%, transparent 100%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl opacity-50 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #fff7ed 0%, transparent 100%)' }}
        />

        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 border border-indigo-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live in Nigeria · Trusted by 50,000+ users
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 leading-[1.05] tracking-tight">
                Buy & sell with
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  total confidence.
                </span>
              </h1>

              <p className="mt-6 text-lg lg:text-xl text-gray-500 max-w-lg leading-relaxed">
                PeeplX is Nigeria's secure escrow platform. We hold the money until both sides are
                happy — so you never get scammed, ever.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-full transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-7 py-3.5 rounded-full transition-colors"
                >
                  See how it works
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-gray-500">
                {['No monthly fees', 'Works across Nigeria', 'Fast dispute resolution'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-green-500" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* UI Mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6" style={{ boxShadow: '0 32px 80px rgba(79,70,229,0.12)' }}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Escrow Deal</p>
                      <p className="text-base font-bold text-gray-900 mt-0.5">iPhone 15 Pro Max</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Secured
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400">Amount held</p>
                        <p className="text-2xl font-extrabold text-gray-900 mt-0.5">₦920,000</p>
                      </div>
                      <Shield className="w-10 h-10 text-indigo-200" />
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Buyer</span>
                      <span className="text-sm font-medium text-gray-800">@chioma_s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Seller</span>
                      <span className="text-sm font-medium text-gray-800">@tunde_dev</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Status</span>
                      <span className="text-sm font-medium text-indigo-600">Awaiting delivery</span>
                    </div>
                  </div>

                  <button
                    className="w-full text-white font-semibold py-3 rounded-xl text-sm"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                  >
                    Confirm delivery received
                  </button>
                </div>

                {/* Floating badge 1 */}
                <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Deal completed</p>
                    <p className="text-xs text-gray-400">₦1.45M released</p>
                  </div>
                </div>

                {/* Floating badge 2 */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Trust Score</p>
                    <p className="text-xs text-gray-400">98/100 · Verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: '#0f172a' }} className="py-14">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl lg:text-4xl font-extrabold text-white">{value}</p>
                <p className="text-sm text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 lg:py-28" style={{ background: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-indigo-600 text-sm font-semibold uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              Four simple steps.
              <br />
              Zero stress.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="text-5xl font-extrabold text-gray-100 leading-none mb-4">{step.number}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-10 -right-3 z-10">
                    <ArrowRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-indigo-600 text-sm font-semibold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              Everything you need
              <br />
              to trade safely.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all duration-200"
              >
                <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ background: '#f8fafc' }} className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-indigo-600 text-sm font-semibold uppercase tracking-widest mb-3">Reviews</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              Nigerians love PeeplX.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, role, stars }) => (
              <div key={name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">&quot;{quote}&quot;</p>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-400">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 lg:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-indigo-600 text-sm font-semibold uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Common questions.</h2>
          </div>

          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  className="w-full text-left px-6 py-4 flex items-center justify-between bg-white"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-gray-900 text-sm lg:text-base pr-4">{q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-4 bg-white">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div
            className="rounded-3xl px-8 lg:px-16 py-14 lg:py-20 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)' }}
          >
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 translate-x-1/3 -translate-y-1/3 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/5 -translate-x-1/3 translate-y-1/3 blur-2xl pointer-events-none" />
            <div className="relative">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Ready to trade without fear?
              </h2>
              <p className="text-indigo-200 text-lg mb-8 max-w-md mx-auto">
                Join 50,000+ Nigerians who buy and sell safely every day on PeeplX.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-full text-base hover:bg-indigo-50 transition-colors"
              >
                Create free account
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f172a' }} className="py-14 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-xl text-white">PeeplX</span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                Secure escrow for Nigeria. Buy, sell, and swap anything — with total confidence.
              </p>
            </div>

            {[
              { title: 'Product', links: ['How it works', 'Trust Score', 'Verification', 'Pricing'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Legal', links: ['Terms', 'Privacy', 'Disputes', 'Security'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">{title}</h4>
                <ul className="space-y-3">
                  {links.map((l) => (
                    <li key={l}>
                      <button className="text-sm text-gray-400 hover:text-white transition-colors">{l}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© 2024 PeeplX Technologies Ltd. All rights reserved.</p>
            <p className="text-xs text-gray-600">Built with ❤️ in Lagos, Nigeria 🇳🇬</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
