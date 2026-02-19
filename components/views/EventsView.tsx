import React, { useState, useEffect, useCallback } from 'react';
import { User, Event, UserRole } from '../../types';
import { Button } from '../Button';
import { Plus, X, CalendarCheck, Image as ImageIcon } from 'lucide-react';
import { updateDoc, doc, arrayUnion, arrayRemove, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { saveEvent, subscribeToEvents } from '../../utils/eventService';
import Editor from 'react-simple-wysiwyg';
import { compressImage } from '../../utils/imageProcessor';
import { EventCard } from '../EventCard';

interface EventsViewProps {
  user: User | null;
  onNavigateLogin: () => void;
  theme: 'light' | 'dark';
}

interface EventFormData {
  title: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'canceled';
  imageUrl: string;
}

export const EventsView: React.FC<EventsViewProps> = ({ user, onNavigateLogin, theme }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    description: '',
    status: 'upcoming',
    imageUrl: ''
  });
  const [allUsers, setAllUsers] = useState<Record<string, User>>({});
  const [rsvpLoadingId, setRsvpLoadingId] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    const unsubscribe = subscribeToEvents((docs) => {
      // If Admin, show ALL events (past & future). 
      // If User, show only UPCOMING events.
      if (user?.role === UserRole.ADMIN) {
        setEvents(docs);
      } else {
        const upcoming = docs.filter(e => {
          // Check if event is today or future.
           const eventDay = new Date(e.date);
           const todayDay = new Date();
           eventDay.setHours(0,0,0,0);
           todayDay.setHours(0,0,0,0);
           return eventDay >= todayDay;
        });
        setEvents(upcoming);
      }
    });
    return () => unsubscribe();
  }, [user?.role]);

// Fetch users for Admin View (Check-In Feature)
  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      const fetchUsers = async () => {
        try {
            const snap = await getDocs(collection(db, 'users'));
            const usersMap: Record<string, User> = {};
            snap.forEach(doc => {
                usersMap[doc.id] = { id: doc.id, ...doc.data() } as User;
            });
            setAllUsers(usersMap);
        } catch (e) {
            console.error("Failed to fetch users for admin view", e);
        }
      };
      fetchUsers();
    }
  }, [user?.role]);

  const handleCreateClick = () => {
    setEditingId(null);
    setFormData({
      title: '',
      date: '',
      time: '',
      endTime: '',
      location: '',
      description: '',
      status: 'upcoming',
      imageUrl: ''
    });
    setIsEditorOpen(true);
  };

  const handleEditClick = useCallback((event: Event) => {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      endTime: event.endTime || '',
      location: event.location,
      description: event.description,
      status: event.status || 'upcoming',
      imageUrl: event.imageUrl || ''
    });
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDeleteClick = useCallback(async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        // Direct Firestore delete to ensure it works immediately
        await deleteDoc(doc(db, 'events', id));
      } catch (err) {
        console.error("Error deleting event", err);
        alert("Failed to delete event.");
      }
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setFormData(prev => ({ ...prev, imageUrl: compressed }));
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to upload image.");
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;

    setIsSaving(true);
    try {
      const existingEvent = editingId ? events.find(ev => ev.id === editingId) : null;

      const eventToSave: Event = {
        id: editingId || Date.now().toString(),
        title: formData.title,
        date: formData.date,
        time: formData.time,
        endTime: formData.endTime,
        location: formData.location,
        description: formData.description,
        attendees: existingEvent ? existingEvent.attendees : [],
        status: formData.status,
        imageUrl: formData.imageUrl
      };

      await saveEvent(eventToSave);
      setIsEditorOpen(false);
      setEditingId(null);
      setFormData({ title: '', date: '', time: '', endTime: '', location: '', description: '', status: 'upcoming', imageUrl: '' });
    } catch (err) {
      console.error("Error saving event", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRSVP = useCallback(async (event: Event) => {
    if (!user) {
      onNavigateLogin();
      return;
    }

    setRsvpLoadingId(event.id);
    const isGoing = event.attendees.includes(user.id);
    const eventRef = doc(db, 'events', event.id);

    try {
      if (isGoing) {
        await updateDoc(eventRef, {
          attendees: arrayRemove(user.id)
        });
      } else {
        await updateDoc(eventRef, {
          attendees: arrayUnion(user.id)
        });
      }
    } catch (err) {
      console.error("Error updating RSVP", err);
    } finally {
      setRsvpLoadingId(null);
    }
  }, [user, onNavigateLogin]);

  const handleCheckIn = useCallback(async (userId: string, eventId: string) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            attendedEvents: arrayUnion(eventId)
        });
        // Optimistic update
        setAllUsers(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                attendedEvents: [...(prev[userId].attendedEvents || []), eventId]
            }
        }));
    } catch (e) {
        console.error("Check-in failed", e);
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto pb-32">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b pb-8 gap-6 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-4xl font-black tracking-tight font-serif italic ${isDark ? 'text-white' : 'text-slate-900'}`}>Community Events</h2>
          <p className={`flex items-center gap-2 text-lg mt-2 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            <CalendarCheck size={20} className="text-teal-500" />
            Join us in the field.
          </p>
        </div>
        {isAdmin && !isEditorOpen && (
          <Button onClick={handleCreateClick} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest">
            <Plus size={20} className="mr-2" /> Create Event
          </Button>
        )}
      </div>

      {isEditorOpen && (
        <div className={`p-8 rounded-[2.5rem] shadow-2xl border mb-12 animate-in slide-in-from-top-4 transition-colors duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className={`text-2xl font-black italic font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>{editingId ? 'Edit Event' : 'New Event'}</h3>
            <button onClick={() => setIsEditorOpen(false)} className="text-slate-500 hover:text-teal-500" aria-label="Close editor" title="Close"><X size={28} /></button>
          </div>
          <form onSubmit={handleSaveEvent} className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
               <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.status === 'canceled' ? 'bg-red-500' : 'bg-slate-300'}`} onClick={() => setFormData(p => ({...p, status: p.status === 'canceled' ? 'upcoming' : 'canceled'}))}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.status === 'canceled' ? 'translate-x-6' : ''}`}></div>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Mark as Canceled</span>
               </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="event-title" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Event Title</label>
                <input
                  id="event-title"
                  type="text"
                  className={`w-full p-5 border rounded-[1.5rem] focus:outline-none transition-all font-bold ${isDark ? 'bg-white/5 border-white/5 text-white focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label htmlFor="event-location" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Location</label>
                 <input
                  id="event-location"
                  type="text"
                  className={`w-full p-5 border rounded-[1.5rem] focus:outline-none transition-all font-bold ${isDark ? 'bg-white/5 border-white/5 text-white focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="event-date" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Date</label>
                <input
                  id="event-date"
                  type="date"
                  className={`w-full p-5 border rounded-[1.5rem] focus:outline-none transition-all font-bold ${isDark ? 'bg-white/5 border-white/5 text-white focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                  value={formData.date || ''}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label htmlFor="event-time" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Start Time</label>
                <input
                  id="event-time"
                  type="time"
                  className={`w-full p-5 border rounded-[1.5rem] focus:outline-none transition-all font-bold ${isDark ? 'bg-white/5 border-white/5 text-white focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                  value={formData.time || ''}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  required
                />
              </div>
              <div>
                <label htmlFor="event-end-time" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">End Time</label>
                <input
                  id="event-end-time"
                  type="time"
                  className={`w-full p-5 border rounded-[1.5rem] focus:outline-none transition-all font-bold ${isDark ? 'bg-white/5 border-white/5 text-white focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                  value={formData.endTime || ''}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>

            <div>
               <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Cover Image</label>
               <div className="flex items-center gap-6">
                  {formData.imageUrl && (
                      <div className="w-32 h-20 rounded-xl overflow-hidden shadow-lg border border-slate-200">
                          <img src={formData.imageUrl} alt="Event cover" className="w-full h-full object-cover" />
                      </div>
                  )}
                  <div className="relative">
                      <input type="file" id="event-img" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      <Button type="button" variant="outline" onClick={() => document.getElementById('event-img')?.click()} className={`h-12 px-6 rounded-xl ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                          <ImageIcon size={18} className="mr-2" /> {formData.imageUrl ? 'Change Image' : 'Upload Image'}
                      </Button>
                  </div>
               </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Description</label>
              <div className={`rounded-[1.5rem] overflow-hidden border ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <Editor
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  containerProps={{ style: { height: '200px', border: 'none' } }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" className={`h-14 px-8 rounded-2xl ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`} onClick={() => setIsEditorOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={isSaving} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest">{editingId ? 'Update Event' : 'Publish Event'}</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
            <EventCard
                key={event.id}
                event={event}
                user={user}
                isAdmin={isAdmin}
                isRsvpLoading={rsvpLoadingId === event.id}
                isDark={isDark}
                allUsers={allUsers}
                onRSVP={handleRSVP}
                onCheckIn={handleCheckIn}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />
        ))}
      </div>
    </div>
  );
};
