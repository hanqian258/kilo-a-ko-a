import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Page, User, Article, UserRole } from './types';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './utils/firebase';
import { Layout } from './components/Layout';
import { NotificationPrompt } from './components/NotificationPrompt';
import { LoadingView } from './components/LoadingView';

// Lazy load views to improve performance
const HomeView = lazy(() => import('./components/views/HomeView').then(module => ({ default: module.HomeView })));
const FundraiserView = lazy(() => import('./components/views/FundraiserView').then(module => ({ default: module.FundraiserView })));
const AwarenessView = lazy(() => import('./components/views/AwarenessView').then(module => ({ default: module.AwarenessView })));
const EventsView = lazy(() => import('./components/views/EventsView').then(module => ({ default: module.EventsView })));
const GalleryView = lazy(() => import('./components/views/GalleryView').then(module => ({ default: module.GalleryView })));
const LoginView = lazy(() => import('./components/views/LoginView').then(module => ({ default: module.LoginView })));
const ProfileView = lazy(() => import('./components/views/ProfileView').then(module => ({ default: module.ProfileView })));

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const path = window.location.pathname;
    if (path !== '/' && path !== '/index.html') {
      return Page.NOT_FOUND;
    }
    return Page.HOME;
  });
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isNotificationPromptOpen, setIsNotificationPromptOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // App State
  const [articles, setArticles] = useState<Article[]>([]);

  // Firebase Auth is the single source of truth for the logged-in user.
  // This fixes the race condition where localStorage had a user but auth.currentUser
  // was still null, causing Storage uploads to fail with permission errors.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Start with Auth data so login never gets blocked by Firestore issues.
        let appUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: UserRole.DONOR,
          avatarUrl: firebaseUser.photoURL || undefined,
        };

        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            appUser = {
              ...appUser,
              name: data.name || appUser.name,
              email: data.email || appUser.email,
              role: data.role || UserRole.DONOR,
              avatarUrl: firebaseUser.photoURL || data.avatarUrl || undefined,
              attendedEvents: data.attendedEvents,
              readArticles: data.readArticles,
              badges: data.badges,
            };
          } else {
            await setDoc(userRef, appUser, { merge: true });
          }
        } catch (firestoreErr) {
          console.warn("Firestore profile fetch failed, using Auth data only:", firestoreErr);
        }

        setUser(appUser);
        const hasHandled = localStorage.getItem('hasHandledNotifications');
        if (!hasHandled) {
          setTimeout(() => setIsNotificationPromptOpen(true), 1000);
        }
      } else {
        setUser(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Keep user in sync with real-time Firestore updates (e.g. role changes by admin)
  useEffect(() => {
    if (!user?.id) return;

    const userRef = doc(db, 'users', user.id);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const remoteData = snapshot.data() as Partial<User>;
        setUser(prev => {
          if (!prev) return null;
          const merged = { ...prev, ...remoteData };
          if (JSON.stringify(prev) !== JSON.stringify(merged)) {
            return merged;
          }
          return prev;
        });
      } else {
        setDoc(userRef, user, { merge: true });
      }
    });

    return () => unsubscribe();
  }, [user?.id]);


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

  const handleLogout = async () => {
    await signOut(auth);
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

  if (isAuthLoading) {
    return <LoadingView theme={theme} />;
  }

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
          <Suspense fallback={<LoadingView theme={theme} />}>
            {renderPage()}
          </Suspense>
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