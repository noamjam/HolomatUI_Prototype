import React, { useState, useEffect } from 'react';
import PaintView from './components/PaintView';
import FileView from './components/FileView';
import SettingsView from './components/SettingsView';
import AppCarousel from './components/AppCarousel';
import ByteIndicator from './components/ByteIndicator';
import useByteStatus from './components/useByteStatus';
import ThreeViewer from './components/ThreeViewer';
import BootScreen from './components/BootScreen';

function App() {
  const [bootDone, setBootDone] = useState(false);
  const [currentApp, setCurrentApp] = useState(null);
  const isActive = useByteStatus();
  const [theme, setTheme] = useState('default');


  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'default';
    setTheme(saved);
  }, []);

  const getBgGradient = () => {
    switch (theme) {
      case 'red':
        return 'from-black via-gray-900 to-gray-800';
      case 'yellow':
        return 'from-black via-gray-900 to-yellow-800';
      case 'green':
        return 'from-black via-gray-900 to-green-900';
      default:
        return 'from-gray-900 via-gray-800 to-black';
    }
  };

  const getAccentColor = () => {
    switch (theme) {
      case 'red':
        return 'red-400';
      case 'yellow':
        return 'yellow-400';
      case 'green':
        return 'green-400';
      default:
        return 'cyan-400';
    }
  };

  if (!bootDone) {
        return <BootScreen onFinish={() => setBootDone(true)} />;
    }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBgGradient()} text-white font-orbitron relative overflow-hidden`}>
      {/* Anwendungen */}
      {currentApp === 'Paint' && <PaintView onBack={() => setCurrentApp(null)} />}
      {currentApp === 'Files' && <FileView onBack={() => setCurrentApp(null)} />}
      {currentApp === 'Settings' && <SettingsView onBack={() => setCurrentApp(null)} />}
      {currentApp === '3D Viewer' && <ThreeViewer onBack={() => setCurrentApp(null)} />}


      {/* Startansicht */}
      {currentApp === null && (
        <div className="p-8">
          <h1 className={`text-4xl text-${getAccentColor()} font-bold mb-12 text-center drop-shadow-[0_0_8px_cyan]`}>
            Welcome to your futuristic workbench
          </h1>
          <AppCarousel onSelect={(app) => setCurrentApp(app)} />
        </div>
      )}

      {/* Byte-Indikator bleibt immer sichtbar */}
      <ByteIndicator isActive={isActive} />
    </div>
  );
}

export default App;
