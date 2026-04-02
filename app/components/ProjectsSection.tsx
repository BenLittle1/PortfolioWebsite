'use client';

import { useRef, useEffect, useState } from 'react';
import ScrambledText from './ScrambledText';
import { FiGithub, FiExternalLink } from 'react-icons/fi';

interface Project {
  title: string;
  tagline: string;
  description: string;
  technologies: string[];
  links?: {
    github?: string;
    live?: string;
  };
  featured?: boolean;
}

const projects: Project[] = [
  {
    title: 'stensyl',
    tagline: 'Where studying meets social media',
    description:
      'stensyl allows students to track their study habits and share their progress with friends, providing advanced analytics to help students improve their study habits. Built as a full-stack mobile application with real-time features.',
    technologies: [
      'React Native',
      'Expo',
      'TypeScript',
      'Node.js',
      'Express',
      'SQL',
      'Supabase',
    ],
    featured: true,
  },
];

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
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

      {/* Featured Project */}
      {projects.filter((p) => p.featured).map((project) => (
        <div
          key={project.title}
          className={`relative mb-12 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          <div className="glass-card p-8 md:p-12 overflow-hidden group">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-lavender/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
              {/* Featured Badge */}
              <span className="inline-block px-3 py-1 text-xs font-mono tracking-wider uppercase bg-lavender/20 text-lavender rounded-full mb-6">
                Featured Project
              </span>

              {/* Title */}
              <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                {project.title}
              </h3>

              {/* Tagline */}
              <p className="text-lavender font-mono text-lg mb-6">{project.tagline}</p>

              {/* Description */}
              <div className="max-w-2xl mb-8">
                <ScrambledText
                  radius={100}
                  duration={1.2}
                  speed={0.5}
                  scrambleChars=".:"
                  className="text-base leading-relaxed"
                >
                  {project.description}
                </ScrambledText>
              </div>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2 mb-8">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 text-xs font-mono tracking-wide bg-white/5 border border-white/10 text-white/70 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex items-center gap-4">
                {project.links?.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white/60 hover:text-lavender transition-colors"
                  >
                    <FiGithub size={20} />
                    <span className="font-mono text-sm">Code</span>
                  </a>
                )}
                {project.links?.live && (
                  <a
                    href={project.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white/60 hover:text-lavender transition-colors"
                  >
                    <FiExternalLink size={20} />
                    <span className="font-mono text-sm">Live</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* More Projects Coming */}
      <div
        className={`text-center py-12 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
        style={{ animationDelay: '300ms' }}
      >
        <p className="text-white/30 font-mono text-sm">
          More projects coming soon...
        </p>
      </div>
    </div>
  );
}
