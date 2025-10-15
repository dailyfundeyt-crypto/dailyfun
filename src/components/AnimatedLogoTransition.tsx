import React, { useEffect, useState } from 'react';
import dailyFunLogo from '@/assets/daily-fun-logo.png';
import conectLogo from '@/assets/conect-logo.png';

const AnimatedLogoTransition: React.FC = () => {
  const [phase, setPhase] = useState<'initial' | 'contracting' | 'forming' | 'glowing' | 'complete' | 'returning'>('initial');
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const runCycle = () => {
      const timeline = [
        { delay: 500, nextPhase: 'contracting' as const },
        { delay: 1500, nextPhase: 'forming' as const },
        { delay: 2500, nextPhase: 'glowing' as const },
        { delay: 4000, nextPhase: 'complete' as const },
        { delay: 6000, nextPhase: 'returning' as const },
        { delay: 7500, nextPhase: 'initial' as const },
      ];

      const timeouts = timeline.map(({ delay, nextPhase }) =>
        setTimeout(() => {
          setPhase(nextPhase);
          if (nextPhase === 'initial') {
            setCycle(prev => prev + 1);
          }
        }, delay)
      );

      return () => timeouts.forEach(clearTimeout);
    };

    const cleanup = runCycle();
    return cleanup;
  }, [cycle]);

  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Daily Fun Logo - fades and contracts */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
          phase === 'initial'
            ? 'opacity-100 scale-100'
            : phase === 'contracting'
            ? 'opacity-60 scale-75'
            : phase === 'returning'
            ? 'opacity-100 scale-100'
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
          phase === 'initial' || phase === 'contracting' || phase === 'returning'
            ? 'opacity-0 scale-50 rotate-180'
            : phase === 'forming'
            ? 'opacity-70 scale-90 rotate-45'
            : phase === 'glowing' || phase === 'complete'
            ? 'opacity-100 scale-100 rotate-0'
            : 'opacity-100 scale-100 rotate-0'
        }`}
        style={{
          filter: phase === 'forming' ? 'blur(4px)' : 'blur(0px)',
        }}
      >
        <div
          className={`relative w-full h-full ${
            (phase === 'glowing' || phase === 'complete')
              ? 'animate-glow-continuous'
              : ''
          }`}
          style={{
            filter: (phase === 'glowing' || phase === 'complete')
              ? 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 40px rgba(200, 200, 200, 0.6))' 
              : 'none',
          }}
        >
          <img
            src={conectLogo}
            alt="Conect Logo"
            className="w-full h-full object-contain animate-metallic-shine"
          />
        </div>
      </div>

      {/* Metallic shine overlay during glow and complete phase */}
      {(phase === 'glowing' || phase === 'complete') && (
        <>
          <div
            className="absolute inset-0 pointer-events-none animate-shine-continuous"
            style={{
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, transparent 70%)',
            }}
          />
          {/* Additional ring shine effects */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 45% 45%, rgba(255,255,255,0.5) 0%, transparent 30%), radial-gradient(circle at 55% 55%, rgba(255,255,255,0.5) 0%, transparent 30%)',
              animation: 'ring-shine 2s ease-in-out infinite',
            }}
          />
        </>
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

        @keyframes glow-continuous {
          0%, 100% {
            filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 25px rgba(200, 200, 200, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(255, 255, 255, 1)) drop-shadow(0 0 50px rgba(200, 200, 200, 0.8)) drop-shadow(0 0 70px rgba(255, 255, 255, 0.5));
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

        @keyframes shine-continuous {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        @keyframes ring-shine {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes metallic-shine {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.3) contrast(1.1);
          }
        }

        .animate-glow {
          animation: glow 0.7s ease-out;
        }

        .animate-glow-continuous {
          animation: glow-continuous 2s ease-in-out infinite;
        }

        .animate-shine-continuous {
          animation: shine-continuous 2s ease-in-out infinite;
        }

        .animate-metallic-shine {
          animation: metallic-shine 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedLogoTransition;
