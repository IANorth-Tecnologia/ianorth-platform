
import React from 'react';
import { ThemeProvider, ThemeToggle } from './components/ThemeProvider';
import { AnalysisPanel } from './components/AnalysisPanel';
import { VideoFeed } from './components/VideoFeed';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="bg-gray-50 dark:bg-background-primary dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] min-h-screen text-gray-900 dark:text-text-primary p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
        
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <img src="/icon.png" alt="IA North Logo" className="h-10 w-10 mr-4"/>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary">
                IA North
              </h1>
              <p className="text-sm text-gray-600 dark:text-text-secondary">Dashboard de Análise de Vergalhões</p>
            </div>
          </div>
          
          {/* Theme toggle button */}
          <ThemeToggle />
        </header>

      <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <VideoFeed />
        </div>
        <div className="lg:col-span-2">
          <AnalysisPanel />
        </div>
      </main>

        <footer className="text-center mt-8 text-gray-500 dark:text-text-tertiary text-sm">
          <p>© 2024 IANorth Tecnologia. Todos os direitos reservados.</p>
        </footer>
      </div>
    </ThemeProvider>
  );
};

