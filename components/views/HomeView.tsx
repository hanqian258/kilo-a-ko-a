import React, { useState } from 'react';
import { Page, User, UserRole } from '../../types';
import { Button } from '../Button';
import { ArrowRight, Heart, Eye, BookOpen, Edit3, Check, X } from 'lucide-react';
import { YUMIN_LOGO_URL, YUMIN_EDU_URL, REEFTEACH_URL } from '../../constants';

interface HomeViewProps {
  onNavigate: (page: Page) => void;
  theme: 'light' | 'dark';
  user?: User | null;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, theme, user }) => {
  const isDark = theme === 'dark';
  const isAdmin = user?.role === UserRole.ADMIN;
  
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [heroTitle, setHeroTitle] = useState("Guiding. Illuminating. Protecting.");
  const [heroSub, setHeroSub] = useState("Empowering Hawaii's coastal resilience through purpose-driven education and community monitoring.");

  const handleSaveHero = () => setIsEditingHero(false);
  const handleCancelHero = () => setIsEditingHero(false);

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className={`relative rounded-[3rem] overflow-hidden py-32 px-8 md:px-16 text-center md:text-left shadow-2xl border transition-all duration-500 ${
        isDark ? 'bg-[#0c1218] border-white/5 text-white' : 'bg-teal-900 border-transparent text-white'
      }`}>
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=1600" 
            alt="Vibrant coral reef underwater" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className={`absolute inset-0 bg-gradient-to-r opacity-90 md:opacity-70 ${
            isDark ? 'from-[#0c1218] via-transparent to-transparent' : 'from-teal-950 via-transparent to-transparent'
          }`}></div>
        </div>

        {isAdmin && (
          <div className="absolute top-6 right-6 z-20">
            {!isEditingHero ? (
              <button 
                onClick={() => setIsEditingHero(true)}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all border border-white/20 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
              >
                <Edit3 size={16} /> Edit Hero Content
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSaveHero} aria-label="Save Hero Content" className="bg-green-500 hover:bg-green-600 p-3 rounded-full shadow-lg transition-all"><Check size={16} /></button>
                <button onClick={handleCancelHero} aria-label="Cancel Editing" className="bg-red-500 hover:bg-red-600 p-3 rounded-full shadow-lg transition-all"><X size={16} /></button>
              </div>
            )}
          </div>
        )}

        <div className="relative z-10 max-w-2xl">
          {isEditingHero ? (
            <div className="space-y-4 mb-8">
              <input 
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl text-4xl md:text-5xl font-black text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <textarea 
                value={heroSub}
                onChange={(e) => setHeroSub(e.target.value)}
                className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl text-lg font-bold text-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-400 h-32"
              />
            </div>
          ) : (
            <>
              <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] font-serif italic">
                {heroTitle.split('.').map((part, i, arr) => (
                  <span key={i}>
                    {i === arr.length - 2 ? <span className="text-teal-400">{part}.</span> : part + (i < arr.length - 1 ? '.' : '')}
                  </span>
                ))}
              </h1>
              <p className={`text-xl md:text-2xl mb-10 leading-relaxed font-bold max-w-xl ${isDark ? 'text-slate-300' : 'text-teal-50'}`}>
                {heroSub}
              </p>
            </>
          )}
          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
            <Button onClick={() => onNavigate(Page.FUNDRAISER)} className="h-16 px-12 text-lg font-black uppercase tracking-widest shadow-2xl shadow-teal-500/20">
              Support Resilience
            </Button>
            <Button variant="outline" onClick={() => onNavigate(Page.GALLERY)} className="h-16 px-12 text-lg font-black uppercase tracking-widest border-white/40 text-white hover:bg-white/10 transition-all backdrop-blur-md">
              Explore Monitoring
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-10 px-4">
        {[
          {
            icon: Heart,
            title: "Mitigate Stressors",
            desc: "Protect our coastal ecosystems by switching to mineral-based sunscreen. Your contributions directly fund local mitigation efforts.",
            color: "rose",
            target: Page.FUNDRAISER,
            linkText: "Support the Reef"
          },
          {
            icon: BookOpen,
            title: "CEST Framework",
            desc: "Fostering Cultural Connection, Environmental Awareness, STEM, and Critical Thinking to empower cross-cultural understanding.",
            color: "blue",
            target: Page.AWARENESS,
            linkText: "CEST Knowledge"
          },
          {
            icon: Eye,
            title: "Kilo a Ko'a",
            desc: "Contribute to our community monitoring framework that integrates Hawaiian and Western scientific methodologies.",
            color: "teal",
            target: Page.GALLERY,
            linkText: "View Monitoring"
          }
        ].map((feature, i) => (
          <button
            type="button"
            key={i}
            className={`p-12 rounded-[2.5rem] shadow-2xl border transition-all cursor-pointer group flex flex-col h-full w-full text-left ${
              isDark 
                ? 'bg-[#0c1218] border-white/5 hover:border-teal-500/30 text-white' 
                : 'bg-white border-slate-100 hover:border-teal-500/20 text-slate-900'
            } hover:-translate-y-3`} 
            onClick={() => onNavigate(feature.target)}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform shadow-2xl ${
              feature.color === 'rose' ? 'bg-rose-500/10 text-rose-500 shadow-rose-500/10' :
              feature.color === 'blue' ? 'bg-blue-500/10 text-blue-500 shadow-blue-500/10' :
              'bg-teal-500/10 text-teal-500 shadow-teal-500/10'
            }`}>
              <feature.icon size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4 tracking-tight">{feature.title}</h3>
            <p className={`mb-8 leading-relaxed font-medium flex-grow ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{feature.desc}</p>
            <div className={`flex items-center font-black text-sm uppercase tracking-widest transition-colors ${
              feature.color === 'rose' ? 'text-rose-500' :
              feature.color === 'blue' ? 'text-blue-500' :
              'text-teal-500'
            }`}>
              {feature.linkText} <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </section>

      {/* Partners Spacer */}
      <section className={`text-center py-32 rounded-[4rem] px-8 transition-colors duration-500 ${
        isDark ? 'bg-[#05080a] border-t border-white/5' : 'bg-white border border-slate-100'
      }`}>
        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-20">Purpose-Driven Collaboration</p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-16 md:gap-32 mb-20">
           <a href={YUMIN_EDU_URL} target="_blank" className="flex flex-col items-center gap-8 group no-underline">
              <div className={`p-10 rounded-[3.5rem] shadow-2xl w-64 h-64 flex items-center justify-center transition-all group-hover:scale-105 group-hover:-rotate-3 border-4 ${isDark ? 'bg-white border-white/10' : 'bg-slate-50 border-white'}`}>
                 <img src={YUMIN_LOGO_URL} alt="Yumin Edu" className="w-full h-full object-contain" />
              </div>
              <p className={`text-sm font-black uppercase tracking-[0.3em] group-hover:text-teal-500 transition-colors ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Yumin Edu</p>
           </a>
           
           <div className={`hidden md:block w-px h-40 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
           
           <a href={REEFTEACH_URL} target="_blank" className="flex flex-col items-center gap-8 group no-underline">
              <div className={`p-10 rounded-[3.5rem] shadow-2xl w-64 h-64 flex items-center justify-center transition-all group-hover:scale-105 group-hover:rotate-3 border-4 ${isDark ? 'bg-white border-white/10' : 'bg-slate-50 border-white'}`}>
                 <img src="/logo.webp" alt="ReefTeach" className="w-full h-full object-contain" />
              </div>
              <p className={`text-sm font-black uppercase tracking-[0.3em] group-hover:text-blue-500 transition-colors ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>ReefTeach</p>
           </a>
        </div>
        <div className="max-w-3xl mx-auto px-10">
          <p className={`text-2xl italic font-bold leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            "Integrating student-founded knowledge sharing with community-led monitoring to increase natural resilience through shared education and action."
          </p>
        </div>
      </section>
    </div>
  );
};