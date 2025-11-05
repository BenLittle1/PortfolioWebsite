'use client';

import { useState } from 'react';
import PixelBlast from './components/PixelBlast';
import FuzzyText from './components/FuzzyText';
import FuzzyTypewriter from './components/FuzzyTypewriter';
import ProfileSection from './components/ProfileSection';

export default function Home() {
  const [isHoveringName, setIsHoveringName] = useState(false);

  return (
    <div className="relative w-full min-h-screen">
      {/* Background - fixed across all sections */}
      <div className="fixed inset-0 z-0">
        <PixelBlast />
      </div>

      {/* Section 1: Hero with "ben little" text */}
      <section className="relative z-10 min-h-screen flex items-center justify-center pointer-events-none">
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
      </section>

      {/* Section 2: Profile headshot */}
      <section className="relative z-10 min-h-screen flex items-center justify-center py-20 pointer-events-none">
        <ProfileSection />
      </section>
    </div>
  );
}
