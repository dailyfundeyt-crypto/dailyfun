import React, { useEffect, useRef, useState } from 'react';

interface AnimatedParagraphProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedParagraph: React.FC<AnimatedParagraphProps> = ({ 
  children, 
  className = '', 
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedWords, setAnimatedWords] = useState<number>(0);
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Extract text content from React children
  const getTextContent = (element: React.ReactNode): string => {
    if (typeof element === 'string') return element;
    if (typeof element === 'number') return element.toString();
    if (React.isValidElement(element) && element.props.children) {
      return getTextContent(element.props.children);
    }
    if (Array.isArray(element)) {
      return element.map(getTextContent).join('');
    }
    return '';
  };

  const textContent = getTextContent(children);
  const words = textContent.split(/(\s+)/).filter(word => word.length > 0);

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
    if (isVisible) {
      let currentIndex = 0;

      const animateNextWord = () => {
        if (currentIndex < words.length) {
          setAnimatedWords(currentIndex + 1);
          currentIndex++;
          setTimeout(animateNextWord, 120);
        }
      };

      setTimeout(animateNextWord, delay);
    }
  }, [isVisible, words.length, delay]);

  const renderAnimatedContent = () => {
    return words.map((word, index) => {
      const isAnimated = index < animatedWords;
      const isCurrentlyAnimating = index === animatedWords - 1;
      
      return (
        <span
          key={index}
          className={`inline-block transition-all duration-500 ${
            isAnimated
              ? 'opacity-100 text-[#1A1A1A]'
              : 'opacity-0'
          } ${
            isCurrentlyAnimating && !word.match(/\s/)
              ? 'text-[#2EEAE0] animate-pulse'
              : ''
          }`}
          style={{
            textShadow: isCurrentlyAnimating && !word.match(/\s/) 
              ? '0 0 15px #2EEAE0, 0 0 25px #2EEAE0' 
              : 'none',
            transition: 'all 0.3s ease-in-out'
          }}
        >
          {word}
        </span>
      );
    });
  };

  return (
    <div ref={elementRef} className={`sans-serif font-normal leading-relaxed ${className}`}>
      {renderAnimatedContent()}
    </div>
  );
};

export default AnimatedParagraph;