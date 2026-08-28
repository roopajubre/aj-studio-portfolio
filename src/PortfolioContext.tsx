import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ProjectData,
  PortfolioProfile,
  VisualWorkItem,
  PinterestStrategyData,
  INITIAL_PROJECTS,
  INITIAL_PROFILE,
  INITIAL_VISUAL_WORK,
  PINTEREST_STRATEGY_DATA
} from '../data/portfolioData';
import {
  persistMediaFile,
  persistMediaUrl,
  loadAllPersistedMedia,
  removePersistedMedia,
  clearAllPersistedMedia
} from '../utils/mediaStorage';

interface MediaSlotRecord {
  [slotId: string]: string; // stores either objectUrl or base64 or external url
}

export type PageRoute = 'home' | 'about' | 'work' | 'visual' | 'strategy' | 'contact';

interface PortfolioContextType {
  profile: PortfolioProfile;
  projects: ProjectData[];
  visualWorkItems: VisualWorkItem[];
  pinterestStrategy: PinterestStrategyData;
  mediaMap: MediaSlotRecord;
  activeProjectTab: string;
  setActiveProjectTab: (id: string) => void;
  currentPage: PageRoute;
  setCurrentPage: (page: PageRoute) => void;
  updateProfile: (newProfile: Partial<PortfolioProfile>) => void;
  uploadMediaFile: (slotId: string, file: File | Blob, originalName?: string) => Promise<string>;
  updateMediaSlot: (slotId: string, url: string) => void;
  clearMediaSlot: (slotId: string) => void;
  resetAllMedia: () => void;
  isMediaManagerOpen: boolean;
  setIsMediaManagerOpen: (open: boolean) => void;
  isResumeOpen: boolean;
  setIsResumeOpen: (open: boolean) => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  selectedLightboxImage: { url?: string; title: string; caption: string; promptNote?: string } | null;
  setSelectedLightboxImage: (img: { url?: string; title: string; caption: string; promptNote?: string } | null) => void;
  navigateToProject: (projectId: string) => void;
  isStorageReady: boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const STORAGE_KEY_PROFILE = 'jubre_portfolio_profile_v2';

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PortfolioProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE) || localStorage.getItem('jubre_portfolio_profile_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasPlaceholderEdu = !parsed.education || parsed.education.some((e: any) => e.institution?.includes('[') || e.degree?.includes('['));
        const hasOldTools = !parsed.tools || !parsed.tools.some((t: any) => t.name === 'Gemini' || t.name === 'Kling AI');
        return {
          ...INITIAL_PROFILE,
          ...parsed,
          education: hasPlaceholderEdu ? INITIAL_PROFILE.education : parsed.education,
          tools: hasOldTools ? INITIAL_PROFILE.tools : parsed.tools
        };
      }
      return INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const [projects] = useState<ProjectData[]>(INITIAL_PROJECTS);
  const [visualWorkItems] = useState<VisualWorkItem[]>(INITIAL_VISUAL_WORK);
  const [pinterestStrategy] = useState<PinterestStrategyData>(PINTEREST_STRATEGY_DATA);
  const [activeProjectTab, setActiveProjectTab] = useState<string>('project-01');
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<{
    url?: string;
    title: string;
    caption: string;
    promptNote?: string;
  } | null>(null);

  const [mediaMap, setMediaMap] = useState<MediaSlotRecord>({});

  // Restore persisted media files from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;
    loadAllPersistedMedia().then(persisted => {
      if (isMounted) {
        setMediaMap(persisted);
        setIsStorageReady(true);
      }
    }).catch(err => {
      console.warn('Storage initial load error:', err);
      if (isMounted) setIsStorageReady(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Save profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  const updateProfile = (newProfile: Partial<PortfolioProfile>) => {
    setProfile(prev => ({ ...prev, ...newProfile }));
  };

  /**
   * Upload binary file and persist in IndexedDB
   */
  const uploadMediaFile = async (slotId: string, file: File | Blob, originalName?: string): Promise<string> => {
    const liveUrl = await persistMediaFile(slotId, file, originalName);
    setMediaMap(prev => ({
      ...prev,
      [slotId]: liveUrl
    }));
    return liveUrl;
  };

  /**
   * Update with URL or direct link
   */
  const updateMediaSlot = (slotId: string, url: string) => {
    persistMediaUrl(slotId, url);
    setMediaMap(prev => ({
      ...prev,
      [slotId]: url
    }));
  };

  /**
   * Clear media from slot and IndexedDB
   */
  const clearMediaSlot = (slotId: string) => {
    removePersistedMedia(slotId);
    setMediaMap(prev => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  };

  /**
   * Reset all stored media
   */
  const resetAllMedia = () => {
    clearAllPersistedMedia();
    setMediaMap({});
  };

  const navigateToProject = (projectId: string) => {
    setActiveProjectTab(projectId);
    setCurrentPage('work');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PortfolioContext.Provider
      value={{
        profile,
        projects,
        visualWorkItems,
        pinterestStrategy,
        mediaMap,
        activeProjectTab,
        setActiveProjectTab,
        currentPage,
        setCurrentPage,
        updateProfile,
        uploadMediaFile,
        updateMediaSlot,
        clearMediaSlot,
        resetAllMedia,
        isMediaManagerOpen,
        setIsMediaManagerOpen,
        isResumeOpen,
        setIsResumeOpen,
        isEditProfileOpen,
        setIsEditProfileOpen,
        selectedLightboxImage,
        setSelectedLightboxImage,
        navigateToProject,
        isStorageReady
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

