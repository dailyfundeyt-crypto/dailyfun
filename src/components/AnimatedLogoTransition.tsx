import React, { useEffect, useState } from 'react';
import dailyFunLogo from '@/assets/daily-fun-logo.png';
import conectLogo from '@/assets/conect-logo.png';

const AnimatedLogoTransition: React.FC = () => {
  const [phase, setPhase] = useState<'initial' | 'contracting' | 'forming' | 'glowing' | 'complete'>('initial');

  useEffect(() => {
    const timeline = [
      { delay: 500, nextPhase: 'contracting' as const },
      { delay: 1500, nextPhase: 'forming' as const },
      { delay: 2500, nextPhase: 'glowing' as const },
      { delay: 3200, nextPhase: 'complete' as const },
    ];

    const timeouts = timeline.map(({ delay, nextPhase }) =>
      setTimeout(() => setPhase(nextPhase), delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Daily Fun Logo - fades and contracts */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
          phase === 'initial'
            ? 'opacity-100 scale-100'
            : phase === 'contracting'
            ? 'opacity-60 scale-75'
            : 'opacity-0 scale-50'
        }`}
        style={{
          filter: phase === 'contracting' ? 'blur(2px)' : 'blur(0px)',
        }}
      >
        <img
          src={dailyFunLogo}
          alt="Daily Fun Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Energy particles effect during transition */}
      {(phase === 'contracting' || phase === 'forming') && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-pulse"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(${phase === 'forming' ? '0px' : '-30px'})`,
                opacity: phase === 'forming' ? 0 : 0.8,
                transition: 'all 1s ease-out',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Conect Logo - forms and glows */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
          phase === 'initial' || phase === 'contracting'
            ? 'opacity-0 scale-50 rotate-180'
            : phase === 'forming'
            ? 'opacity-70 scale-90 rotate-45'
            : phase === 'glowing'
            ? 'opacity-100 scale-100 rotate-0'
            : 'opacity-100 scale-100 rotate-0'
        }`}
        style={{
          filter: phase === 'forming' ? 'blur(4px)' : 'blur(0px)',
        }}
      >
        <div
          className={`relative w-full h-full ${
            phase === 'glowing'
              ? 'animate-glow'
              : ''
          }`}
          style={{
            filter: phase === 'glowing' 
              ? 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 40px rgba(200, 200, 200, 0.6))' 
              : 'none',
          }}
        >
          <img
            src={conectLogo}
            alt="Conect Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Metallic shine overlay during glow phase */}
      {phase === 'glowing' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
            animation: 'shine 0.7s ease-out',
          }}
        />
      )}

      <style>{`
        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 50px rgba(200, 200, 200, 0.7));
          }
        }

        @keyframes shine {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }

        .animate-glow {
          animation: glow 0.7s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AnimatedLogoTransition;
