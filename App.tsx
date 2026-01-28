import React, { useState, useEffect } from 'react';
import { Page, User, CoralImage } from './types';
import { MOCK_GALLERY } from './constants';
import { loadUser, saveUser, loadGallery, saveGallery } from './utils/storage';
import { HomeView } from './components/views/HomeView';
import { FundraiserView } from './components/views/FundraiserView';
import { AwarenessView } from './components/views/AwarenessView';
import { GalleryView } from './components/views/GalleryView';
import { LoginView } from './components/views/LoginView';
import { ProfileView } from './components/views/ProfileView';
import { Layout } from './components/Layout';
import { SubscriptionModal } from './components/SubscriptionModal';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const path = window.location.pathname;
    if (path !== '/' && path !== '/index.html') {
      return Page.NOT_FOUND;
    }
    return Page.HOME;
  });
  const [user, setUser] = useState<User | null>(loadUser);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // App State
  const [galleryImages, setGalleryImages] = useState<CoralImage[]>(MOCK_GALLERY);
  const [isGalleryLoaded, setIsGalleryLoaded] = useState(false);

  useEffect(() => {
    saveUser(user);
  }, [user]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveGallery(galleryImages);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [galleryImages]);

  useEffect(() => {
    const load = async () => {
      const data = await loadGallery();
      setGalleryImages(data);
      setIsGalleryLoaded(true);
    };
    load();
  }, []);

  useEffect(() => {
    if (isGalleryLoaded) {
      saveGallery(galleryImages);
    }
  }, [galleryImages, isGalleryLoaded]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    if (page === Page.HOME) {
      window.history.pushState({}, '', '/');
    }
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    handleNavigate(Page.HOME);
    setTimeout(() => {
      setIsSubscriptionModalOpen(true);
    }, 1000);
  };

  const handleLogout = () => {
    setUser(null);
    handleNavigate(Page.HOME);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME:
        return <HomeView onNavigate={handleNavigate} theme={theme} user={user} />;
      case Page.FUNDRAISER:
        return <FundraiserView user={user} onNavigateLogin={() => handleNavigate(Page.LOGIN)} theme={theme} />;
      case Page.AWARENESS:
        return <AwarenessView user={user} theme={theme} />;
      case Page.GALLERY:
        return <GalleryView user={user} images={galleryImages} setImages={setGalleryImages} theme={theme} />;
      case Page.LOGIN:
        return <LoginView onLogin={handleLogin} theme={theme} />;
      case Page.PROFILE:
        return user ? <ProfileView user={user} onUpdateUser={setUser} theme={theme} /> : <LoginView onLogin={handleLogin} theme={theme} />;
      case Page.NOT_FOUND:
        return (
           <div className="flex flex-col items-center justify-center py-20 text-center">
             <h2 className="text-4xl font-black italic font-serif mb-4">404 - Page Not Found</h2>
             <p className="text-lg mb-8 opacity-60">The page you are looking for does not exist.</p>
             <button
               onClick={() => handleNavigate(Page.HOME)}
               className="px-6 py-3 bg-teal-600 text-white rounded-full font-bold hover:bg-teal-500 transition-all shadow-xl"
             >
               Go Home
             </button>
           </div>
        );
      default:
        return <HomeView onNavigate={handleNavigate} theme={theme} user={user} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-teal-500/30 ${
      theme === 'dark' ? 'bg-[#05080a] text-slate-300' : 'bg-slate-50 text-slate-900'
    }`}>
      <Layout 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        user={user} 
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      >
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {renderPage()}
        </main>
      </Layout>

      {user && (
        <SubscriptionModal 
          isOpen={isSubscriptionModalOpen} 
          onClose={() => setIsSubscriptionModalOpen(false)} 
          userName={user.name} 
        />
      )}
    </div>
  );
};

export default App;