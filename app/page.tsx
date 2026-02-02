'use client';

import { useState, useEffect } from 'react';
import PixelBlast from './components/PixelBlast';
import FuzzyText from './components/FuzzyText';
import FuzzyTypewriter from './components/FuzzyTypewriter';
import ProfileSection from './components/ProfileSection';
import Navigation from './components/Navigation';
import ScrambledText from './components/ScrambledText';
import { FiLinkedin, FiGithub, FiMail, FiFileText, FiChevronDown, FiArrowUpRight } from 'react-icons/fi';

// Activity data
const activities = [
  {
    title: 'Queen\'s University',
    description:
      'Currently studying Commerce & Computer Science in Kingston, Ontario. Blending business strategy with technical expertise.',
    highlight: 'Student',
  },
  {
    title: 'Labs & Venture Teams @ AXL',
    description:
      'Building at the intersection of AI and entrepreneurship. Working on emerging AI technologies and helping launch innovative ventures.',
    highlight: 'AI Venture Studio',
  },
  {
    title: 'Building stensyl',
    description:
      'Creating a social media platform for students to track study habits and share progress with friends. Think Strava, but for studying.',
    highlight: 'Founder',
  },
];

// Project data
const projects = [
  {
    title: 'stensyl',
    tagline: 'Where studying meets social media',
    description:
      'stensyl allows students to track their study habits and share their progress with friends, providing advanced analytics to help students improve their study habits. Built as a full-stack mobile application with real-time features.',
    technologies: ['React Native', 'Expo', 'TypeScript', 'Node.js', 'Express', 'SQL', 'Supabase'],
    featured: true,
  },
  {
    title: 'SpotifyGraphs',
    tagline: 'Visualize your listening habits',
    description:
      'An interactive data visualization tool that analyzes your Spotify listening history and generates beautiful graphs and insights about your music preferences and trends.',
    technologies: ['TypeScript', 'Spotify API', 'Data Visualization'],
    github: 'https://github.com/BenLittle1/SpotifyGraphs',
  },
  {
    title: 'GoogleWordCloud',
    tagline: 'Transform your data into art',
    description:
      'A web application that generates dynamic word clouds from various Google data sources, creating visual representations of your most used words and phrases.',
    technologies: ['JavaScript', 'Google APIs', 'Canvas'],
    github: 'https://github.com/BenLittle1/GoogleWordCloud',
  },
  {
    title: 'HapticMaps',
    tagline: 'Navigate through touch',
    description:
      'An iOS application that enhances map navigation with haptic feedback, providing intuitive tactile cues for directions and points of interest.',
    technologies: ['Swift', 'iOS', 'MapKit', 'Core Haptics'],
    github: 'https://github.com/BenLittle1/HapticMaps',
  },
];

export default function Home() {
  const [isHoveringName, setIsHoveringName] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.15 }
    );

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('ben.little@queensu.ca');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      window.location.href = 'mailto:ben.little@queensu.ca';
    }
  };

  // Parallax effect for hero
  const heroOpacity = Math.max(0, 1 - scrollY / 600);
  const heroTransform = scrollY * 0.3;

  return (
    <div className="relative w-full min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Background - fixed across all sections */}
      <div className="fixed inset-0 z-0">
        <PixelBlast />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative z-10 min-h-screen flex flex-col items-center justify-center pointer-events-none"
        style={{
          opacity: heroOpacity,
          transform: `translateY(${heroTransform}px)`,
        }}
      >
        <div className="relative pointer-events-auto">
          <FuzzyText
            fontSize="clamp(3rem, 10vw, 6rem)"
            fontWeight={700}
            color="#ffffff"
            enableHover={true}
            baseIntensity={0.18}
            hoverIntensity={0.5}
            onHoverChange={setIsHoveringName}
          >
            ben little.
          </FuzzyText>

          {isHoveringName && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4">
              <FuzzyTypewriter
                text="but you can just call me BL..."
                typingSpeed={50}
                loop={false}
                showCursor={true}
                cursorCharacter="|"
                fontSize="clamp(1rem, 4vw, 1.5rem)"
                fontWeight={700}
                fontStyle="italic"
                color="#ffffff"
                fuzzyIntensity={0.08}
                startOnVisible={false}
              />
            </div>
          )}
        </div>

        {/* Subtitle */}
        <div className="mt-16 text-center pointer-events-none">
          <p className="font-mono text-white/50 text-sm md:text-base tracking-widest uppercase">
            Commerce & Computer Science
          </p>
          <p className="font-display text-lavender text-lg md:text-xl mt-1">
            Queen&apos;s University
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-6 mt-12 pointer-events-auto">
          <a
            href="https://www.linkedin.com/in/benjamin-little1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-lavender transition-all duration-200 hover:-translate-y-1"
            aria-label="LinkedIn"
          >
            <FiLinkedin size={22} />
          </a>
          <a
            href="https://github.com/BenLittle1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-lavender transition-all duration-200 hover:-translate-y-1"
            aria-label="GitHub"
          >
            <FiGithub size={22} />
          </a>
          <a
            href="mailto:ben.little@queensu.ca"
            className="text-white/50 hover:text-lavender transition-all duration-200 hover:-translate-y-1"
            aria-label="Email"
          >
            <FiMail size={22} />
          </a>
          <a
            href="/assets/Resume - Benjamin Little.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-lavender transition-all duration-200 hover:-translate-y-1"
            aria-label="Resume"
          >
            <FiFileText size={22} />
          </a>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToAbout}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto text-white/30 hover:text-lavender transition-colors animate-bounce"
          aria-label="Scroll to about section"
        >
          <FiChevronDown size={28} />
        </button>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ABOUT / PROFILE SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        id="about"
        className="relative z-10 min-h-screen flex items-center justify-center py-20 pointer-events-none"
      >
        <ProfileSection />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          WHAT I'M UP TO SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        id="current"
        data-animate
        className="relative z-10 py-40 pointer-events-none"
      >
        <div className="section-container pointer-events-auto">
          {/* Section Header */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-lavender font-mono text-sm tracking-wider">02</span>
              <div className="h-px w-12 bg-lavender/50" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              What I&apos;m Up To
            </h2>
            <p className="text-white/50 font-mono text-sm max-w-xl">
              Currently focused on building, learning, and exploring the cutting edge of tech.
            </p>
          </div>

          {/* Activities Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {activities.map((activity, index) => (
              <div
                key={activity.title}
                className={`glass-card p-8 hover-lift group transition-all duration-500 ${
                  visibleSections.has('current')
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {activity.highlight && (
                  <span className="inline-block px-3 py-1 text-xs font-mono tracking-wider uppercase bg-lavender/20 text-lavender rounded-full mb-4">
                    {activity.highlight}
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold text-white mb-3 group-hover:text-lavender transition-colors">
                  {activity.title}
                </h3>
                <ScrambledText
                  radius={80}
                  duration={1}
                  speed={0.5}
                  scrambleChars=".:"
                  className="text-sm leading-relaxed"
                >
                  {activity.description}
                </ScrambledText>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PROJECTS SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        id="projects"
        data-animate
        className="relative z-10 py-40 pointer-events-none"
      >
        <div className="section-container pointer-events-auto">
          {/* Section Header */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-lavender font-mono text-sm tracking-wider">03</span>
              <div className="h-px w-12 bg-lavender/50" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Projects
            </h2>
            <p className="text-white/50 font-mono text-sm max-w-xl">
              Building meaningful solutions that push technological boundaries.
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div
                key={project.title}
                className={`relative transition-all duration-700 ${
                  visibleSections.has('projects')
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="glass-card p-6 md:p-8 overflow-hidden group h-full hover-lift">
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Title and GitHub Link */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display font-bold text-white group-hover:text-lavender transition-colors text-xl">
                        {project.title}
                      </h3>
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/40 hover:text-lavender transition-colors"
                          aria-label={`View ${project.title} on GitHub`}
                        >
                          <FiGithub size={18} />
                        </a>
                      )}
                    </div>

                    <p className="text-lavender font-mono text-sm mb-4">{project.tagline}</p>

                    <div className="mb-6 flex-grow">
                      <ScrambledText
                        radius={80}
                        duration={1}
                        speed={0.5}
                        scrambleChars=".:"
                        className="text-sm leading-relaxed"
                      >
                        {project.description}
                      </ScrambledText>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 text-xs font-mono tracking-wide bg-white/5 border border-white/10 text-white/70 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTACT SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        id="contact"
        data-animate
        className="relative z-10 pt-56 pb-40 pointer-events-none"
      >
        <div className="section-container pointer-events-auto">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main CTA */}
            <div
              className={`mb-12 transition-all duration-700 ${
                visibleSections.has('contact')
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Let&apos;s build
                <br />
                <span className="gradient-text">something together</span>
              </h2>
              <p className="text-white/50 font-mono text-base md:text-lg max-w-xl mx-auto">
                Always open to discussing new opportunities, interesting projects, or just
                chatting about tech and innovation.
              </p>
            </div>

            {/* Email CTA */}
            <div
              className={`mb-16 transition-all duration-500 delay-150 ${
                visibleSections.has('contact')
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
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
              className={`flex flex-wrap justify-center gap-6 transition-all duration-500 delay-300 ${
                visibleSections.has('contact') ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <a
                href="https://www.linkedin.com/in/benjamin-little1"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-4 py-2 text-white/50 hover:text-lavender transition-colors"
              >
                <FiLinkedin size={20} />
                <span className="font-mono text-sm">LinkedIn</span>
              </a>
              <a
                href="https://github.com/BenLittle1"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-4 py-2 text-white/50 hover:text-lavender transition-colors"
              >
                <FiGithub size={20} />
                <span className="font-mono text-sm">GitHub</span>
              </a>
              <a
                href="mailto:ben.little@queensu.ca"
                className="group flex items-center gap-3 px-4 py-2 text-white/50 hover:text-lavender transition-colors"
              >
                <FiMail size={20} />
                <span className="font-mono text-sm">Email</span>
              </a>
            </div>
          </div>

          {/* Footer */}
          <div
            className={`mt-24 pt-8 border-t border-white/5 transition-all duration-500 delay-500 ${
              visibleSections.has('contact') ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-sm font-mono">
              <p>Designed & Built by Ben Little</p>
              <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
