import React, { useState, useEffect } from 'react';
import { X, Shield, Sparkles, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { loadSurveys, saveSurveys } from '../utils/storage';
import { SurveyResponse } from '../types';

interface InPersonSurveyProps {
  isOpen: boolean;
  onClose: () => void;
}

type SurveyStep = 'consent' | 'q1' | 'q2' | 'q3' | 'q4' | 'success';

export const InPersonSurvey: React.FC<InPersonSurveyProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<SurveyStep>('consent');
  const [ageGroup, setAgeGroup] = useState<'under18' | 'over18' | null>(null);
  const [hasConsent, setHasConsent] = useState(false);
  
  // Survey Answers State
  const [rating, setRating] = useState<number | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [buyingPlan, setBuyingPlan] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('consent');
      setAgeGroup(null);
      setHasConsent(false);
      setRating(null);
      setTopics([]);
      setBuyingPlan(null);
      setFeedback('');
    }
  }, [isOpen]);

  const handleTopicToggle = (topic: string) => {
    if (topic === 'none') {
      setTopics(['none']);
    } else {
      const newTopics = topics.filter(t => t !== 'none');
      if (newTopics.includes(topic)) {
        setTopics(newTopics.filter(t => t !== topic));
      } else {
        setTopics([...newTopics, topic]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (ageGroup && rating !== null && buyingPlan) {
      const newResponse: SurveyResponse = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        ageGroup: ageGroup,
        rating: rating,
        topics: topics,
        buyingPlan: buyingPlan,
        feedback: feedback
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
    const steps: SurveyStep[] = ['q1', 'q2', 'q3', 'q4'];
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
                onClick={() => setStep('q1')}
              >
                Let's Start
              </Button>
            </div>
          )}

          {step === 'q1' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-black text-slate-800 leading-tight">1. How engaging and clear were our posters and activities today?</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { val: 5, label: 'Excellent (I learned a lot & it was fun!)', emoji: '🤩' },
                  { val: 4, label: 'Good', emoji: '😊' },
                  { val: 3, label: 'Okay', emoji: '😐' },
                  { val: 2, label: 'Confusing', emoji: '🤔' },
                  { val: 1, label: 'Boring', emoji: '😴' }
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setRating(item.val)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-bold text-left ${rating === item.val ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <span>{item.val} - {item.label}</span>
                    </div>
                    {rating === item.val && <CheckCircle2 size={20} />}
                  </button>
                ))}
              </div>
              <div className="pt-4">
                <Button className="w-full h-14" disabled={rating === null} onClick={() => setStep('q2')}>
                  Next Question <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>
            </div>
          )}

          {step === 'q2' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800 leading-tight">2. Which topics did you learn something new about today?</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">(Check all that apply)</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'sunscreen', label: 'Mineral vs. Chemical Sunscreen' },
                  { id: 'bleaching', label: 'Coral Bleaching (Causes & Effects)' },
                  { id: 'spawning', label: 'Coral Spawning (Reproduction cycles)' },
                  { id: 'habits', label: 'Reef-Safe Habits (How to help daily)' },
                  { id: 'none', label: 'I already knew all of this / Didn’t learn anything new.' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTopicToggle(item.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-bold text-left ${topics.includes(item.id) ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                  >
                    <span>{item.label}</span>
                    {topics.includes(item.id) && <CheckCircle2 size={20} />}
                  </button>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 h-14" onClick={() => setStep('q1')}>
                  <ArrowLeft className="mr-2" size={20} /> Back
                </Button>
                <Button className="flex-[2] h-14" disabled={topics.length === 0} onClick={() => setStep('q3')}>
                  Continue <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>
            </div>
          )}

          {step === 'q3' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-black text-slate-800 leading-tight">3. Has this booth changed how you plan to buy sunscreen in the future?</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Yes, I plan to switch to mineral/reef-safe options.',
                  'I was already using reef-safe options.',
                  'No, I will likely stick to my current products.'
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setBuyingPlan(item)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-bold text-left ${buyingPlan === item ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                  >
                    <span>{item}</span>
                    {buyingPlan === item && <CheckCircle2 size={20} />}
                  </button>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 h-14" onClick={() => setStep('q2')}>
                  <ArrowLeft className="mr-2" size={20} /> Back
                </Button>
                <Button className="flex-[2] h-14" disabled={!buyingPlan} onClick={() => setStep('q4')}>
                  Almost Done <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>
            </div>
          )}

          {step === 'q4' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800 leading-tight">4. (Optional) Any feedback on our display or presentation?</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Help us improve the experience</p>
              </div>
              <textarea 
                className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-teal-500/20 focus:bg-white rounded-2xl focus:outline-none transition-all font-medium h-40 resize-none"
                placeholder="What did you like? What could we do better?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 h-14" onClick={() => setStep('q3')}>
                  <ArrowLeft className="mr-2" size={20} /> Back
                </Button>
                <Button className="flex-[2] h-14 text-lg font-black uppercase tracking-widest shadow-xl shadow-teal-100" onClick={handleSubmit} isLoading={isLoading}>
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