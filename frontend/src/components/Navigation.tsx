import { useState, useEffect } from 'react';
import { Menu, X, Shield } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'How it works', id: 'how-it-works' },
    { label: 'Trust', id: 'trust-profile' },
    { label: 'Safety', id: 'safety' },
    { label: 'Verify', id: 'verification' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/90 dark:bg-peeplx-bg/90 backdrop-blur-md border-b border-border'
            : 'bg-transparent'
        }`}
      >
        <div className="flex items-center justify-between px-6 lg:px-[4vw] h-[72px]">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-accent dark:bg-peeplx-accent flex items-center justify-center">
              <Shield className="w-5 h-5 text-background dark:text-peeplx-bg" />
            </div>
            <span className="font-display font-bold text-xl text-foreground dark:text-peeplx-text">
              PeeplX
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-sm text-muted-foreground dark:text-peeplx-text-secondary hover:text-foreground dark:hover:text-peeplx-text transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <button className="text-sm text-muted-foreground dark:text-peeplx-text-secondary hover:text-foreground dark:hover:text-peeplx-text transition-colors">
              Log in
            </button>
            <button className="btn-accent text-sm py-2.5 px-5">
              Get started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground dark:text-peeplx-text p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/98 dark:bg-peeplx-bg/98 backdrop-blur-lg md:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-2xl font-display text-foreground dark:text-peeplx-text hover:text-accent dark:hover:text-peeplx-accent transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="flex flex-col items-center gap-4 mt-8">
              <ThemeToggle />
              <button className="text-lg text-muted-foreground dark:text-peeplx-text-secondary hover:text-foreground dark:hover:text-peeplx-text transition-colors">
                Log in
              </button>
              <button className="btn-accent text-lg py-3 px-8">
                Get started
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
