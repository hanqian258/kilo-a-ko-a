import React, { useState } from 'react';
import { Page, User } from '../types';
import { Menu, X, User as UserIcon, LogOut, ExternalLink } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentPage, 
  onNavigate, 
  user, 
  onLogout 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { page: Page.HOME, label: 'Home' },
    { page: Page.FUNDRAISER, label: 'Fundraiser' },
    { page: Page.AWARENESS, label: 'Awareness' },
    { page: Page.GALLERY, label: "Kilo a Ko'a" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo Area - Collaborative */}
            <div className="flex items-center gap-6 cursor-pointer" onClick={() => onNavigate(Page.HOME)}>
              {/* Designated Logo Spaces */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                   <div className="w-8 h-8 md:w-10 md:h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-sm">Y</div>
                   <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Yumin</span>
                </div>
                <div className="h-8 w-px bg-slate-200 mx-1"></div>
                <div className="flex flex-col items-center">
                   <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-sm">R</div>
                   <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">ReefTeach</span>
                </div>
              </div>
              
              <div className="hidden lg:block border-l border-slate-200 pl-6 ml-2">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Kilo a Ko'a</h1>
                <p className="text-xs text-slate-500 font-medium">Collaborative Conservation Platform</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={`text-sm font-medium transition-colors hover:text-teal-600 ${
                    currentPage === item.page ? 'text-teal-600 border-b-2 border-teal-600 pb-1' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {user ? (
                <div className="flex items-center gap-4 ml-4 border-l pl-4 border-slate-200">
                  <button 
                    onClick={() => onNavigate(Page.PROFILE)}
                    className="flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <UserIcon size={18} className="text-teal-600" />
                    <div className="flex flex-col items-start leading-none">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">View Profile</span>
                    </div>
                  </button>
                  <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Log Out">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onNavigate(Page.LOGIN)}
                  className="ml-4 px-4 py-2 bg-teal-600 text-white rounded-full text-sm font-medium hover:bg-teal-700 transition-all shadow-sm"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-slate-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg z-50">
            <div className="px-4 py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => {
                    onNavigate(item.page);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left text-sm font-medium py-2 ${
                    currentPage === item.page ? 'text-teal-600' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-slate-100 pt-4">
                 {user ? (
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        onNavigate(Page.PROFILE);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-sm text-slate-700 font-medium"
                    >
                      <UserIcon size={18} />
                      My Profile
                    </button>
                    <button 
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-left text-sm text-red-500 font-medium flex items-center gap-2"
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
                    className="w-full text-center px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium"
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

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xs">Y</div>
                 <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">R</div>
                 <span className="font-bold text-white">Kilo a Ko'a</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Empowering communities to protect our oceans through education, observation, and action.
                <br/>
                A partnership between <strong>Yumin Edu</strong> and <strong>ReefTeach</strong>.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="flex flex-col gap-2 text-sm">
                <li><button onClick={() => onNavigate(Page.FUNDRAISER)} className="hover:text-teal-400">Reef-Safe Fundraiser</button></li>
                <li><button onClick={() => onNavigate(Page.AWARENESS)} className="hover:text-teal-400">Conservation Blog</button></li>
                <li><button onClick={() => onNavigate(Page.GALLERY)} className="hover:text-teal-400">Coral Gallery</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">External Resources</h3>
              <ul className="flex flex-col gap-2 text-sm">
                 <li>
                   <a href="#" className="flex items-center gap-2 hover:text-teal-400 transition-colors">
                     ReefTeach Donation Site <ExternalLink size={12} />
                   </a>
                 </li>
                 <li>
                   <a href="#" className="flex items-center gap-2 hover:text-teal-400 transition-colors">
                     Yumin Edu Programs <ExternalLink size={12} />
                   </a>
                 </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
            &copy; 2024 Yumin Edu & ReefTeach. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};