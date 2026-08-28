/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { WorkPage } from './pages/WorkPage';
import { VisualMediaPage } from './pages/VisualMediaPage';
import { ContentStrategyPage } from './pages/ContentStrategyPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ResumeModal } from './components/ResumeModal';
import { LightboxModal } from './components/LightboxModal';
import { MediaManagerDrawer } from './components/MediaManagerDrawer';
import { EditProfileModal } from './components/EditProfileModal';
import { Layers, Film, Sparkles } from 'lucide-react';

const MainPortfolioApp: React.FC = () => {
  const { currentPage, setIsMediaManagerOpen, mediaMap } = usePortfolio();

  const uploadedCount = Object.keys(mediaMap).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#111318] text-[#F2EDE3] selection:bg-[#3D5AFE] selection:text-[#F2EDE3] font-sans">
      
      {/* Top Sticky Minimal Editorial Navigation */}
      <Navigation />

      {/* Main Page Content Router */}
      <main className="flex-1">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'work' && <WorkPage />}
        {currentPage === 'visual' && <VisualMediaPage />}
        {currentPage === 'strategy' && <ContentStrategyPage />}
        {currentPage === 'contact' && <ContactPage />}
      </main>

      {/* Editorial Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <ResumeModal />
      <LightboxModal />
      <MediaManagerDrawer />
      <EditProfileModal />

      {/* Floating Quick Media Hub Trigger (Subtle, sleek, non-intrusive) */}
      <div className="fixed bottom-6 right-6 z-30 no-print">
        <button
          onClick={() => setIsMediaManagerOpen(true)}
          className="group px-4 py-2.5 bg-[#161922] hover:bg-[#1C202B] text-[#F2EDE3] shadow-2xl border border-[#232733] hover:border-[#3D5AFE]/50 flex items-center space-x-2.5 font-mono text-xs uppercase tracking-wider transition-all duration-300 transform hover:scale-105 cursor-pointer backdrop-blur-md"
          title="Upload or manage your AI media assets, videos, and visual exploration artwork"
        >
          <div className="relative">
            <Layers className="w-4 h-4 text-[#3D5AFE]" />
            {uploadedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D89B55]" />
            )}
          </div>
          <span className="font-medium text-[#F2EDE3]">Media Hub</span>
          <span className="px-1.5 py-0.2 bg-[#232733] text-[10px] text-[#A8A9AD]">
            {uploadedCount} Uploaded
          </span>
        </button>
      </div>

    </div>
  );
};

export default function App() {
  return (
    <PortfolioProvider>
      <MainPortfolioApp />
    </PortfolioProvider>
  );
}
