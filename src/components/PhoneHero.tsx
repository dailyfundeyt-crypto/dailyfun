import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Text } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

// Phone Screen Content Component
const PhoneScreen = () => {
  return (
    <group position={[0, 0, 0.52]}>
      {/* Screen background */}
      <mesh>
        <planeGeometry args={[1.6, 2.8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Status bar */}
      <mesh position={[0, 1.3, 0.001]}>
        <planeGeometry args={[1.5, 0.15]} />
        <meshBasicMaterial color="#f8f9fa" />
      </mesh>
      
      {/* Header with Daily Fun */}
      <mesh position={[0, 1.1, 0.001]}>
        <planeGeometry args={[1.5, 0.3]} />
        <meshBasicMaterial color="#E4002B" />
      </mesh>
      
      {/* Article content area */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[1.4, 1.8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Article image placeholder */}
      <mesh position={[0, 0.4, 0.002]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshBasicMaterial color="#f1f3f4" />
      </mesh>
      
      {/* Article text lines */}
      {[-0.2, -0.4, -0.6, -0.8].map((y, index) => (
        <mesh key={index} position={[0, y, 0.002]}>
          <planeGeometry args={[1.1, 0.08]} />
          <meshBasicMaterial color="#e9ecef" />
        </mesh>
      ))}
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
        
        {/* 3D Phone */}
        <div className="w-full h-96 md:h-[500px]">
          <Canvas
            camera={{ position: [0, 0, 8], fov: 50 }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[-10, -10, -5]} intensity={0.5} />
            
            <AnimatedPhone />
            
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 2}
              autoRotate
              autoRotateSpeed={1}
            />
          </Canvas>
        </div>
      </div>
    </section>
  );
};

export default PhoneHero;