import React, { useState } from 'react';
import { User, Donation } from '../../types';
import { Button } from '../Button';
import { generateSurveyQuestion } from '../../services/geminiService';
import { User as UserIcon, Heart, Calendar, MapPin, ClipboardList, CheckCircle } from 'lucide-react';

interface ProfileViewProps {
  user: User;
}

// Mock Data for the Profile View
const MOCK_DONATIONS: Donation[] = [
  { id: 'd1', date: '2023-11-01', amount: 50.00, campaign: 'Reef-Safe Sunscreen Drive' },
  { id: 'd2', date: '2023-09-15', amount: 25.00, campaign: 'General Conservation' },
  { id: 'd3', date: '2023-08-22', amount: 100.00, campaign: 'Coral Planting Event' },
];

const MOCK_RECEIVED_PHOTOS = [
  { id: 'p1', url: 'https://picsum.photos/400/400?random=101', date: '2023-11-05', note: 'Your adopted coral "Hope" is thriving!' },
  { id: 'p2', url: 'https://picsum.photos/400/400?random=102', date: '2023-10-20', note: 'New growth observed on Sector 7.' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'donations' | 'surveys'>('overview');
  const [isTakingSurvey, setIsTakingSurvey] = useState(false);
  const [surveyQuestion, setSurveyQuestion] = useState<string>('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);

  const handleStartSurvey = async () => {
    setIsLoadingQuestion(true);
    setIsTakingSurvey(true);
    const q = await generateSurveyQuestion("recent booth event experience");
    setSurveyQuestion(q);
    setIsLoadingQuestion(false);
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSurveyCompleted(true);
    setTimeout(() => {
      setIsTakingSurvey(false);
      setSurveyCompleted(false);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 border-4 border-white shadow-md">
          <UserIcon size={48} />
        </div>
        <div className="text-center md:text-left flex-grow">
          <h2 className="text-3xl font-bold text-slate-800">{user.name}</h2>
          <p className="text-slate-500 mb-2">{user.email}</p>
          <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-medium border border-teal-100 inline-block">
            {user.role} Account
          </span>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-6 py-2 bg-rose-50 rounded-xl border border-rose-100">
            <span className="block text-2xl font-bold text-rose-600">${MOCK_DONATIONS.reduce((a, b) => a + b.amount, 0)}</span>
            <span className="text-xs text-rose-800 font-medium">Total Donated</span>
          </div>
          <div className="text-center px-6 py-2 bg-blue-50 rounded-xl border border-blue-100">
            <span className="block text-2xl font-bold text-blue-600">{MOCK_RECEIVED_PHOTOS.length}</span>
            <span className="text-xs text-blue-800 font-medium">Coral Updates</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
            <nav className="flex flex-col">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-left font-medium flex items-center gap-3 transition-colors ${activeTab === 'overview' ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Heart size={18} /> My Corals
              </button>
              <button 
                onClick={() => setActiveTab('donations')}
                className={`px-6 py-4 text-left font-medium flex items-center gap-3 transition-colors ${activeTab === 'donations' ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Calendar size={18} /> Donation History
              </button>
              <button 
                onClick={() => setActiveTab('surveys')}
                className={`px-6 py-4 text-left font-medium flex items-center gap-3 transition-colors ${activeTab === 'surveys' ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <ClipboardList size={18} /> Booth Surveys
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-800">My Coral Updates</h3>
              <p className="text-slate-600">Exclusive photos of corals you've helped protect.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_RECEIVED_PHOTOS.map((photo) => (
                  <div key={photo.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-md transition-shadow">
                    <div className="relative h-64">
                      <img src={photo.url} alt="Coral update" className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                        {photo.date}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-slate-700 font-medium">{photo.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'donations' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">Donation History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Campaign</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_DONATIONS.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-600">{d.date}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{d.campaign}</td>
                        <td className="px-6 py-4 text-slate-600">${d.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">Completed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'surveys' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">In-Person Booth Surveys</h3>
              
              {!isTakingSurvey ? (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-800">November Booth Event</h4>
                      <p className="text-sm text-slate-500">Share your thoughts on our recent pop-up at Waikiki.</p>
                    </div>
                    <Button onClick={handleStartSurvey} variant="outline" className="shrink-0">
                      Take Survey
                    </Button>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-4 flex items-center justify-between opacity-50">
                    <div>
                      <h4 className="font-bold text-slate-800">October Beach Cleanup</h4>
                      <p className="text-sm text-slate-500">Completed on Oct 15, 2023</p>
                    </div>
                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <CheckCircle size={16} /> Done
                    </span>
                  </div>
                </div>
              ) : surveyCompleted ? (
                 <div className="text-center py-12">
                   <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <CheckCircle size={32} />
                   </div>
                   <h3 className="text-xl font-bold text-slate-800">Thank You!</h3>
                   <p className="text-slate-600">Your feedback helps us improve our conservation efforts.</p>
                 </div>
              ) : (
                <div className="max-w-xl mx-auto py-6">
                   <h4 className="font-bold text-lg text-slate-800 mb-6 border-b border-slate-100 pb-2">Feedback Survey</h4>
                   {isLoadingQuestion ? (
                     <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-3">
                       <div className="animate-spin w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full"></div>
                       Generating questions...
                     </div>
                   ) : (
                     <form onSubmit={handleSurveySubmit} className="space-y-6">
                       <div>
                         <label className="block text-sm font-medium text-slate-700 mb-2">
                           {surveyQuestion || "How would you rate your interaction with our team?"}
                         </label>
                         <textarea 
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            rows={4}
                            required
                            placeholder="Please share your thoughts..."
                         />
                       </div>
                       <div className="flex gap-4">
                         <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsTakingSurvey(false)}>Cancel</Button>
                         <Button type="submit" className="flex-1">Submit Feedback</Button>
                       </div>
                     </form>
                   )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};