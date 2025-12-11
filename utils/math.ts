import * as THREE from 'three';

/**
 * Generates a random point inside a sphere
 */
export const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

/**
 * Generates a point on a cone surface (Christmas Tree shape)
 * @param height Total height of the tree
 * @param radius Base radius of the tree
 * @param yBias How much to cluster points towards the bottom (0-1)
 */
export const getTreePoint = (height: number, radius: number): THREE.Vector3 => {
  // Normalized height (0 at bottom, 1 at top)
  // We use a power curve to distribute more foliage at the bottom
  const h = Math.pow(Math.random(), 0.8); 
  const y = (1 - h) * height - (height / 2); // Center vertically
  
  // Radius at this height
  const currentRadius = h * radius;
  
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * currentRadius; // Uniform distribution in circle
  
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;
  
  return new THREE.Vector3(x, y, z);
};

export const getSpiralTreePoint = (height: number, radius: number, index: number, total: number): THREE.Vector3 => {
    const y = (index / total) * height - (height / 2);
    const progress = 1 - (index / total); // 1 at bottom, 0 at top
    const currentRadius = progress * radius;
    const angle = index * 0.5; // Spiral
    const x = Math.cos(angle) * currentRadius;
    const z = Math.sin(angle) * currentRadius;
    return new THREE.Vector3(x, y, z);
};
