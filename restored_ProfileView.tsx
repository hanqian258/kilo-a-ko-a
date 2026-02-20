import React, { useState, useEffect } from 'react';
import { User, UserRole, CoralImage } from '../../types';
import { Button } from '../Button';
import { User as UserIcon, ClipboardList, Download, FileJson, Lock, Sprout, Shield, MapPin, BookOpen } from 'lucide-react';
import { exportGalleryToJSON } from '../../utils/storage';
import { getSurveyCount, downloadSurveyData } from '../../utils/exportService';
import { RoleVerificationModal } from '../RoleVerificationModal';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { subscribeToUserGallery } from '../../utils/galleryService';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
  theme: 'light' | 'dark';
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser, theme }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'settings' | 'responses'>('overview');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [userImages, setUserImages] = useState<CoralImage[]>([]);
  const [surveyCount, setSurveyCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (activeTab === 'responses' && user.role === UserRole.ADMIN) {
      setIsLoadingCount(true);
      getSurveyCount().then(count => {
        setSurveyCount(count);
        setIsLoadingCount(false);
      });
    }
  }, [activeTab, user.role]);

  useEffect(() => {
    if (user.id) {
        const unsubscribe = subscribeToUserGallery(user.id, (images) => {
            setUserImages(images);
        });
        return () => unsubscribe();
    }
  }, [user.id]);

  const handleRoleUpdate = async (newRole: UserRole) => {
    const updatedUser = { ...user, role: newRole };
    onUpdateUser(updatedUser);

    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, { role: newRole }, { merge: true });
    } catch (error) {
      console.error("Failed to update role in Firestore", error);
    }
  };

  const badges = [
    {
      id: 'founder',
      title: 'The Founder',
      description: 'Joined the Kilo a Ko\'a community.',
      icon: Sprout,
      isUnlocked: true,
    },
    {
      id: 'guardian',
      title: 'Guardian',
      description: 'Verified Administrator access granted.',
      icon: Shield,
      isUnlocked: user.role === UserRole.ADMIN,
    },
    {
      id: 'researcher',
      title: 'Field Researcher',
      description: 'Checked in at an in-person booth event.',
      icon: MapPin,
      isUnlocked: (user.attendedEvents?.length || 0) > 0,
    },
    {
      id: 'scholar',
      title: 'Coral Scholar',
      description: 'Read 5 educational articles.',
      icon: BookOpen,
      isUnlocked: (user.readArticles?.length || 0) >= 5,
    }
  ];

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
            <span className="block text-3xl font-black text-blue-500 tracking-tighter leading-none mb-1">{userImages.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Adoptions</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-72 flex-shrink-0">
          <nav className={`rounded-[2.5rem] shadow-2xl border overflow-hidden p-2 transition-colors duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
            {['overview', 'achievements', 'settings'].map((tab) => (
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
                {tab === 'achievements' && 'Achievements'}
                {tab === 'settings' && 'Data Management'}
              </button>
            ))}
            {user.role === UserRole.ADMIN && (
              <button
                onClick={() => setActiveTab('responses')}
                className={`w-full px-6 py-4 text-left text-sm font-black uppercase tracking-widest rounded-2xl transition-all mt-1 ${
                  activeTab === 'responses'
                    ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20'
                    : (isDark ? 'text-slate-500 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50')
                }`}
              >
                Survey Responses
              </button>
            )}
          </nav>
        </div>

        <div className="flex-grow">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500">
              {userImages.length === 0 && (
                 <div className={`col-span-full text-center py-20 rounded-[3rem] border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                    <p className="font-medium italic">No coral observations yet. Visit the Kilo page to explore more!</p>
                 </div>
              )}
              {userImages.map((img) => (
                <div key={img.id} className={`rounded-[2.5rem] overflow-hidden shadow-2xl border group transition-all duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
                  <div className="h-64 overflow-hidden relative">
                    <img src={img.url} alt="Coral update" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl">
                      {img.date}
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className={`text-2xl font-black italic font-serif mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{img.scientificName || "Scientific Name"}</h3>
                    <p className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                       <MapPin size={16} /> {img.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="animate-in slide-in-from-right-4 duration-500">
               <h3 className={`text-2xl font-black italic font-serif mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>Your Impact</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {badges.map(badge => (
                     <div key={badge.id} className={`relative p-6 rounded-[2rem] border transition-all duration-500 flex flex-col items-center text-center group ${
                        badge.isUnlocked
                           ? (isDark ? 'bg-teal-500/10 border-teal-500/50 shadow-[0_0_30px_-10px_rgba(20,184,166,0.3)]' : 'bg-teal-50 border-teal-200 shadow-xl shadow-teal-500/10')
                           : (isDark ? 'bg-white/5 border-white/5 opacity-50 grayscale' : 'bg-slate-50 border-slate-100 opacity-50 grayscale')
                     }`}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
                            badge.isUnlocked
                              ? (isDark ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/40' : 'bg-teal-500 text-white shadow-lg shadow-teal-500/30')
                              : (isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-400')
                        }`}>
                            <badge.icon size={32} strokeWidth={1.5} />
                        </div>
                        <h4 className={`font-black text-xs uppercase tracking-widest mb-2 ${badge.isUnlocked ? (isDark ? 'text-teal-400' : 'text-teal-700') : 'text-slate-500'}`}>
                            {badge.title}
                        </h4>
                        <p className={`text-[10px] font-bold leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {badge.description}
                        </p>
                        {!badge.isUnlocked && (
                            <div className="absolute top-4 right-4 text-slate-500">
                                <Lock size={14} />
                            </div>
                        )}
                     </div>
                  ))}
                </div>
              </div>
          )}

          {activeTab === 'responses' && user.role === UserRole.ADMIN && (
            <div className={`p-10 rounded-[2.5rem] shadow-xl border animate-in fade-in slide-in-from-bottom-4 duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
              <h3 className={`text-2xl font-black italic font-serif mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>Survey Responses</h3>

              <div className="grid grid-cols-1 gap-6">
                <div className={`flex items-center justify-between p-6 rounded-[2rem] border border-dashed transition-all hover:border-solid ${isDark ? 'border-white/10 hover:border-teal-500/30 hover:bg-white/5' : 'border-slate-200 hover:border-teal-500/30 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${isDark ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                      <ClipboardList size={24} />
                    </div>
                    <div>
                      <h4 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Data Dashboard</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        {isLoadingCount ? 'Loading...' : `Total Submissions: ${surveyCount !== null ? surveyCount : '-'}`}
                      </p>
                    </div>
                  </div>
                  <Button onClick={downloadSurveyData} className={`h-12 px-6 rounded-xl`}>
                    <Download size={18} className="mr-2" /> Download CSV
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className={`p-10 rounded-[2.5rem] shadow-xl border animate-in fade-in slide-in-from-bottom-4 duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
              <h3 className={`text-2xl font-black italic font-serif mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>Data Management</h3>

              <div className="grid grid-cols-1 gap-6">
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
