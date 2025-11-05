'use client';

import React from 'react';
import FuzzyText from './FuzzyText';
import useTypewriter from '../hooks/useTypewriter';

interface FuzzyTypewriterProps {
  // Typewriter props
  text: string | string[];
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  variableSpeed?: { min: number; max: number };
  onSentenceComplete?: (sentence: string, index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;

  // Fuzzy visual props
  fontSize?: number | string;
  fontWeight?: string | number;
  fontFamily?: string;
  fontStyle?: string;
  color?: string;
  fuzzyIntensity?: number;

  // Cursor props
  showCursor?: boolean;
  cursorCharacter?: string;
}

const FuzzyTypewriter: React.FC<FuzzyTypewriterProps> = ({
  // Typewriter props
  text,
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = false,
  variableSpeed,
  onSentenceComplete,
  startOnVisible = true,
  reverseMode = false,

  // Fuzzy props
  fontSize = 'clamp(1rem, 4vw, 2rem)',
  fontWeight = 700,
  fontFamily = 'inherit',
  fontStyle = 'normal',
  color = '#ffffff',
  fuzzyIntensity = 0.18,

  // Cursor props
  showCursor = true,
  cursorCharacter = '|'
}) => {
  const { displayedText } = useTypewriter({
    text,
    typingSpeed,
    initialDelay,
    pauseDuration,
    deletingSpeed,
    loop,
    variableSpeed,
    onSentenceComplete,
    startOnVisible,
    reverseMode
  });

  // Add cursor character if enabled
  const textWithCursor = showCursor ? `${displayedText}${cursorCharacter}` : displayedText;

  return (
    <FuzzyText
      fontSize={fontSize}
      fontWeight={fontWeight}
      fontFamily={fontFamily}
      fontStyle={fontStyle}
      color={color}
      enableHover={false} // No hover interaction
      baseIntensity={fuzzyIntensity}
      hoverIntensity={fuzzyIntensity} // Same as base (no hover effect)
    >
      {textWithCursor}
    </FuzzyText>
  );
};

export default FuzzyTypewriter;
