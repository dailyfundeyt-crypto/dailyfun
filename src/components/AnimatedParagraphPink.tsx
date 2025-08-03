import React, { useEffect, useRef, useState } from 'react';

interface AnimatedParagraphPinkProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedParagraphPink: React.FC<AnimatedParagraphPinkProps> = ({ 
  children, 
  className = '', 
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
            setIsAnimating(true);
            
            // End animation after short duration
            setTimeout(() => {
              setIsAnimating(false);
            }, 800);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div 
      ref={elementRef} 
      className={`sans-serif font-normal leading-relaxed transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{
        textShadow: isAnimating 
          ? '0 0 20px #5E40E3, 0 0 40px #5E40E3, 0 0 60px #5E40E3' 
          : 'none',
        color: isAnimating ? '#5E40E3' : '#5E40E3',
        transition: 'all 0.8s cubic-bezier(0.23, 1, 0.320, 1)'
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedParagraphPink;