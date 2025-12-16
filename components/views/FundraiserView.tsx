import React, { useState } from 'react';
import { User } from '../../types';
import { Button } from '../Button';
import { generateSurveyQuestion } from '../../services/geminiService';
import { CheckCircle, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';

interface FundraiserViewProps {
  user: User | null;
  onNavigateLogin: () => void;
}

export const FundraiserView: React.FC<FundraiserViewProps> = ({ user, onNavigateLogin }) => {
  const [surveyStep, setSurveyStep] = useState(0);
  const [aiQuestion, setAiQuestion] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [surveyDone, setSurveyDone] = useState(false);

  const handleStartSurvey = async () => {
    setIsLoadingAi(true);
    // Use Gemini to generate a unique question for engagement
    const question = await generateSurveyQuestion("the importance of reef-safe sunscreen");
    setAiQuestion(question);
    setIsLoadingAi(false);
    setSurveyStep(1);
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSurveyStep(2);
    setTimeout(() => setSurveyDone(true), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Reef-Safe Sunscreen Fundraiser</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Help us protect marine life by switching to mineral-based sunscreens. Your donation supports ReefTeach's educational programs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Donation Panel - Prominent External Link */}
        <div className="bg-white p-8 rounded-2xl border border-rose-100 shadow-xl shadow-rose-50 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 to-orange-400"></div>
          <div className="w-full h-48 bg-slate-50 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
             <img src="https://picsum.photos/400/300?random=30" alt="Reef-safe Sunscreen" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Donate via ReefTeach</h3>
          <p className="text-slate-600 mb-6 text-sm">
            Visit the official ReefTeach donation portal to contribute directly to coral preservation efforts.
          </p>
          <a 
            href="https://reefteach.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full block"
          >
            <Button className="w-full h-14 text-lg font-bold shadow-rose-200 shadow-lg flex items-center justify-center gap-2" style={{ backgroundColor: '#E11D48' }}>
              Donate Now <ExternalLink size={20} />
            </Button>
          </a>
          <p className="text-xs text-slate-400 mt-4">
            You will be redirected to the secure ReefTeach website.
          </p>
        </div>

        {/* Survey / Engagement Panel */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex-grow">
            {!user ? (
              <div className="text-center h-full flex flex-col justify-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-slate-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Member Benefits</h3>
                <p className="text-slate-600 mb-6">
                  Create an account to track your donations, receive personalized coral photo updates, and participate in event surveys.
                </p>
                <Button onClick={onNavigateLogin} variant="outline" className="w-full">
                  Login or Sign Up
                </Button>
              </div>
            ) : surveyDone ? (
              <div className="text-center h-full flex flex-col justify-center animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Mahalo!</h3>
                <p className="text-slate-600">
                  Feedback received. You can view your donation history and more surveys in your <span className="text-teal-600 font-semibold">Profile</span>.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-teal-100 p-2 rounded-lg text-teal-700">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Quick Poll</h3>
                </div>

                {surveyStep === 0 && (
                  <div className="space-y-4">
                    <p className="text-slate-600">
                      Take a quick AI-generated poll about sunscreen awareness while you are here!
                    </p>
                    <Button 
                      onClick={handleStartSurvey} 
                      isLoading={isLoadingAi} 
                      className="w-full"
                    >
                      Start Poll
                    </Button>
                    <p className="text-xs text-center text-slate-400 pt-2">
                       Logged in as {user.name}
                    </p>
                  </div>
                )}

                {surveyStep === 1 && (
                  <form onSubmit={handleSurveySubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {aiQuestion || "How would you rate your awareness of coral bleaching?"}
                      </label>
                      <textarea 
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        rows={3}
                        placeholder="Your answer..."
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Submit</Button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};