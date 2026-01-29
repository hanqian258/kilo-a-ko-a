import React, { useState, useEffect } from 'react';
import { User, Event, UserRole } from '../../types';
import { Button } from '../Button';
import { Calendar, MapPin, Clock, Users, Plus, X, CalendarCheck, Check } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, arrayUnion, arrayRemove, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';

interface EventsViewProps {
  user: User | null;
  onNavigateLogin: () => void;
  theme: 'light' | 'dark';
}

export const EventsView: React.FC<EventsViewProps> = ({ user, onNavigateLogin, theme }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });
  const [allUsers, setAllUsers] = useState<Record<string, User>>({});

  const isDark = theme === 'dark';
  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      // Filter out past events
      const upcoming = docs.filter(e => {
        const eventDate = new Date(`${e.date}T${e.time || '00:00'}`);
        // Keep events from today onwards
        const today = new Date();
        today.setHours(0,0,0,0);
        return eventDate >= today;
      });
      setEvents(upcoming);
    });
    return () => unsubscribe();
  }, []);

  // Fetch users for Admin View
  useEffect(() => {
    if (isAdmin) {
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
  }, [isAdmin]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;

    try {
      const newEvent: Omit<Event, 'id'> = {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        description: formData.description,
        attendees: []
      };
      await addDoc(collection(db, 'events'), newEvent);
      setIsCreatorOpen(false);
      setFormData({ title: '', date: '', time: '', location: '', description: '' });
    } catch (err) {
      console.error("Error creating event", err);
    }
  };

  const handleRSVP = async (event: Event) => {
    if (!user) {
      onNavigateLogin();
      return;
    }

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
    }
  };

  const handleCheckIn = async (userId: string, eventId: string) => {
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
  };

  const getGoogleCalendarUrl = (event: Event) => {
    // Format dates YYYYMMDDTHHMMSSZ
    const startStr = `${event.date.replace(/-/g, '')}T${event.time.replace(/:/g, '')}00`;

    // Construct simplified link
    const text = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description);
    const location = encodeURIComponent(event.location);
    const dates = `${startStr}/${startStr}`;

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}&sf=true&output=xml`;
  };

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
        {isAdmin && !isCreatorOpen && (
          <Button onClick={() => setIsCreatorOpen(true)} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest">
            <Plus size={20} className="mr-2" /> Create Event
          </Button>
        )}
      </div>

      {isCreatorOpen && (
        <div className={`p-8 rounded-[2.5rem] shadow-2xl border mb-12 animate-in slide-in-from-top-4 transition-colors duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className={`text-2xl font-black italic font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>New Event</h3>
            <button onClick={() => setIsCreatorOpen(false)} className="text-slate-500 hover:text-teal-500"><X size={28} /></button>
          </div>
          <form onSubmit={handleCreateEvent} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Event Title</label>
                <input
                  type="text"
                  className={`w-full p-5 border rounded-[1.5rem] focus:outline-none transition-all font-bold ${isDark ? 'bg-white/5 border-white/5 text-white focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Location</label>
                 <input
                  type="text"
                  className={`w-full p-5 border rounded-[1.5rem] focus:outline-none transition-all font-bold ${isDark ? 'bg-white/5 border-white/5 text-white focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Date</label>
                <input
                  type="date"
                  className={`w-full p-5 border rounded-[1.5rem] focus:outline-none transition-all font-bold ${isDark ? 'bg-white/5 border-white/5 text-white focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                  value={formData.date || ''}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Time</label>
                <input
                  type="time"
                  className={`w-full p-5 border rounded-[1.5rem] focus:outline-none transition-all font-bold ${isDark ? 'bg-white/5 border-white/5 text-white focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                  value={formData.time || ''}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Description</label>
              <textarea
                className={`w-full p-5 border rounded-[1.5rem] focus:outline-none transition-all font-medium h-32 resize-none ${isDark ? 'bg-white/5 border-white/5 text-slate-300 focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-600 focus:bg-white'}`}
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" className={`h-14 px-8 rounded-2xl ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`} onClick={() => setIsCreatorOpen(false)}>Cancel</Button>
              <Button type="submit" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest">Publish Event</Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-8">
        {events.length === 0 && (
          <div className={`text-center py-20 rounded-[3rem] border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <p className="font-medium italic">No upcoming events scheduled.</p>
          </div>
        )}

        {events.map((event) => {
          const isAttending = user && event.attendees.includes(user.id);

          return (
            <div key={event.id} className={`p-8 md:p-10 rounded-[3rem] shadow-2xl border flex flex-col md:flex-row gap-8 transition-colors duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
              <div className="flex-grow">
                 <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {event.time}</span>
                 </div>
                 <h3 className={`text-3xl font-black tracking-tight font-serif italic mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{event.title}</h3>
                 <div className={`flex items-start gap-2 mb-6 font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                    <MapPin size={20} className="shrink-0 mt-0.5" />
                    <span>{event.location}</span>
                 </div>
                 <p className={`leading-relaxed font-medium mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                   {event.description}
                 </p>

                 <div className="flex flex-wrap gap-4">
                    <Button
                       onClick={() => handleRSVP(event)}
                       variant={isAttending ? 'outline' : 'primary'}
                       className={`h-12 px-6 rounded-xl font-bold ${isAttending ? (isDark ? 'border-teal-500 text-teal-400' : 'border-teal-500 text-teal-600') : ''}`}
                    >
                       {isAttending ? (
                         <><Check size={18} className="mr-2" /> I'm Going</>
                       ) : (
                         "I'm Going"
                       )}
                    </Button>
                    <a
                      href={getGoogleCalendarUrl(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`h-12 px-6 rounded-xl font-bold flex items-center gap-2 border transition-all ${isDark ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Calendar size={18} /> Add to Calendar
                    </a>
                 </div>
              </div>

              <div className={`md:w-64 shrink-0 p-6 rounded-[2.5rem] border flex flex-col items-center justify-center text-center ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                 <div className="text-4xl font-black text-teal-500 mb-2">{event.attendees.length}</div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                   <Users size={12} /> Attendees
                 </div>
                 {isAdmin && (
                   <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 w-full text-left">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Guest List</p>
                     <div className="space-y-2 max-h-40 overflow-y-auto">
                         {event.attendees.map(attendeeId => {
                             const attendee = allUsers[attendeeId];
                             const isCheckedIn = attendee?.attendedEvents?.includes(event.id);
                             return (
                                 <div key={attendeeId} className="flex items-center justify-between text-xs gap-2">
                                     <span className={`font-bold truncate max-w-[100px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{attendee?.name || 'Loading...'}</span>
                                     <button
                                        onClick={() => handleCheckIn(attendeeId, event.id)}
                                        disabled={isCheckedIn}
                                        className={`px-2 py-1 rounded-md font-bold uppercase tracking-wider text-[10px] transition-colors ${
                                            isCheckedIn
                                            ? 'bg-green-500/10 text-green-500 cursor-default'
                                            : 'bg-slate-100 text-slate-600 hover:bg-teal-500 hover:text-white dark:bg-white/10 dark:text-slate-400 dark:hover:bg-teal-500'
                                        }`}
                                     >
                                        {isCheckedIn ? 'Present' : 'Check In'}
                                     </button>
                                 </div>
                             );
                         })}
                         {event.attendees.length === 0 && <p className="text-xs text-slate-400 italic">No RSVPs yet.</p>}
                     </div>
                   </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
