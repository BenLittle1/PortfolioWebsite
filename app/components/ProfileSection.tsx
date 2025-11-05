'use client';

import Image from 'next/image';
import PixelTransition from './PixelTransition';
import ScrambledText from './ScrambledText';

export default function ProfileSection() {
  // Headshot image
  const headshotPath = '/assets/headshot.jpeg';

  const firstContent = (
    <div className="relative w-full h-full">
      <Image
        src={headshotPath}
        alt="Ben Little headshot"
        fill
        className="object-cover"
        priority
      />
    </div>
  );

  const secondContent = (
    <div className="relative w-full h-full bg-black flex items-center justify-center p-8">
      <div className="text-center">
        <h3 className="text-3xl md:text-4xl font-bold">That's Me!</h3>
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-12 pointer-events-auto max-w-[1800px] mx-auto">
      {/* Headshot */}
      <div className="flex-shrink-0">
        <PixelTransition
          firstContent={firstContent}
          secondContent={secondContent}
          gridSize={20}
          pixelColor="#000000"
          animationStepDuration={0.4}
          once={false}
          aspectRatio="100%"
          className="w-[400px] md:w-[500px]"
        />
      </div>

      {/* Bio Text */}
      <div className="flex flex-col gap-8 max-w-[1200px]">
        <ScrambledText
          radius={120}
          duration={1.5}
          speed={0.6}
          scrambleChars="!<>-_\\/[]{}—=+*^?#________"
          className="m-0 text-lg break-words"
        >
          Hey everyone, and welcome to my little corner of the internet! My name is Ben, but all my friends call me BL, and I'm a Commerce & Computer Science student at Queen's University currently living in Toronto.
        </ScrambledText>

        <ScrambledText
          radius={120}
          duration={1.5}
          speed={0.6}
          scrambleChars="!<>-_\\/[]{}—=+*^?#________"
          className="m-0 text-lg break-words"
        >
          I am passionate about many things, but a few that you would probably be interested in are business development, finance, AI, software development, data science and UI/UX design. My journey into the world of technology and innovation came from, well… innovation! I am obsessed with the constant technological innovation that is happening all around us: AI, quantum computing, you name it. My fascination with innovation has blossomed into a career aspiration to create meaningful and innovative solutions on the cutting edge of our technological capabilities.
        </ScrambledText>

        <ScrambledText
          radius={120}
          duration={1.5}
          speed={0.6}
          scrambleChars="!<>-_\\/[]{}—=+*^?#________"
          className="m-0 text-lg break-words"
        >
          When I'm not coding, you can probably find me with my friends rock-climbing, exploring the outdoors, travelling, or maybe cooking something absolutely delicious.
        </ScrambledText>
      </div>
    </div>
  );
}
