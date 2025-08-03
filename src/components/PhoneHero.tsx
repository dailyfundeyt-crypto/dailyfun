import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Text } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import AnimatedParagraphPink from './AnimatedParagraphPink';

// Phone Screen Content Component
const PhoneScreen = () => {
  return (
    <group position={[0, 0, 0.52]}>
      {/* Screen background */}
      <mesh>
        <planeGeometry args={[1.6, 2.8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Top section with "Make News Fun Again" */}
      <group position={[0, 1.2, 0.001]}>
        <Text
          fontSize={0.08}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          Make News Fun Again
        </Text>
        
        {/* Decorative waves */}
        <mesh position={[0, -0.15, 0.001]}>
          <planeGeometry args={[1.2, 0.08]} />
          <meshBasicMaterial>
            <canvasTexture 
              attach="map" 
              image={(() => {
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 20;
                const ctx = canvas.getContext('2d')!;
                
                // Create wave gradient
                const gradient = ctx.createLinearGradient(0, 0, 200, 0);
                gradient.addColorStop(0, '#E4002B');
                gradient.addColorStop(0.5, '#007BFF');
                gradient.addColorStop(1, '#E4002B');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 200, 20);
                
                return canvas;
              })()} 
            />
          </meshBasicMaterial>
        </mesh>
      </group>
      
      {/* Daily Fun Channel Section */}
      <group position={[0, 0.5, 0.001]}>
        {/* Profile circle */}
        <mesh position={[-0.4, 0, 0.001]}>
          <circleGeometry args={[0.12]} />
          <meshBasicMaterial color="#E4002B" />
        </mesh>
        
        {/* Channel name */}
        <Text
          fontSize={0.08}
          color="#666666"
          anchorX="left"
          anchorY="middle"
          position={[-0.2, 0.05, 0.001]}
        >
          Daily Fun EN
        </Text>
        
        {/* Channel handle */}
        <Text
          fontSize={0.06}
          color="#999999"
          anchorX="left"
          anchorY="middle"
          position={[-0.2, -0.05, 0.001]}
        >
          @DailyFunEN
        </Text>
      </group>
      
      {/* Description text */}
      <group position={[0, 0.1, 0.001]}>
        <Text
          fontSize={0.05}
          color="#666666"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.2}
          textAlign="center"
          lineHeight={1.2}
        >
          Daily Fun delivers news like you've never{'\n'}
          seen before! Your daily dose of trustworthy{'\n'}
          entertainment and absurd insights.
        </Text>
      </group>
      
      {/* Subscribe button */}
      <group position={[0, -0.3, 0.001]}>
        <mesh>
          <planeGeometry args={[0.8, 0.15]} />
          <meshBasicMaterial color="#f0f0f0" />
        </mesh>
        <Text
          fontSize={0.06}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          position={[0, 0, 0.001]}
          fontWeight="bold"
        >
          Abonnieren
        </Text>
      </group>
      
      {/* Bottom graphic section */}
      <group position={[0, -0.8, 0.001]}>
        {/* Abstract graphic placeholder */}
        <mesh position={[0, 0.1, 0.001]}>
          <planeGeometry args={[0.8, 0.4]} />
          <meshBasicMaterial color="#2a2a2a" />
        </mesh>
        
        {/* Purple elements */}
        <mesh position={[-0.1, 0.1, 0.002]}>
          <circleGeometry args={[0.03]} />
          <meshBasicMaterial color="#8B5CF6" />
        </mesh>
        
        <mesh position={[0.15, 0.05, 0.002]}>
          <circleGeometry args={[0.02]} />
          <meshBasicMaterial color="#A855F7" />
        </mesh>
        
        {/* Blue accent */}
        <mesh position={[0.2, -0.05, 0.002]}>
          <planeGeometry args={[0.15, 0.08]} />
          <meshBasicMaterial color="#007BFF" />
        </mesh>
        
        {/* Bottom text */}
        <Text
          fontSize={0.04}
          color="#999999"
          anchorX="center"
          anchorY="middle"
          position={[0, -0.25, 0.001]}
        >
          Auf diesem Kanal gibt es keine Inhalte
        </Text>
      </group>
    </group>
  );
};

// Animated Phone Component
const AnimatedPhone = () => {
  const phoneRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (phoneRef.current) {
      phoneRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      phoneRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  return (
    <group ref={phoneRef}>
      {/* Phone body */}
      <RoundedBox args={[2, 4, 1]} radius={0.2} smoothness={4}>
        <meshStandardMaterial color="#1a1a1a" />
      </RoundedBox>
      
      {/* Screen */}
      <mesh position={[0, 0, 0.51]}>
        <planeGeometry args={[1.7, 3]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Phone content */}
      <PhoneScreen />
      
      {/* Home indicator */}
      <mesh position={[0, -1.7, 0.52]}>
        <planeGeometry args={[0.3, 0.06]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
    </group>
  );
};

const PhoneHero = () => {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          {/* Daily Fun Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 sans-serif" style={{ color: '#1A1A1A' }}>
            Daily Fun
          </h1>
          
          {/* Animated Motto */}
          <div className="mb-12">
            <h2 
              className="text-3xl md:text-5xl font-light liquid-text animate-pulse"
              style={{ color: '#5E40E3', opacity: 0.8 }}
            >
              Make News Fun Again
            </h2>
          </div>
        </div>
        
        {/* Phone and Text Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Phone Image */}
          <div className="flex items-center justify-center lg:justify-end">
            <img 
              src="/lovable-uploads/9337a300-032d-4b3f-a84b-f6e9dca5af00.png"
              alt="Daily Fun Smartphone"
              className="max-h-96 md:max-h-[500px] w-auto animate-fade-in hover-scale"
            />
          </div>
          
          {/* Text Content */}
          <div className="flex flex-col items-start lg:items-start space-y-8 lg:pl-8">
            {/* Main Tagline - Load separately */}
            <div style={{ opacity: 1 }}>
              <AnimatedParagraphPink className="text-2xl md:text-4xl font-medium" delay={200}>
                Ihre tägliche Dosis vertrauenswürdiger Unterhaltung.
              </AnimatedParagraphPink>
            </div>
            
            {/* Signature - Load separately */}
            <div style={{ opacity: 1 }}>
              <div className="text-3xl md:text-5xl font-signature" style={{ color: '#5E40E3' }}>
                Stefan Kunc
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhoneHero;