'use client';

import { useRef, useEffect, useState } from 'react';
import ScrambledText from './ScrambledText';
import { FiArrowUpRight } from 'react-icons/fi';

interface Activity {
  title: string;
  description: string;
  highlight?: string;
  link?: string;
}

const activities: Activity[] = [
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
    link: '#projects',
  },
  {
    title: 'Toronto + UofT',
    description:
      'Living in Toronto for the summer, taking part-time courses at the University of Toronto while working on exciting projects.',
    highlight: 'Summer 2025',
  },
];

export default function CurrentSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <div ref={sectionRef} className="section-container py-12">
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
      <div className="grid md:grid-cols-3 gap-6">
        {activities.map((activity, index) => (
          <div
            key={activity.title}
            className={`glass-card p-8 hover-lift group ${
              isVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Highlight Badge */}
            {activity.highlight && (
              <span className="inline-block px-3 py-1 text-xs font-mono tracking-wider uppercase bg-lavender/20 text-lavender rounded-full mb-4">
                {activity.highlight}
              </span>
            )}

            {/* Title */}
            <h3 className="font-display text-xl font-semibold text-white mb-3 group-hover:text-lavender transition-colors">
              {activity.title}
              {activity.link && (
                <FiArrowUpRight className="inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </h3>

            {/* Description */}
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
  );
}
