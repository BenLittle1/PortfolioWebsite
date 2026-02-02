'use client';

import { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

const navItems = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Current', href: '#current' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Check if scrolled to bottom of page - activate Contact
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;

      if (scrolledToBottom) {
        setActiveSection('contact');
        return;
      }

      // Determine active section
      const sections = navItems.map((item) => item.href.slice(1));
      for (const section of sections.reverse()) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href === '#hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-black/80 backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 relative">
          <div className="flex items-center justify-center h-16 md:h-20">
            {/* Desktop Links - Centered */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`relative text-sm font-mono tracking-wider uppercase transition-colors ${
                    activeSection === item.href.slice(1)
                      ? 'text-lavender'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {item.label}
                  {activeSection === item.href.slice(1) && (
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-lavender" />
                  )}
                </button>
              ))}
              <a
                href="/assets/Resume - Benjamin Little.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 px-4 py-2 text-sm font-mono tracking-wider uppercase border border-lavender/50 text-lavender hover:bg-lavender/10 transition-all rounded"
              >
                Resume
              </a>
            </div>

          </div>

          {/* Mobile Menu Button - Absolute positioned */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden absolute right-6 top-1/2 -translate-y-1/2 text-white p-2"
            aria-label="Toggle menu"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-lg transition-all duration-300 md:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navItems.map((item, index) => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className={`text-2xl font-display font-semibold transition-all duration-300 ${
                activeSection === item.href.slice(1)
                  ? 'text-lavender'
                  : 'text-white/70 hover:text-white'
              }`}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                opacity: isOpen ? 1 : 0,
              }}
            >
              {item.label}
            </button>
          ))}
          <a
            href="/assets/Resume - Benjamin Little.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 px-6 py-3 text-lg font-display font-semibold border border-lavender text-lavender hover:bg-lavender/10 transition-all rounded-lg"
            style={{
              transitionDelay: isOpen ? `${navItems.length * 50}ms` : '0ms',
              transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
              opacity: isOpen ? 1 : 0,
            }}
          >
            Resume
          </a>
        </div>
      </div>
    </>
  );
}
