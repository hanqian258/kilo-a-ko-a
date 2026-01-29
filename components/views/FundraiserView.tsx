import React, { useState } from 'react';
import { User } from '../../types';
import { Button } from '../Button';
import { CheckCircle, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import { REEF_SAFE_DONATION_URL } from '../../constants';

interface FundraiserViewProps {
  user: User | null;
  onNavigateLogin: () => void;
  theme: 'light' | 'dark';
}

export const FundraiserView: React.FC<FundraiserViewProps> = ({ user, onNavigateLogin, theme }) => {
  const [surveyStep, setSurveyStep] = useState(0);
  const [surveyDone, setSurveyDone] = useState(false);

  const isDark = theme === 'dark';

  const handleStartSurvey = () => {
    setSurveyStep(1);
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSurveyStep(2);
    setTimeout(() => setSurveyDone(true), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className={`text-4xl font-black italic font-serif mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Mitigating Local Stressors</h2>
        <p className={`max-w-2xl mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Our team at Kahalu‘u is committed to mitigating local stressors to increase the natural resilience of our coastal ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className={`p-10 rounded-[2.5rem] border flex flex-col items-center text-center relative overflow-hidden shadow-2xl transition-colors duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 to-orange-500"></div>
          <div className="w-full h-56 bg-slate-50 rounded-3xl mb-8 flex items-center justify-center overflow-hidden border border-slate-200">
             <img 
               src="/logo.webp"
               alt="ReefTeach Logo"
               className="w-full h-full object-contain p-4"
             />
          </div>
          <h3 className={`text-2xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Support via ReefTeach</h3>
          <p className={`mb-8 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Fund monitoring and mitigation practices that directly protect Hawaii's coastal ecosystems.
          </p>
          <a href={REEF_SAFE_DONATION_URL} target="_blank" className="w-full">
            <Button className="w-full h-14 text-lg font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 shadow-rose-500/20">
              Donate Now <ExternalLink size={20} className="ml-2" />
            </Button>
          </a>
        </div>

        <div className={`p-10 rounded-[2.5rem] border flex flex-col shadow-2xl transition-colors duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
          {!user ? (
            <div className="text-center h-full flex flex-col justify-center">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <AlertCircle size={40} />
              </div>
              <h3 className={`text-2xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Guiding Others</h3>
              <p className={`mb-8 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Join our community to track mitigation impacts and access CEST educational materials.
              </p>
              <Button onClick={onNavigateLogin} variant="outline" className="w-full h-14 rounded-2xl">
                Sign In to Join
              </Button>
            </div>
          ) : surveyDone ? (
            <div className="text-center h-full flex flex-col justify-center animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
              </div>
              <h3 className={`text-2xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Mahalo!</h3>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Your awareness helps illuminate the path.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-teal-500/10 p-3 rounded-2xl text-teal-500">
                  <Sparkles size={24} />
                </div>
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Knowledge Check</h3>
              </div>

              {surveyStep === 0 ? (
                <div className="space-y-6">
                  <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Take a quick poll on reef-safe behaviors.</p>
                  <Button onClick={handleStartSurvey} className="w-full h-14 rounded-2xl">Start Poll</Button>
                </div>
              ) : (
                <form onSubmit={handleSurveySubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className={`block text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      How likely are you to check sunscreen labels for "Reef Safe" certification?
                    </label>
                    <textarea 
                      className={`w-full p-5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 h-32 resize-none ${isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                      placeholder="Your answer..."
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl">Submit Response</Button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};