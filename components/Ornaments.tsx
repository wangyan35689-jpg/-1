import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AppState, THEME } from '../types';
import { getRandomSpherePoint, getTreePoint } from '../utils/math';

interface OrnamentsProps {
  appState: AppState;
  type: 'BAUBLE' | 'GIFT' | 'LIGHT';
  count: number;
  color: string;
}

const Ornaments: React.FC<OrnamentsProps> = ({ appState, type, count, color }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  
  // Data for each instance
  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      const scatter = getRandomSpherePoint(18); // Wider scatter for ornaments
      const tree = getTreePoint(12, 5.2); // Slightly outside foliage
      
      // Ensure lights are slightly embedded, baubles on tips
      if (type === 'LIGHT') {
         tree.multiplyScalar(0.9);
      } else {
         tree.multiplyScalar(1.05); 
      }

      return {
        scatterPos: scatter,
        treePos: tree,
        scale: Math.random() * 0.5 + 0.5,
        rotationSpeed: Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
      };
    });
  }, [count, type]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const isTree = appState === AppState.TREE_SHAPE;
    
    // We maintain a "current progress" ref indirectly by checking frame interpolation
    // But since we need per-instance calculation in JS (InstancedMesh limitation without custom shader),
    // we calculate position based on a lerp factor derived from state.
    
    // For simpler transition logic in JS:
    // We use a global lerp value `morphRef` stored on the mesh userdata or similar, 
    // but here let's calculate a "t" based on state change for simplicity.
    // In a prod app, use `maath` or `spring` for the value `t`. 
    // Here we approximate `t` based on a quick accumulation.
    
    // Hack: Store 't' on the mesh to persist between frames
    if (meshRef.current.userData.t === undefined) meshRef.current.userData.t = 0;
    
    const targetT = isTree ? 1 : 0;
    const step = delta * 1.0; // Transition speed
    
    if (meshRef.current.userData.t < targetT) {
        meshRef.current.userData.t = Math.min(targetT, meshRef.current.userData.t + step);
    } else if (meshRef.current.userData.t > targetT) {
        meshRef.current.userData.t = Math.max(targetT, meshRef.current.userData.t - step);
    }
    
    const t = meshRef.current.userData.t;
    // Ease function
    const easedT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    data.forEach((d, i) => {
      // Position Interpolation
      tempObject.position.lerpVectors(d.scatterPos, d.treePos, easedT);

      // Add "Floating" animation
      const floatY = Math.sin(time + d.phase) * (isTree ? 0.05 : 0.5); // Float less when in tree form
      const floatX = Math.cos(time * 0.5 + d.phase) * (isTree ? 0.02 : 0.3);
      
      tempObject.position.y += floatY;
      tempObject.position.x += floatX;

      // Rotation
      tempObject.rotation.x = time * d.rotationSpeed;
      tempObject.rotation.y = time * d.rotationSpeed;
      tempObject.rotation.z = time * d.rotationSpeed;

      // Scale (Gift boxes pop in, lights flicker)
      let scale = d.scale;
      if (type === 'LIGHT') {
          // Flicker effect
          scale = d.scale * (0.8 + 0.4 * Math.sin(time * 10 + d.phase));
      }
      tempObject.scale.setScalar(scale);

      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Geometry & Material Selection
  let geometry: THREE.BufferGeometry;
  let material: THREE.Material;

  if (type === 'BAUBLE') {
    geometry = new THREE.SphereGeometry(0.25, 16, 16);
    material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1,
    });
  } else if (type === 'GIFT') {
    geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.3,
      roughness: 0.6,
    });
  } else {
    // LIGHT
    geometry = new THREE.SphereGeometry(0.08, 8, 8);
    material = new THREE.MeshBasicMaterial({
      color: color,
      toneMapped: false, // Important for Bloom
    });
  }

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow
      receiveShadow
    />
  );
};

export default Ornaments;
