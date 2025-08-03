import React, { useEffect, useRef, useState } from 'react';

interface AnimatedTextProps {
  children: string;
  className?: string;
  delay?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ children, className = '', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedWords, setAnimatedWords] = useState<string[]>([]);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && children) {
      const words = children.split(' ');
      let currentIndex = 0;

      const animateNextWord = () => {
        if (currentIndex < words.length) {
          setAnimatedWords(prev => [...prev, words[currentIndex]]);
          currentIndex++;
          setTimeout(animateNextWord, 150 + delay);
        }
      };

      setTimeout(animateNextWord, delay);
    }
  }, [isVisible, children, delay]);

  const renderAnimatedText = () => {
    const allWords = children.split(' ');
    
    return allWords.map((word, index) => {
      const isAnimated = index < animatedWords.length;
      const isCurrentlyAnimating = index === animatedWords.length - 1;
      
      return (
        <span
          key={index}
          className={`inline-block transition-all duration-300 ${
            isAnimated
              ? 'opacity-100 text-[#1A1A1A]'
              : 'opacity-0'
          } ${
            isCurrentlyAnimating
              ? 'animate-pulse text-[#2EEAE0] glow-text'
              : ''
          }`}
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          {word}
          {index < allWords.length - 1 && ' '}
        </span>
      );
    });
  };

  return (
    <div ref={elementRef} className={className}>
      <style>{`
        .glow-text {
          text-shadow: 0 0 10px #2EEAE0, 0 0 20px #2EEAE0, 0 0 30px #2EEAE0;
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            text-shadow: 0 0 5px #2EEAE0;
          }
          50% {
            text-shadow: 0 0 20px #2EEAE0, 0 0 30px #2EEAE0;
          }
        }
        
        .animate-glow {
          animation: glow-pulse 0.8s ease-in-out;
        }
      `}</style>
      {renderAnimatedText()}
    </div>
  );
};

export default AnimatedText;