import React, { useState } from 'react';
import { Page, User, UserRole, Article, CoralImage } from './types';
import { MOCK_ARTICLES, MOCK_GALLERY } from './constants';
import { HomeView } from './components/views/HomeView';
import { FundraiserView } from './components/views/FundraiserView';
import { AwarenessView } from './components/views/AwarenessView';
import { GalleryView } from './components/views/GalleryView';
import { LoginView } from './components/views/LoginView';
import { ProfileView } from './components/views/ProfileView';
import { Layout } from './components/Layout';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [user, setUser] = useState<User | null>(null);
  
  // App State
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [galleryImages, setGalleryImages] = useState<CoralImage[]>(MOCK_GALLERY);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setCurrentPage(Page.HOME);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage(Page.HOME);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME:
        return <HomeView onNavigate={setCurrentPage} />;
      case Page.FUNDRAISER:
        return <FundraiserView user={user} onNavigateLogin={() => setCurrentPage(Page.LOGIN)} />;
      case Page.AWARENESS:
        return <AwarenessView user={user} articles={articles} setArticles={setArticles} />;
      case Page.GALLERY:
        return <GalleryView user={user} images={galleryImages} setImages={setGalleryImages} />;
      case Page.LOGIN:
        return <LoginView onLogin={handleLogin} />;
      case Page.PROFILE:
        return user ? <ProfileView user={user} /> : <LoginView onLogin={handleLogin} />;
      default:
        return <HomeView onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Layout 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        user={user} 
        onLogout={handleLogout}
      >
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {renderPage()}
        </main>
      </Layout>
    </div>
  );
};

export default App;