'use client';

import { useState } from 'react';
import RasterSplit from './RasterSplit';
import ScrambledText from './ScrambledText';

export default function ProfileSection() {
  const headshotPath = '/assets/headshot.jpeg';
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <div className="section-container pointer-events-auto">
      {/* Section Header */}
      <div className="mb-12 md:mb-16">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-lavender font-mono text-sm tracking-wider">01</span>
          <div className="h-px w-12 bg-lavender/50" />
        </div>
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white">
          About Me
        </h2>
      </div>

      {/* Content - Stack on mobile, side-by-side on larger screens */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-16">
        {/* Headshot */}
        <div className="flex-shrink-0 w-full max-w-[300px] md:max-w-[400px] lg:max-w-[450px]">
          <div
            className="relative"
            onMouseEnter={() => setHasInteracted(true)}
          >
            <RasterSplit
              imageSrc={headshotPath}
              maxWidth={450}
              maxHeight={450}
              minSplitDistance={3}
              borderRadius={20}
              splitMode="quadrant"
              splitRadius={50}
              className="pointer-events-auto"
            />
            {/* Overlay hint - pointer-events-none allows clicks to pass through */}
            <div
              className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
                hasInteracted ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ borderRadius: '20px' }}
            >
              <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <span className="text-white text-sm font-mono tracking-wide">
                  Hover to Reveal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Text */}
        <div className="flex flex-col gap-6 md:gap-8 max-w-[800px]">
          <ScrambledText
            radius={100}
            duration={1.5}
            speed={0.6}
            scrambleChars="!<>-_\\/[]{}—=+*^?#________"
            className="m-0 text-base md:text-lg leading-relaxed"
          >
            Hey everyone, and welcome to my little corner of the internet! My name is Ben, but all my friends call me BL, and I&apos;m a Commerce & Computer Science student at Queen&apos;s University currently living in Toronto.
          </ScrambledText>

          <ScrambledText
            radius={100}
            duration={1.5}
            speed={0.6}
            scrambleChars="!<>-_\\/[]{}—=+*^?#________"
            className="m-0 text-base md:text-lg leading-relaxed"
          >
            I am passionate about many things, but a few that you would probably be interested in are business development, finance, AI, software development, data science and UI/UX design. My journey into the world of technology and innovation came from, well... innovation! I am obsessed with the constant technological innovation that is happening all around us: AI, quantum computing, you name it.
          </ScrambledText>

          <ScrambledText
            radius={100}
            duration={1.5}
            speed={0.6}
            scrambleChars="!<>-_\\/[]{}—=+*^?#________"
            className="m-0 text-base md:text-lg leading-relaxed"
          >
            When I&apos;m not coding, you can probably find me with my friends rock-climbing, exploring the outdoors, travelling, or maybe cooking something absolutely delicious.
          </ScrambledText>

          {/* Interest Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {['AI', 'Software Dev', 'Finance', 'UI/UX', 'Data Science', 'Innovation'].map(
              (interest) => (
                <span
                  key={interest}
                  className="px-3 py-1.5 text-xs font-mono tracking-wide bg-white/5 border border-white/10 text-white/60 rounded hover:border-lavender/30 hover:text-lavender transition-colors"
                >
                  {interest}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
