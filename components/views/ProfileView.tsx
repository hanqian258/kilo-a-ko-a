import React, { useState, useEffect } from 'react';
import { User, UserRole, SurveyResponse } from '../../types';
import { Button } from '../Button';
import { User as UserIcon, ClipboardList, Download, FileSpreadsheet, FileJson, Lock } from 'lucide-react';
import { exportSurveysToCSV, exportGalleryToJSON, loadSurveys } from '../../utils/storage';
import { RoleVerificationModal } from '../RoleVerificationModal';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../utils/firebase';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
  theme: 'light' | 'dark';
}

const MOCK_RECEIVED_PHOTOS = [
  { id: 'p1', url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=600', date: '2023-11-05', note: 'Your adopted coral "Hope" is thriving!' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser, theme }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'donations' | 'settings'>('overview');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Survey History State
  const [historySurveys, setHistorySurveys] = useState<SurveyResponse[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const isDark = theme === 'dark';

  const handleRoleUpdate = (newRole: UserRole) => {
    const updatedUser = { ...user, role: newRole };
    onUpdateUser(updatedUser);
  };

  useEffect(() => {
    if (activeTab === 'donations') {
      fetchHistory();
    }
  }, [activeTab, user.id]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      let surveys: SurveyResponse[] = [];

      // 1. Try Firestore
      try {
        const q = query(
          collection(db, 'survey_responses'),
          where('userId', '==', user.id),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        surveys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SurveyResponse));
      } catch (firestoreErr) {
        console.warn("Firestore fetch failed, checking local storage", firestoreErr);
      }

      // 2. Fallback / Merge with LocalStorage
      if (surveys.length === 0) {
        const local = loadSurveys().filter(s => s.userId === user.id);
        if (local.length > 0) {
           surveys = local.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
      }

      setHistorySurveys(surveys);
    } catch (e) {
      console.error("Error fetching history", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      {/* Header Profile Card */}
      <div className={`p-10 rounded-[3rem] shadow-2xl border flex flex-col md:flex-row items-center gap-10 transition-colors duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-8 shadow-xl ${isDark ? 'bg-teal-500/10 text-teal-500 border-white/5' : 'bg-teal-50 text-teal-600 border-white'}`}>
          <UserIcon size={64} />
        </div>
        <div className="text-center md:text-left flex-grow">
          <h2 className={`text-4xl font-black italic font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name}</h2>
          <p className="text-slate-500 font-bold tracking-tight mb-4">{user.email}</p>
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${isDark ? 'bg-white/5 text-teal-400 border-white/10' : 'bg-teal-50 text-teal-700 border-teal-100'}`}>
            {user.role} Steward
          </span>
        </div>
        <div className="flex gap-4">
          <div className={`p-6 rounded-[2rem] border text-center min-w-[140px] ${isDark ? 'bg-blue-500/5 border-blue-500/10' : 'bg-blue-50 border-blue-100'}`}>
            <span className="block text-3xl font-black text-blue-500 tracking-tighter leading-none mb-1">{MOCK_RECEIVED_PHOTOS.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Updates</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-72 flex-shrink-0">
          <nav className={`rounded-[2.5rem] shadow-2xl border overflow-hidden p-2 transition-colors duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
            {['overview', 'donations', 'settings'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`w-full px-6 py-4 text-left text-sm font-black uppercase tracking-widest rounded-2xl transition-all mb-1 last:mb-0 ${
                  activeTab === tab 
                    ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' 
                    : (isDark ? 'text-slate-500 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50')
                }`}
              >
                {tab === 'overview' && 'My Corals'}
                {tab === 'donations' && 'History'}
                {tab === 'settings' && 'Data Management'}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-grow">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {MOCK_RECEIVED_PHOTOS.map((photo) => (
                <div key={photo.id} className={`rounded-[2.5rem] overflow-hidden shadow-2xl border group transition-all duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
                  <div className="h-64 overflow-hidden relative">
                    <img src={photo.url} alt="Coral update" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl">
                      {photo.date}
                    </div>
                  </div>
                  <div className="p-8">
                    <p className={`text-lg italic font-medium font-serif ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>"{photo.note}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'donations' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
               <div className="flex items-center justify-between mb-2">
                 <h3 className={`text-2xl font-black italic font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>Survey History</h3>
               </div>

               {isLoadingHistory ? (
                  <div className={`p-12 rounded-[2.5rem] shadow-xl border text-center ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
                    <div className="animate-pulse flex flex-col items-center">
                       <div className="h-8 w-8 bg-teal-500 rounded-full mb-4"></div>
                       <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading records...</p>
                    </div>
                  </div>
               ) : historySurveys.length === 0 ? (
                  <div className={`p-12 rounded-[2.5rem] shadow-xl border text-center ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
                    <p className="text-slate-500 font-bold">No past surveys found.</p>
                  </div>
               ) : (
                 <div className="space-y-4">
                   {historySurveys.map((survey) => (
                     <div key={survey.id} className={`p-6 rounded-[2rem] border transition-all ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
                       <div className="flex items-start justify-between">
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                               {survey.category || 'General'}
                             </span>
                             <span className="text-slate-500 text-xs font-bold">{new Date(survey.date).toLocaleDateString()}</span>
                           </div>
                           <h4 className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              {survey.category === 'coral' ? 'Coral Health Assessment' : survey.category === 'water' ? 'Water Quality Check' : 'In-Person Survey'}
                           </h4>
                         </div>
                         {survey.location && (
                           <div className="text-right">
                              <span className="flex items-center justify-end gap-1 text-xs font-bold text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> GPS Logged
                              </span>
                           </div>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className={`p-10 rounded-[2.5rem] shadow-xl border animate-in fade-in slide-in-from-bottom-4 duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
              <h3 className={`text-2xl font-black italic font-serif mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>Data Management</h3>

              <div className="grid grid-cols-1 gap-6">
                <div className={`flex items-center justify-between p-6 rounded-[2rem] border border-dashed transition-all hover:border-solid ${isDark ? 'border-white/10 hover:border-teal-500/30 hover:bg-white/5' : 'border-slate-200 hover:border-teal-500/30 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${isDark ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                      <FileSpreadsheet size={24} />
                    </div>
                    <div>
                      <h4 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Survey Responses</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Export as CSV</p>
                    </div>
                  </div>
                  <Button onClick={exportSurveysToCSV} variant="outline" className={`h-12 px-6 rounded-xl ${isDark ? 'border-white/10 text-slate-300 hover:text-white' : 'border-slate-200 text-slate-600'}`}>
                    <Download size={18} className="mr-2" /> Download
                  </Button>
                </div>

                <div className={`flex items-center justify-between p-6 rounded-[2rem] border border-dashed transition-all hover:border-solid ${isDark ? 'border-white/10 hover:border-blue-500/30 hover:bg-white/5' : 'border-slate-200 hover:border-blue-500/30 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                      <FileJson size={24} />
                    </div>
                    <div>
                      <h4 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Growth Journals</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Backup as JSON</p>
                    </div>
                  </div>
                  <Button onClick={exportGalleryToJSON} variant="outline" className={`h-12 px-6 rounded-xl ${isDark ? 'border-white/10 text-slate-300 hover:text-white' : 'border-slate-200 text-slate-600'}`}>
                    <Download size={18} className="mr-2" /> Backup
                  </Button>
                </div>

                <div className={`flex items-center justify-between p-6 rounded-[2rem] border border-dashed transition-all hover:border-solid ${isDark ? 'border-white/10 hover:border-teal-500/30 hover:bg-white/5' : 'border-slate-200 hover:border-teal-500/30 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                      <Lock size={24} />
                    </div>
                    <div>
                      <h4 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Switch Mode</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Scientist / Admin</p>
                    </div>
                  </div>
                  <Button onClick={() => setIsRoleModalOpen(true)} variant="outline" className={`h-12 px-6 rounded-xl ${isDark ? 'border-white/10 text-slate-300 hover:text-white' : 'border-slate-200 text-slate-600'}`}>
                     Enter Access Code
                  </Button>
                </div>
              </div>

              <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 text-amber-600 dark:text-amber-400">
                 <ClipboardList className="shrink-0" size={20} />
                 <p className="text-xs font-medium leading-relaxed">
                   <strong>Note:</strong> Kilo a Ko'a operates without a central server to ensure privacy and offline accessibility.
                   Data is stored on this device. Please export regularly to prevent data loss.
                 </p>
              </div>
            </div>
          )}

          <RoleVerificationModal
            isOpen={isRoleModalOpen}
            onClose={() => setIsRoleModalOpen(false)}
            onVerify={handleRoleUpdate}
          />
        </div>
      </div>
    </div>
  );
};
