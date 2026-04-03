'use client';

import { useRef, useEffect, useState } from 'react';
import { FiLinkedin, FiGithub, FiMail, FiArrowUpRight } from 'react-icons/fi';
import { portfolioContactEmails } from '@/app/lib/portfolio-terminal-data';

const socialLinks = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/benjamin-little1',
    icon: FiLinkedin,
    handle: 'benjamin-little1',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/BenLittle1',
    icon: FiGithub,
    handle: 'BenLittle1',
  },
];

export default function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleCopyEmail = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedEmail(address);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch {
      // Fallback for older browsers
      window.location.href = `mailto:${address}`;
    }
  };

  return (
    <div ref={sectionRef} className="section-container py-24 md:py-32">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main CTA */}
        <div
          className={`mb-12 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Let&apos;s build
            <br />
            <span className="gradient-text">something together</span>
          </h2>
          <p className="text-white/50 font-mono text-base md:text-lg max-w-xl mx-auto">
            Always open to discussing new opportunities, interesting projects, or just chatting about tech and innovation.
          </p>
        </div>

        {/* Email CTA */}
        <div
          className={`mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
          style={{ animationDelay: '150ms' }}
        >
          <div className="grid max-w-4xl gap-4 mx-auto md:grid-cols-3">
            {portfolioContactEmails.map((email) => (
              <button
                key={email.address}
                onClick={() => handleCopyEmail(email.address)}
                className="group relative flex flex-col items-start gap-4 rounded-3xl border border-lavender/20 bg-lavender/10 px-6 py-5 text-left text-lavender transition-all hover:border-lavender/50 hover:bg-lavender/20"
              >
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-lavender/70">
                    {email.label}
                  </span>
                  <FiArrowUpRight
                    size={18}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                  />
                </div>
                <div className="flex items-start gap-3">
                  <FiMail size={18} className="mt-0.5 shrink-0" />
                  <span className="font-mono text-sm md:text-base break-all">
                    {email.address}
                  </span>
                </div>
                {copiedEmail === email.address && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-lavender text-black text-xs font-mono rounded">
                    Copied!
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div
          className={`flex flex-wrap justify-center gap-6 ${
            isVisible ? 'animate-fade-in' : 'opacity-0'
          }`}
          style={{ animationDelay: '300ms' }}
        >
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-4 py-2 text-white/50 hover:text-lavender transition-colors"
            >
              <link.icon size={20} />
              <span className="font-mono text-sm">{link.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className={`mt-24 pt-8 border-t border-white/5 ${
          isVisible ? 'animate-fade-in' : 'opacity-0'
        }`}
        style={{ animationDelay: '450ms' }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-sm font-mono">
          <p>Designed & Built by Ben Little</p>
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
