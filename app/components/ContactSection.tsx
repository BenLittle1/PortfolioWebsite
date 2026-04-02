'use client';

import { useRef, useEffect, useState } from 'react';
import { FiLinkedin, FiGithub, FiMail, FiArrowUpRight } from 'react-icons/fi';

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
  {
    name: 'Email',
    href: 'mailto:ben.little@queensu.ca',
    icon: FiMail,
    handle: 'ben.little@queensu.ca',
  },
];

export default function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

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

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('ben.little@queensu.ca');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // Fallback for older browsers
      window.location.href = 'mailto:ben.little@queensu.ca';
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
          <button
            onClick={handleCopyEmail}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-lavender/10 border border-lavender/30 rounded-full text-lavender hover:bg-lavender/20 hover:border-lavender/50 transition-all"
          >
            <FiMail size={20} />
            <span className="font-mono text-lg">ben.little@queensu.ca</span>
            <FiArrowUpRight
              size={18}
              className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
            />
            {copiedEmail && (
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-lavender text-black text-xs font-mono rounded">
                Copied!
              </span>
            )}
          </button>
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
