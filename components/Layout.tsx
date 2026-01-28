import React, { useState } from 'react';
import { Page, User } from '../types';
import { Menu, X, User as UserIcon, LogOut, ExternalLink, ClipboardCheck, Sun, Moon } from 'lucide-react';
import { InPersonSurvey } from './InPersonSurvey';
import { PrivacyModal } from './PrivacyModal';
import { YUMIN_LOGO_URL, YUMIN_EDU_URL, REEFTEACH_URL } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user: User | null;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentPage, 
  onNavigate, 
  user, 
  onLogout,
  theme,
  toggleTheme
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const navItems = [
    { page: Page.HOME, label: 'Home' },
    { page: Page.FUNDRAISER, label: 'Fundraiser' },
    { page: Page.AWARENESS, label: 'Awareness' },
    { page: Page.GALLERY, label: "Kilo a Ko'a" },
  ];

  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Event Banner */}
      <div className={`${isDark ? 'bg-teal-900/50 text-teal-200 border-white/5' : 'bg-teal-600 text-white border-transparent'} border-b py-2.5 px-4 text-center text-sm font-medium flex items-center justify-center gap-4 group cursor-pointer hover:opacity-90 transition-all backdrop-blur-md`} onClick={() => setIsSurveyOpen(true)}>
        <span className="hidden sm:inline">Visiting us at an event?</span>
        <span className="flex items-center gap-1.5 underline decoration-teal-300 underline-offset-2">
          <ClipboardCheck size={16} />
          Click here for our Anonymous Booth Survey
        </span>
      </div>

      {/* Navbar */}
      <nav className={`${isDark ? 'bg-[#05080a]/80 border-white/5' : 'bg-white/80 border-slate-200'} backdrop-blur-xl sticky top-0 z-50 border-b transition-colors duration-500`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo Area */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(Page.HOME)}>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border border-slate-200 shadow-xl shadow-teal-500/5">
                  <img 
                    src={YUMIN_LOGO_URL} 
                    alt="Yumin Edu" 
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-lg shadow-xl shadow-blue-500/5">
                  R
                </div>
              </div>
              
              <div className="hidden lg:block border-l border-slate-200 dark:border-white/10 pl-4 ml-1">
                <h1 className={`text-xl font-bold tracking-tight leading-none mb-1 font-serif italic ${isDark ? 'text-white' : 'text-slate-900'}`}>Kilo a Ko'a</h1>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Yumin Edu x ReefTeach</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={`text-sm font-bold tracking-tight transition-all hover:text-teal-500 ${
                    currentPage === item.page 
                      ? 'text-teal-500 border-b-2 border-teal-500 pb-1' 
                      : (isDark ? 'text-slate-400' : 'text-slate-600')
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="flex items-center gap-4 ml-4 border-l pl-4 border-slate-200 dark:border-white/10">
                <button 
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition-all ${isDark ? 'bg-white/5 text-teal-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {user ? (
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => onNavigate(Page.PROFILE)}
                      className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full transition-colors ${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'}`}
                    >
                      <UserIcon size={18} className="text-teal-500" />
                      <div className="flex flex-col items-start leading-none">
                        <span className="font-bold">{user.name}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">Profile</span>
                      </div>
                    </button>
                    <button onClick={onLogout} className="text-slate-500 hover:text-red-500 transition-colors p-1" title="Log Out">
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onNavigate(Page.LOGIN)}
                    className="px-6 py-2 bg-teal-600 text-white rounded-full text-sm font-bold hover:bg-teal-500 transition-all shadow-xl shadow-teal-500/20 active:scale-95"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className={`md:hidden p-2 rounded-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className={`md:hidden absolute w-full shadow-2xl z-50 transition-colors duration-500 ${isDark ? 'bg-[#0a0f14] border-t border-white/5' : 'bg-white border-t border-slate-200'}`}>
            <div className="px-4 py-6 flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => {
                    onNavigate(item.page);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left text-sm font-bold py-3 px-4 rounded-xl ${
                    currentPage === item.page ? 'bg-teal-600/10 text-teal-500' : (isDark ? 'text-slate-400' : 'text-slate-600')
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className={`border-t pt-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                 <button 
                    onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 text-sm font-bold px-4 py-3 w-full text-left ${isDark ? 'text-teal-400' : 'text-slate-600'}`}
                 >
                   {isDark ? <><Sun size={18} /> Light Mode</> : <><Moon size={18} /> Dark Mode</>}
                 </button>
                 {user ? (
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        onNavigate(Page.PROFILE);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 text-sm font-bold px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                    >
                      <UserIcon size={18} />
                      My Profile
                    </button>
                    <button 
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-left text-sm text-red-500 font-bold flex items-center gap-2 px-4 py-3"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onNavigate(Page.LOGIN);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-center px-4 py-4 bg-teal-600 text-white rounded-xl text-sm font-bold"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="flex-grow">
        {children}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsSurveyOpen(true)}
        className="fixed bottom-6 right-6 z-[60] bg-teal-600 text-white p-4 rounded-full shadow-2xl hover:bg-teal-500 hover:scale-110 transition-all flex items-center gap-2 border-2 border-white/10"
      >
        <ClipboardCheck size={24} />
        <span className="hidden lg:inline font-black uppercase text-xs tracking-widest">Booth Survey</span>
      </button>

      <InPersonSurvey isOpen={isSurveyOpen} onClose={() => setIsSurveyOpen(false)} />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* Footer */}
      <footer className={`${isDark ? 'bg-black border-white/5 text-slate-500' : 'bg-slate-900 border-transparent text-slate-400'} py-16 border-t transition-colors duration-500`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-12">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-xl">
                  <img src={YUMIN_LOGO_URL} alt="Yumin Edu" className="w-full h-full object-contain p-1" />
                </div>
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl">
                  R
                </div>
              </div>
              <p className="text-sm leading-relaxed font-medium">
                <strong>Yumin Edu</strong>: A student-founded nonprofit fostering Cultural Connection, Environmental Awareness, STEM, and Critical Thinking.
                <br/><br/>
                <strong>ReefTeach</strong>: Increasing natural resilience by mitigating local stressors using community monitoring.
              </p>
            </div>
            <div>
              <h3 className="text-white font-black uppercase tracking-widest text-xs mb-6">Quick Navigation</h3>
              <ul className="flex flex-col gap-4 text-sm font-bold">
                <li><button onClick={() => onNavigate(Page.FUNDRAISER)} className="hover:text-teal-400 transition-colors">Support Resilience</button></li>
                <li><button onClick={() => onNavigate(Page.AWARENESS)} className="hover:text-teal-400 transition-colors">CEST Education Hub</button></li>
                <li><button onClick={() => onNavigate(Page.GALLERY)} className="hover:text-teal-400 transition-colors">Kilo a Ko'a</button></li>
                <li><button onClick={() => setIsPrivacyOpen(true)} className="hover:text-teal-400 transition-colors">Privacy Policy</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-black uppercase tracking-widest text-xs mb-6">Partner Ecosystem</h3>
              <ul className="flex flex-col gap-4 text-sm font-bold">
                 <li><a href={REEFTEACH_URL} target="_blank" className="flex items-center gap-2 hover:text-teal-400 transition-colors">ReefTeach Official <ExternalLink size={14} /></a></li>
                 <li><a href={YUMIN_EDU_URL} target="_blank" className="flex items-center gap-2 hover:text-teal-400 transition-colors">Yumin Edu Learning <ExternalLink size={14} /></a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-10 text-center text-[10px] text-slate-600 uppercase tracking-[0.3em] font-black">
            &copy; 2024 YUMIN EDU & REEFTEACH. GUIDING THE NEXT GENERATION OF REEF STEWARDS.
          </div>
        </div>
      </footer>
    </div>
  );
};