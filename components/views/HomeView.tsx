import React from 'react';
import { Page } from '../../types';
import { Button } from '../Button';
import { ArrowRight, Heart, Eye, BookOpen } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (page: Page) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-teal-900 text-white py-20 px-8 md:px-16 text-center md:text-left">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/1600/900?random=20" 
            alt="Ocean background" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
            Protecting Hawaii's <span className="text-teal-300">Reefs</span> Together
          </h1>
          <p className="text-lg md:text-xl text-teal-100 mb-8 leading-relaxed">
            Join Yumin Edu and ReefTeach in our mission to conserve coral reefs through responsible tourism, community observation, and sustainable choices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button onClick={() => onNavigate(Page.FUNDRAISER)} className="h-12 px-8 text-lg">
              Support Our Cause
            </Button>
            <Button variant="outline" onClick={() => onNavigate(Page.GALLERY)} className="h-12 px-8 text-lg border-white text-white hover:bg-white/10">
              Explore the Reef
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => onNavigate(Page.FUNDRAISER)}>
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Heart size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Reef-Safe Fundraiser</h3>
          <p className="text-slate-600 mb-4">Support ReefTeach by switching to reef-safe sunscreen. Join our community and track your impact.</p>
          <div className="flex items-center text-rose-600 font-medium text-sm">
            Donate Now <ArrowRight size={16} className="ml-2" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => onNavigate(Page.AWARENESS)}>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <BookOpen size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Education & Awareness</h3>
          <p className="text-slate-600 mb-4">Learn about responsible tourism and coral conservation through expert articles and guides.</p>
          <div className="flex items-center text-blue-600 font-medium text-sm">
            Read Articles <ArrowRight size={16} className="ml-2" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => onNavigate(Page.GALLERY)}>
          <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Eye size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Kilo a Ko'a</h3>
          <p className="text-slate-600 mb-4">"Observe the Corals". View real-time updates from scientists and contribute your own sightings.</p>
          <div className="flex items-center text-teal-600 font-medium text-sm">
            View Gallery <ArrowRight size={16} className="ml-2" />
          </div>
        </div>
      </section>

      {/* Partners Spacer */}
      <section className="text-center py-12 border-t border-slate-100">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8">In Collaboration With</p>
        <div className="flex justify-center items-center gap-12 opacity-75 grayscale hover:grayscale-0 transition-all">
          {/* Placeholder Logos */}
          <div className="h-16 w-32 bg-slate-200 rounded flex items-center justify-center text-slate-500 font-bold">Yumin Edu</div>
          <div className="h-16 w-32 bg-slate-200 rounded flex items-center justify-center text-slate-500 font-bold">ReefTeach</div>
        </div>
      </section>
    </div>
  );
};