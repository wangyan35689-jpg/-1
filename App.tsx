import React, { useState } from 'react';
import Experience from './components/Experience';
import Overlay from './components/Overlay';
import { AppState } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.TREE_SHAPE);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* The 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Experience appState={appState} />
      </div>

      {/* The UI Overlay */}
      <Overlay appState={appState} setAppState={setAppState} />
      
      {/* Background Gradient to ensure no harsh black edges if canvas loads slow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-[#001005] to-black" />
    </div>
  );
}

export default App;
