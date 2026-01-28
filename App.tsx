import React, { useState, useEffect } from 'react';
import { Page, User, Article, CoralImage } from './types';
import { MOCK_GALLERY } from './constants';
import { loadUser, saveUser, loadArticles, saveArticles, loadGallery, saveGallery } from './utils/storage';
import { HomeView } from './components/views/HomeView';
import { FundraiserView } from './components/views/FundraiserView';
import { AwarenessView } from './components/views/AwarenessView';
import { GalleryView } from './components/views/GalleryView';
import { LoginView } from './components/views/LoginView';
import { ProfileView } from './components/views/ProfileView';
import { Layout } from './components/Layout';
import { SubscriptionModal } from './components/SubscriptionModal';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [user, setUser] = useState<User | null>(loadUser);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // App State
  const [articles, setArticles] = useState<Article[]>(loadArticles);
  const [galleryImages, setGalleryImages] = useState<CoralImage[]>(MOCK_GALLERY);
  const [isGalleryLoaded, setIsGalleryLoaded] = useState(false);

  useEffect(() => {
    saveUser(user);
  }, [user]);

  useEffect(() => {
    saveArticles(articles);
  }, [articles]);

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

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setCurrentPage(Page.HOME);
    setTimeout(() => {
      setIsSubscriptionModalOpen(true);
    }, 1000);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage(Page.HOME);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME:
        return <HomeView onNavigate={setCurrentPage} theme={theme} user={user} />;
      case Page.FUNDRAISER:
        return <FundraiserView user={user} onNavigateLogin={() => setCurrentPage(Page.LOGIN)} theme={theme} />;
      case Page.AWARENESS:
        return <AwarenessView user={user} articles={articles} setArticles={setArticles} theme={theme} />;
      case Page.GALLERY:
        return <GalleryView user={user} images={galleryImages} setImages={setGalleryImages} theme={theme} />;
      case Page.LOGIN:
        return <LoginView onLogin={handleLogin} theme={theme} />;
      case Page.PROFILE:
        return user ? <ProfileView user={user} onUpdateUser={setUser} theme={theme} /> : <LoginView onLogin={handleLogin} theme={theme} />;
      default:
        return <HomeView onNavigate={setCurrentPage} theme={theme} user={user} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-teal-500/30 ${
      theme === 'dark' ? 'bg-[#05080a] text-slate-300' : 'bg-slate-50 text-slate-900'
    }`}>
      <Layout 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
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