import React, { useState, useEffect } from 'react';
import { Page, User, CoralImage, Article } from './types';
import { MOCK_GALLERY } from './constants';
import { loadUser, saveUser, loadGallery, saveGallery } from './utils/storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './utils/firebase';
import { HomeView } from './components/views/HomeView';
import { FundraiserView } from './components/views/FundraiserView';
import { AwarenessView } from './components/views/AwarenessView';
import { EventsView } from './components/views/EventsView';
import { GalleryView } from './components/views/GalleryView';
import { LoginView } from './components/views/LoginView';
import { ProfileView } from './components/views/ProfileView';
import { Layout } from './components/Layout';
import { NotificationPrompt } from './components/NotificationPrompt';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const path = window.location.pathname;
    if (path !== '/' && path !== '/index.html') {
      return Page.NOT_FOUND;
    }
    return Page.HOME;
  });
  const [user, setUser] = useState<User | null>(loadUser);
  const [isNotificationPromptOpen, setIsNotificationPromptOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // App State
  const [articles, setArticles] = useState<Article[]>([]);
  const [galleryImages, setGalleryImages] = useState<CoralImage[]>(MOCK_GALLERY);
  const [isGalleryLoaded, setIsGalleryLoaded] = useState(false);

  useEffect(() => {
    saveUser(user);
    if (user) {
      const hasHandled = localStorage.getItem('hasHandledNotifications');
      if (!hasHandled) {
        // Small delay to let the UI settle/transition
        setTimeout(() => setIsNotificationPromptOpen(true), 1000);
      }
    }
  }, [user]);

  useEffect(() => {
    const syncUserRole = async () => {
      if (user?.id) {
        try {
          const userRef = doc(db, 'users', user.id);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.role && data.role !== user.role) {
              setUser(prev => prev ? { ...prev, role: data.role } : null);
            }
          }
        } catch (error) {
          console.error("Failed to sync user role from Firestore", error);
        }
      }
    };
    syncUserRole();
  }, []);

  useEffect(() => {
    if (!isGalleryLoaded) return;
    const timeoutId = setTimeout(() => {
      saveGallery(galleryImages);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [galleryImages, isGalleryLoaded]);

  useEffect(() => {
    const load = async () => {
      const data = await loadGallery();
      setGalleryImages(data);
      setIsGalleryLoaded(true);
    };
    load();
  }, []);

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
        return <AwarenessView user={user} theme={theme} articles={articles} setArticles={setArticles} />;
      case Page.EVENTS:
        return <EventsView user={user} onNavigateLogin={() => handleNavigate(Page.LOGIN)} theme={theme} />;
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
        <NotificationPrompt
          isOpen={isNotificationPromptOpen}
          onClose={() => setIsNotificationPromptOpen(false)}
          userEmail={user.email}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default App;