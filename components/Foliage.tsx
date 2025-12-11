import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AppState, THEME } from '../types';
import { getRandomSpherePoint, getTreePoint } from '../utils/math';

// Custom Shader Material for high-performance morphing
const FoliageMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uMorphFactor: { value: 0 }, // 0 = Scattered, 1 = Tree
    uColorBase: { value: new THREE.Color(THEME.emerald) },
    uColorTip: { value: new THREE.Color(THEME.brightGold) },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uMorphFactor;
    
    attribute vec3 aScatterPos;
    attribute vec3 aTreePos;
    attribute float aRandom;
    attribute float aSize;
    
    varying float vAlpha;
    varying vec3 vColor;

    // Cubic easing for smooth movement
    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      // Morph logic
      float t = easeInOutCubic(uMorphFactor);
      
      // Add some noise based on time and randomness
      vec3 noise = vec3(
        sin(uTime * 2.0 + aRandom * 10.0),
        cos(uTime * 1.5 + aRandom * 20.0),
        sin(uTime * 1.8 + aRandom * 5.0)
      ) * 0.2;

      // When scattered (morph=0), movement is chaotic. When tree (morph=1), movement is subtle (breathing).
      float movementScale = mix(1.0, 0.1, t); 
      
      vec3 currentPos = mix(aScatterPos, aTreePos, t);
      currentPos += noise * movementScale;

      vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
      
      // Size attenuation
      gl_PointSize = aSize * (300.0 / -mvPosition.z);
      
      // Pass transparency based on depth to create volume
      vAlpha = 0.6 + 0.4 * sin(uTime + aRandom * 10.0);
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColorBase;
    uniform vec3 uColorTip;
    
    varying float vAlpha;

    void main() {
      // Circular particle
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;
      
      // Soft Glow gradient
      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 1.5);

      // Mix colors for a magical look
      vec3 finalColor = mix(uColorBase, uColorTip, strength * 0.5);
      
      gl_FragColor = vec4(finalColor, strength * vAlpha);
    }
  `
};

interface FoliageProps {
  appState: AppState;
  count?: number;
}

const Foliage: React.FC<FoliageProps> = ({ appState, count = 8000 }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  // Generate geometry data once
  const { positions, scatterPos, treePos, randoms, sizes } = useMemo(() => {
    const p = new Float32Array(count * 3); // Current positions (dummy)
    const sp = new Float32Array(count * 3); // Scatter target
    const tp = new Float32Array(count * 3); // Tree target
    const r = new Float32Array(count);
    const s = new Float32Array(count);

    const TREE_HEIGHT = 12;
    const TREE_RADIUS = 5;
    const SCATTER_RADIUS = 15;

    for (let i = 0; i < count; i++) {
      const scatter = getRandomSpherePoint(SCATTER_RADIUS);
      const tree = getTreePoint(TREE_HEIGHT, TREE_RADIUS);

      sp[i * 3] = scatter.x;
      sp[i * 3 + 1] = scatter.y;
      sp[i * 3 + 2] = scatter.z;

      tp[i * 3] = tree.x;
      tp[i * 3 + 1] = tree.y;
      tp[i * 3 + 2] = tree.z;

      r[i] = Math.random();
      s[i] = Math.random() * 0.8 + 0.2; // Size variation
    }

    return { positions: p, scatterPos: sp, treePos: tp, randoms: r, sizes: s };
  }, [count]);

  useFrame((state, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smoothly interpolate the morph factor
      const targetMorph = appState === AppState.TREE_SHAPE ? 1.0 : 0.0;
      const currentMorph = shaderRef.current.uniforms.uMorphFactor.value;
      
      // Linear interpolation towards target (dampening)
      const step = delta * 1.5; // Speed of transition
      if (Math.abs(currentMorph - targetMorph) > 0.001) {
         if (currentMorph < targetMorph) {
            shaderRef.current.uniforms.uMorphFactor.value = Math.min(1, currentMorph + step);
         } else {
            shaderRef.current.uniforms.uMorphFactor.value = Math.max(0, currentMorph - step);
         }
      }
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions} // Initial dummy positions, shader uses attributes below
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPos.length / 3}
          array={scatterPos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={treePos.length / 3}
          array={treePos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        args={[FoliageMaterial]}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;
