import React from 'react';
import { AppState } from '../types';

interface OverlayProps {
  appState: AppState;
  setAppState: (state: AppState) => void;
}

const Overlay: React.FC<OverlayProps> = ({ appState, setAppState }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      <header className="flex flex-col items-center animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-serif text-yellow-500 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] text-center">
          Arix Signature
        </h1>
        <p className="text-emerald-200/80 text-sm md:text-base mt-2 tracking-[0.3em] uppercase">
          Interactive Holiday Experience
        </p>
      </header>

      <div className="flex justify-center pointer-events-auto pb-10">
        <button
          onClick={() =>
            setAppState(
              appState === AppState.SCATTERED
                ? AppState.TREE_SHAPE
                : AppState.SCATTERED
            )
          }
          className={`
            relative px-8 py-3 rounded-full text-sm font-bold tracking-widest transition-all duration-700
            border border-yellow-500/50 backdrop-blur-md overflow-hidden group
            ${appState === AppState.TREE_SHAPE ? 'bg-yellow-500/10' : 'bg-emerald-900/20'}
            hover:bg-yellow-500/20 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(255,215,0,0.4)]
          `}
        >
          <span className="relative z-10 text-yellow-100 group-hover:text-white transition-colors">
            {appState === AppState.SCATTERED ? 'ASSEMBLE TREE' : 'SCATTER MAGIC'}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </div>

      <div className="absolute bottom-8 right-8 text-right hidden md:block">
        <div className="text-xs text-emerald-400/40 uppercase tracking-widest">
           System Status: <span className="text-yellow-500">{appState.replace('_', ' ')}</span>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
