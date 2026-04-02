'use client';

import { useState } from 'react';
import RasterSplit from './RasterSplit';
import ScrambledText from './ScrambledText';

export default function ProfileSection() {
  const headshotPath = '/assets/headshot.jpeg';
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <div className="section-container pointer-events-auto">
      <div className="mb-12 md:mb-16">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-lavender font-mono text-sm tracking-wider">01</span>
          <div className="h-px w-12 bg-lavender/50" />
        </div>
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white">
          About Me
        </h2>
      </div>

      <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-stretch lg:gap-12 xl:gap-16">
        <div className="w-full max-w-[300px] flex-shrink-0 self-start md:max-w-[400px] lg:w-[420px] lg:max-w-[420px] xl:w-[450px] xl:max-w-[450px]">
          <div className="relative">
            <RasterSplit
              imageSrc={headshotPath}
              maxWidth={450}
              maxHeight={450}
              minSplitDistance={2}
              borderRadius={20}
              splitMode="quadrant"
              splitRadius={42}
              minCellSize={2}
              onInteractionStart={() => setHasInteracted(true)}
              className="pointer-events-auto"
            />

            <div
              className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
                hasInteracted ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ borderRadius: '20px' }}
            >
              <div className="rounded-full border border-white/20 bg-black/70 px-6 py-3 backdrop-blur-sm">
                <span className="text-sm font-mono tracking-wide text-white">
                  Hover, drag, or tap to reveal
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 max-w-[800px] flex-col gap-8 lg:min-h-[420px] lg:flex-1 lg:self-stretch lg:justify-between xl:min-h-[450px]">
          <div className="flex max-w-[42rem] flex-col gap-6 md:gap-8">
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
          </div>

          <div className="flex max-w-[42rem] flex-wrap gap-2 lg:gap-1.5 xl:gap-2">
            {['AI', 'Software Dev', 'Finance', 'UI/UX', 'Data Science', 'Innovation'].map(
              (interest) => (
                <span
                  key={interest}
                  className="rounded border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-mono tracking-wide text-white/60 transition-colors hover:border-lavender/30 hover:text-lavender md:text-xs"
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
