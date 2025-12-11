import * as THREE from 'three';

export enum AppState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface ParticleData {
  initialPos: THREE.Vector3; // Scatter position
  targetPos: THREE.Vector3;  // Tree position
  color: THREE.Color;
  size: number;
  speed: number;
}

export const THEME = {
  emerald: '#004225',
  deepEmerald: '#01200F',
  gold: '#D4AF37',
  brightGold: '#FFD700',
  warmWhite: '#FFFDD0',
  accentRed: '#8B0000',
};