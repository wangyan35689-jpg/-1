import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { AppState, THEME } from '../types';
import Foliage from './Foliage';
import Ornaments from './Ornaments';

interface ExperienceProps {
  appState: AppState;
}

const SceneContent: React.FC<ExperienceProps> = ({ appState }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Slow rotation of the entire tree group for cinematic effect
  useFrame((state) => {
    if (groupRef.current) {
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <>
      <group ref={groupRef} position={[0, -5, 0]}>
        {/* Core Tree Structure (Particles) */}
        <Foliage appState={appState} count={6000} />

        {/* Ornaments - Layers */}
        {/* 1. Golden Baubles */}
        <Ornaments 
            appState={appState} 
            type="BAUBLE" 
            count={150} 
            color={THEME.brightGold} 
        />
        
        {/* 2. Red Accents */}
        <Ornaments 
            appState={appState} 
            type="BAUBLE" 
            count={80} 
            color={THEME.accentRed} 
        />

        {/* 3. Gift Boxes */}
        <Ornaments 
            appState={appState} 
            type="GIFT" 
            count={40} 
            color={THEME.emerald} 
        />

        {/* 4. Glowing Lights */}
        <Ornaments 
            appState={appState} 
            type="LIGHT" 
            count={300} 
            color={THEME.warmWhite} 
        />
      </group>

      {/* Ground Reflections */}
      <ContactShadows 
        opacity={0.5} 
        scale={30} 
        blur={2} 
        far={10} 
        resolution={256} 
        color="#000000" 
      />
    </>
  );
};

const Experience: React.FC<ExperienceProps> = ({ appState }) => {
  return (
    <Canvas
      dpr={[1, 2]} // Handle high DPI screens
      gl={{ 
        antialias: false, // Handled by post-processing or default
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2
      }} 
    >
      <PerspectiveCamera makeDefault position={[0, 2, 25]} fov={45} />
      
      {/* Lighting Setup */}
      <ambientLight intensity={0.2} color={THEME.emerald} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        color={THEME.warmWhite} 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={1} color={THEME.gold} />
      
      {/* Dynamic Lighting from within the tree */}
      <pointLight position={[0, 0, 0]} intensity={1.5} distance={10} color={THEME.emerald} />

      {/* Environment */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" background={false} />

      <SceneContent appState={appState} />

      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 1.8}
        maxDistance={40}
        minDistance={10}
        autoRotate={false} 
      />

      {/* Post Processing for the "Glamour" look */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={1.1} // Only very bright things glow
            mipmapBlur 
            intensity={1.5} 
            radius={0.7}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <Noise opacity={0.02} />
      </EffectComposer>
    </Canvas>
  );
};

export default Experience;
