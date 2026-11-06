'use client';

import React, { useState, useEffect, useMemo } from 'react';

const DEFAULT_SENTENCES = [
  'Welcome! Get smarter portfolios with all-in-one wealth management.',
  'We test your retirement goals with real-time projections.',
  'Then you know one person can\'t do it all. Here, you get a team of experts with 0% AUM fees.',
  'We check your mix against the risk you are willing to take.',
  'One membership covers your full financial life, tax and estate work included.',
  'This sets the tax brackets and savings targets we plan around.',
  'Active AI and CFP® advisor management built for your retirement.',
  'Automated tax-loss harvesting and custom portfolio optimization.',
  'Transparent pricing with zero hidden asset management markups.',
  'Real CFP® professionals paired with real-time portfolio intelligence.',
];

interface RaiTypewriterProps {
  initialMessage?: string;
}

export default function RaiTypewriter({ initialMessage }: RaiTypewriterProps) {
  const sentences = useMemo(() => {
    if (!initialMessage) return DEFAULT_SENTENCES;
    return [initialMessage, ...DEFAULT_SENTENCES.filter((s) => s !== initialMessage)];
  }, [initialMessage]);

  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // On client mount, start typing immediately
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const currentSentence = sentences[sentenceIndex];

    if (!isDeleting) {
      // Typing phase: character by character
      if (displayText.length < currentSentence.length) {
        const typeTimer = setTimeout(() => {
          setDisplayText(currentSentence.slice(0, displayText.length + 1));
        }, 22);
        return () => clearTimeout(typeTimer);
      } else {
        // Fully typed: keep cursor blinking for 4 seconds before clearing
        const holdTimer = setTimeout(() => {
          setIsDeleting(true);
        }, 4000);
        return () => clearTimeout(holdTimer);
      }
    } else {
      // Clearing phase: backspacing character by character
      if (displayText.length > 0) {
        const deleteTimer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 12);
        return () => clearTimeout(deleteTimer);
      } else {
        // Fully cleared: pause briefly with just the cursor, then next sentence
        const switchTimer = setTimeout(() => {
          setIsDeleting(false);
          setSentenceIndex((prev) => (prev + 1) % sentences.length);
        }, 250);
        return () => clearTimeout(switchTimer);
      }
    }
  }, [displayText, isDeleting, sentenceIndex, sentences, isMounted]);

  return (
    <span className="inline font-normal">
      <span>{isMounted ? displayText : (initialMessage || DEFAULT_SENTENCES[0])}</span>
      <span
        aria-hidden="true"
        className="cursor-blink inline-block w-[3px] h-[1.15em] ml-1 bg-[#1d1d1f] align-middle rounded-[1px]"
        style={{
          verticalAlign: '-0.15em',
        }}
      />
    </span>
  );
}
