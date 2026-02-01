import React, { useState, useEffect } from 'react';
import { Page, User, Article } from './types';
import { loadUser, saveUser } from './utils/storage';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './utils/firebase';
import { Layout } from './components/Layout';
import { NotificationPrompt } from './components/NotificationPrompt';

// Lazy load views
const HomeView = React.lazy(() => import('./components/views/HomeView').then(module => ({ default: module.HomeView })));
const FundraiserView = React.lazy(() => import('./components/views/FundraiserView').then(module => ({ default: module.FundraiserView })));
const AwarenessView = React.lazy(() => import('./components/views/AwarenessView').then(module => ({ default: module.AwarenessView })));
const EventsView = React.lazy(() => import('./components/views/EventsView').then(module => ({ default: module.EventsView })));
const GalleryView = React.lazy(() => import('./components/views/GalleryView').then(module => ({ default: module.GalleryView })));
const LoginView = React.lazy(() => import('./components/views/LoginView').then(module => ({ default: module.LoginView })));
const ProfileView = React.lazy(() => import('./components/views/ProfileView').then(module => ({ default: module.ProfileView })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
  </div>
);

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

  // Firestore Sync for User
  useEffect(() => {
    if (!user?.id) return;

    const userRef = doc(db, 'users', user.id);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const remoteData = snapshot.data() as Partial<User>;
        setUser(prev => {
          if (!prev) return null;
          // Merge remote data (handling attendedEvents updates from Admin)
          // Avoid update if data is identical to prevent cycles
          const merged = { ...prev, ...remoteData };
          if (JSON.stringify(prev) !== JSON.stringify(merged)) {
            return merged;
          }
          return prev;
        });
      } else {
        // Create user doc if it doesn't exist
        setDoc(userRef, user, { merge: true });
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

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

  const handleUpdateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    if (updatedUser.id) {
      try {
        await setDoc(doc(db, 'users', updatedUser.id), updatedUser, { merge: true });
      } catch (e) {
        console.error("Failed to sync user update to Firestore", e);
      }
    }
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
        return <GalleryView user={user} theme={theme} />;
      case Page.LOGIN:
        return <LoginView onLogin={handleLogin} theme={theme} />;
      case Page.PROFILE:
        return user ? <ProfileView user={user} onUpdateUser={handleUpdateUser} theme={theme} /> : <LoginView onLogin={handleLogin} theme={theme} />;
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
          <React.Suspense fallback={<LoadingFallback />}>
            {renderPage()}
          </React.Suspense>
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