import React, { useEffect, useState } from 'react';
import dailyFunLogo from '@/assets/daily-fun-logo.png';
import conectLogo from '@/assets/conect-logo.png';

const AnimatedLogoTransition: React.FC = () => {
  const [phase, setPhase] = useState<'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5' | 'returning'>('phase1');
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const runCycle = () => {
      const timeline = [
        { delay: 2000, nextPhase: 'phase2' as const },  // Phase 1 → Phase 2: Auflösen
        { delay: 3500, nextPhase: 'phase3' as const },  // Phase 2 → Phase 3: Formung
        { delay: 5000, nextPhase: 'phase4' as const },  // Phase 3 → Phase 4: Vollständig
        { delay: 6500, nextPhase: 'phase5' as const },  // Phase 4 → Phase 5: Schwarzer Hintergrund
        { delay: 9000, nextPhase: 'returning' as const }, // Zurück
        { delay: 10500, nextPhase: 'phase1' as const }, // Neustart
      ];

      const timeouts = timeline.map(({ delay, nextPhase }) =>
        setTimeout(() => {
          setPhase(nextPhase);
          if (nextPhase === 'phase1') {
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
      {/* Phase 5: Schwarzer runder Hintergrund */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-1000 ${
          phase === 'phase5' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          background: 'radial-gradient(circle, #1a1a1a 0%, #000000 100%)',
          boxShadow: phase === 'phase5' ? '0 0 60px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(0, 0, 0, 0.5)' : 'none',
        }}
      />

      {/* Phase 1: Daily Fun Logo */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
          phase === 'phase1'
            ? 'opacity-100 scale-100'
            : phase === 'phase2'
            ? 'opacity-40 scale-75'
            : phase === 'returning'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-50'
        }`}
        style={{
          filter: phase === 'phase2' ? 'blur(3px)' : 'blur(0px)',
        }}
      >
        <img
          src={dailyFunLogo}
          alt="Daily Fun Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Phase 2: Wirbelnde, sich auflösende Partikel */}
      {phase === 'phase2' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-swirl"
              style={{
                width: `${4 + (i % 3) * 2}px`,
                height: `${4 + (i % 3) * 2}px`,
                background: i % 2 === 0 
                  ? 'linear-gradient(135deg, rgba(147, 197, 253, 0.8), rgba(59, 130, 246, 0.4))' 
                  : 'linear-gradient(135deg, rgba(252, 165, 165, 0.8), rgba(239, 68, 68, 0.4))',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 22.5}deg) translateY(-40px)`,
                animation: `swirl-out 1.5s ease-out forwards`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Phase 3: Formung der Ringe aus den Partikeln */}
      {phase === 'phase3' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(200, 200, 200, 0.9), rgba(150, 150, 150, 0.6))',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-35px)`,
                animation: 'converge-to-rings 1.5s ease-out forwards',
                animationDelay: `${i * 0.08}s`,
                filter: 'blur(1px)',
              }}
            />
          ))}
        </div>
      )}

      {/* Phase 3-5: Conect Logo */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
          phase === 'phase1' || phase === 'phase2' || phase === 'returning'
            ? 'opacity-0 scale-50 rotate-180'
            : phase === 'phase3'
            ? 'opacity-60 scale-85 rotate-90'
            : phase === 'phase4'
            ? 'opacity-100 scale-100 rotate-0'
            : phase === 'phase5'
            ? 'opacity-100 scale-95 rotate-0'
            : 'opacity-100 scale-100 rotate-0'
        }`}
        style={{
          filter: phase === 'phase3' ? 'blur(3px)' : 'blur(0px)',
          zIndex: phase === 'phase5' ? 10 : 5,
        }}
      >
        <div
          className={`relative w-full h-full ${
            (phase === 'phase4' || phase === 'phase5')
              ? 'animate-glow-continuous'
              : ''
          }`}
          style={{
            filter: (phase === 'phase4' || phase === 'phase5')
              ? 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 40px rgba(220, 220, 220, 0.7))' 
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

      {/* Phase 4-5: Intensives Leuchten und Glanz */}
      {(phase === 'phase4' || phase === 'phase5') && (
        <>
          <div
            className="absolute inset-0 pointer-events-none animate-shine-continuous"
            style={{
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.5) 0%, transparent 60%)',
              zIndex: 15,
            }}
          />
          {/* Kreuzförmige Lichteffekte */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                linear-gradient(90deg, transparent 48%, rgba(255,255,255,0.6) 50%, transparent 52%),
                linear-gradient(0deg, transparent 48%, rgba(255,255,255,0.6) 50%, transparent 52%)
              `,
              animation: 'cross-shine 2s ease-in-out infinite',
              zIndex: 15,
            }}
          />
          {/* Ring-Glanz-Effekte */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 45% 45%, rgba(255,255,255,0.6) 0%, transparent 25%), radial-gradient(circle at 55% 55%, rgba(255,255,255,0.6) 0%, transparent 25%)',
              animation: 'ring-shine 2s ease-in-out infinite',
              zIndex: 15,
            }}
          />
        </>
      )}

      <style>{`
        @keyframes glow-continuous {
          0%, 100% {
            filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.7)) drop-shadow(0 0 30px rgba(220, 220, 220, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 35px rgba(255, 255, 255, 1)) drop-shadow(0 0 60px rgba(220, 220, 220, 0.9)) drop-shadow(0 0 80px rgba(255, 255, 255, 0.6));
          }
        }

        @keyframes shine-continuous {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.15);
          }
        }

        @keyframes ring-shine {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes cross-shine {
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
            filter: brightness(1.4) contrast(1.15);
          }
        }

        @keyframes swirl-out {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateY(0px) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50%, -50%) rotate(180deg) translateY(-50px) scale(1.2);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) translateY(-80px) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes converge-to-rings {
          0% {
            transform: translate(-50%, -50%) rotate(var(--start-rotation, 0deg)) translateY(-80px) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) rotate(calc(var(--start-rotation, 0deg) + 180deg)) translateY(-50px) scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) rotate(calc(var(--start-rotation, 0deg) + 360deg)) translateY(-35px) scale(1);
            opacity: 1;
          }
        }

        .animate-glow-continuous {
          animation: glow-continuous 2.5s ease-in-out infinite;
        }

        .animate-shine-continuous {
          animation: shine-continuous 2.5s ease-in-out infinite;
        }

        .animate-metallic-shine {
          animation: metallic-shine 3s ease-in-out infinite;
        }

        .animate-swirl {
          animation: swirl-out 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AnimatedLogoTransition;
