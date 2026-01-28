import React, { useState, useEffect } from 'react';
import { X, Shield, Sparkles, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { loadSurveys, saveSurveys } from '../utils/storage';
import { SurveyResponse } from '../types';

interface InPersonSurveyProps {
  isOpen: boolean;
  onClose: () => void;
}

type SurveyStep = 'consent' | 'prior' | 'learning' | 'experience' | 'feedback_liked' | 'feedback_change' | 'future' | 'success';

export const InPersonSurvey: React.FC<InPersonSurveyProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<SurveyStep>('consent');
  const [ageGroup, setAgeGroup] = useState<'under18' | 'over18' | null>(null);
  const [hasConsent, setHasConsent] = useState(false);
  
  // Survey Answers State
  const [interestedPrior, setInterestedPrior] = useState<string | null>(null);
  const [priorKnowledge, setPriorKnowledge] = useState<number | null>(null);
  const [topicsLearned, setTopicsLearned] = useState('');
  const [experienceRating, setExperienceRating] = useState<number | null>(null);
  const [likedOrWantedMore, setLikedOrWantedMore] = useState('');
  const [needsChanging, setNeedsChanging] = useState('');
  const [wantToLearnMore, setWantToLearnMore] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('consent');
      setAgeGroup(null);
      setHasConsent(false);
      setInterestedPrior(null);
      setPriorKnowledge(null);
      setTopicsLearned('');
      setExperienceRating(null);
      setLikedOrWantedMore('');
      setNeedsChanging('');
      setWantToLearnMore(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (ageGroup && interestedPrior && priorKnowledge !== null && experienceRating !== null && wantToLearnMore) {
      const newResponse: SurveyResponse = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        ageGroup: ageGroup,
        interestedPrior: interestedPrior,
        priorKnowledge: priorKnowledge,
        topicsLearned: topicsLearned,
        experienceRating: experienceRating,
        likedOrWantedMore: likedOrWantedMore,
        needsChanging: needsChanging,
        wantToLearnMore: wantToLearnMore
      };

      const currentSurveys = loadSurveys();
      saveSurveys([...currentSurveys, newResponse]);
    }

    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
      setTimeout(() => {
        onClose();
      }, 3500);
    }, 1000);
  };

  const getProgress = () => {
    const steps: SurveyStep[] = ['prior', 'learning', 'experience', 'feedback_liked', 'feedback_change', 'future'];
    const idx = steps.indexOf(step as any);
    if (idx === -1) return 0;
    return ((idx + 1) / steps.length) * 100;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
        
        {/* Header with Progress */}
        <div className="bg-teal-600 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-teal-200" />
            <h2 className="text-2xl font-black italic font-serif tracking-tight">Kilo a Ko'a Poll</h2>
          </div>
          <p className="text-teal-50 text-xs font-bold uppercase tracking-widest opacity-80">Anonymous Booth Survey</p>
          
          {step !== 'consent' && step !== 'success' && (
            <div className="mt-4 h-1.5 w-full bg-teal-800/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-200 transition-all duration-500 ease-out" 
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          )}
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {step === 'consent' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-start gap-4 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                <Shield className="text-blue-600 shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Privacy & Data Consent</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    This survey is <strong>completely anonymous</strong>. We do not collect names, emails, or identifying information. Your answers help Yumin Edu and ReefTeach improve reef protection.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="font-bold text-xs uppercase tracking-widest text-slate-500">Please select your age group:</p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setAgeGroup('under18')}
                    className={`p-4 rounded-2xl border-2 font-bold transition-all ${ageGroup === 'under18' ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                  >
                    Under 18
                  </button>
                  <button 
                    onClick={() => setAgeGroup('over18')}
                    className={`p-4 rounded-2xl border-2 font-bold transition-all ${ageGroup === 'over18' ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                  >
                    18 or Older
                  </button>
                </div>

                {ageGroup === 'under18' && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-3 rounded-lg border border-amber-100 font-medium">
                    <AlertCircle size={16} />
                    <span>Please ask a parent or guardian before participating.</span>
                  </div>
                )}

                <label className="flex items-start gap-3 cursor-pointer group mt-4">
                  <div className="mt-1">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      checked={hasConsent}
                      onChange={(e) => setHasConsent(e.target.checked)}
                    />
                  </div>
                  <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors font-medium">
                    I consent to my anonymous answers being used for marine conservation research.
                  </span>
                </label>
              </div>

              <Button 
                className="w-full h-14 text-lg font-black uppercase tracking-widest shadow-xl shadow-teal-100"
                disabled={!hasConsent || !ageGroup}
                onClick={() => setStep('prior')}
              >
                Let's Start
              </Button>
            </div>
          )}

          {step === 'prior' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-800 leading-tight">1. Were you interested in learning more about Coral Conservation prior to this?</h3>
                <div className="grid grid-cols-2 gap-4">
                   <button
                    onClick={() => setInterestedPrior('Yes')}
                    className={`p-4 rounded-2xl border-2 font-bold transition-all ${interestedPrior === 'Yes' ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setInterestedPrior('No')}
                    className={`p-4 rounded-2xl border-2 font-bold transition-all ${interestedPrior === 'No' ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xl font-black text-slate-800 leading-tight">2. Rank your prior knowledge about coral conservation and the impacts that are occurring in the ocean.</h3>
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                  <span>Know a little</span>
                  <span>Know a lot</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setPriorKnowledge(val)}
                      className={`aspect-square flex items-center justify-center rounded-xl border-2 font-bold text-lg transition-all ${priorKnowledge === val ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                 <Button className="w-full h-14" disabled={!interestedPrior || priorKnowledge === null} onClick={() => setStep('learning')}>
                  Next <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>
            </div>
          )}

          {step === 'learning' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800 leading-tight">3. What topics did you learn more about during our presentation?</h3>
              </div>
              <textarea
                className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-2xl focus:outline-none transition-all font-medium h-40 resize-none"
                placeholder="Type your answer here..."
                value={topicsLearned}
                onChange={(e) => setTopicsLearned(e.target.value)}
              />
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 h-14" onClick={() => setStep('prior')}>
                  <ArrowLeft className="mr-2" size={20} /> Back
                </Button>
                <Button className="flex-[2] h-14" disabled={!topicsLearned.trim()} onClick={() => setStep('experience')}>
                  Continue <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>
            </div>
          )}

          {step === 'experience' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-black text-slate-800 leading-tight">4. Rate your experience with learning more about Coral Conservation.</h3>
               <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                  <span>I learned a little</span>
                  <span>I learned a lot</span>
                </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { val: 5, label: 'Excellent', emoji: '🤩' },
                  { val: 4, label: 'Good', emoji: '😊' },
                  { val: 3, label: 'Okay', emoji: '😐' },
                  { val: 2, label: 'Could be better', emoji: '🤔' },
                  { val: 1, label: 'Poor', emoji: '😴' }
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setExperienceRating(item.val)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-bold text-left ${experienceRating === item.val ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <span>{item.val} - {item.label}</span>
                    </div>
                    {experienceRating === item.val && <CheckCircle2 size={20} />}
                  </button>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 h-14" onClick={() => setStep('learning')}>
                  <ArrowLeft className="mr-2" size={20} /> Back
                </Button>
                <Button className="flex-[2] h-14" disabled={experienceRating === null} onClick={() => setStep('feedback_liked')}>
                  Continue <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>
            </div>
          )}

          {step === 'feedback_liked' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800 leading-tight">5. Tell us what you liked/what you want to see more from our presentation.</h3>
              </div>
              <textarea
                className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-2xl focus:outline-none transition-all font-medium h-40 resize-none"
                placeholder="Your thoughts..."
                value={likedOrWantedMore}
                onChange={(e) => setLikedOrWantedMore(e.target.value)}
              />
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 h-14" onClick={() => setStep('experience')}>
                  <ArrowLeft className="mr-2" size={20} /> Back
                </Button>
                <Button className="flex-[2] h-14" disabled={!likedOrWantedMore.trim()} onClick={() => setStep('feedback_change')}>
                  Next <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>
            </div>
          )}

          {step === 'feedback_change' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800 leading-tight">6. What do you feel needs changing in order to help teach others easier about coral conservation?</h3>
              </div>
              <textarea 
                className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-2xl focus:outline-none transition-all font-medium h-40 resize-none"
                placeholder="Suggestions for improvement..."
                value={needsChanging}
                onChange={(e) => setNeedsChanging(e.target.value)}
              />
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 h-14" onClick={() => setStep('feedback_liked')}>
                  <ArrowLeft className="mr-2" size={20} /> Back
                </Button>
                <Button className="flex-[2] h-14" disabled={!needsChanging.trim()} onClick={() => setStep('future')}>
                  Next <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>
            </div>
          )}

          {step === 'future' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-black text-slate-800 leading-tight">7. Would you want to learn more about Coral Conservation in the future?</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Yes',
                  'No'
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setWantToLearnMore(item)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-bold text-left ${wantToLearnMore === item ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                  >
                    <span>{item}</span>
                    {wantToLearnMore === item && <CheckCircle2 size={20} />}
                  </button>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 h-14" onClick={() => setStep('feedback_change')}>
                  <ArrowLeft className="mr-2" size={20} /> Back
                </Button>
                <Button className="flex-[2] h-14 text-lg font-black uppercase tracking-widest shadow-xl shadow-teal-100" disabled={!wantToLearnMore} onClick={handleSubmit} isLoading={isLoading}>
                  Finish Survey
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-12 space-y-6 animate-in zoom-in-90 duration-500">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
                <CheckCircle2 size={56} />
              </div>
              <h3 className="text-4xl font-black text-slate-800 tracking-tight italic font-serif leading-none">Mahalo!</h3>
              <div className="space-y-2">
                <p className="text-slate-600 text-lg font-medium">
                  Thank you for contributing to the Kilo a Ko'a project.
                </p>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                  Your voice helps illuminate the path to reef resilience.
                </p>
              </div>
              <div className="pt-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                  Auto-closing window
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};