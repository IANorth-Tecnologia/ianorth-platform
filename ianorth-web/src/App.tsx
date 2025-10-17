
import React from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { DashboardPage } from './pages/DashboardPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="bg-gray-50 dark:bg-background-primary dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] min-h-screen text-gray-900 dark:text-text-primary font-sans transition-colors duration-300">

        <DashboardPage />

      </div>
    </ThemeProvider>
  );
};
