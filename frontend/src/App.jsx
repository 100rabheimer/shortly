import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Splash from './components/Splash';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Stats from './pages/Stats';

const SPLASH_KEY = 'shortly_splash_seen';

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return !window.sessionStorage.getItem(SPLASH_KEY);
  });

  useEffect(() => {
    if (!showSplash && typeof window !== 'undefined') {
      window.sessionStorage.setItem(SPLASH_KEY, 'true');
    }
  }, [showSplash]);

  const handleDismiss = useCallback(() => setShowSplash(false), []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stats/:code" element={<Stats />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>

        {showSplash && <Splash visible={showSplash} onDismiss={handleDismiss} />}
      </div>
    </BrowserRouter>
  );
}

export default App;