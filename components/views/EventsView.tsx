import React, { useState, useEffect } from 'react';
import { User, Event, UserRole } from '../../types';
import { Button } from '../Button';
import { Calendar, MapPin, Clock, Users, Plus, X, CalendarCheck, Check, Edit2, Trash2, Upload, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { collection, updateDoc, doc, arrayUnion, arrayRemove, onSnapshot, query, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { saveEvent } from '../../utils/eventService';
import Editor from 'react-simple-wysiwyg';
import DOMPurify from 'dompurify';
import { compressImage } from '../../utils/imageProcessor';

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
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      
      // If Admin, show ALL events (past & future). 
      // If User, show only UPCOMING events.
      if (user?.role === UserRole.ADMIN) {
        setEvents(docs);
      } else {
        const upcoming = docs.filter(e => {
          const eventDate = new Date(`${e.date}T${e.time || '00:00'}`);
          const today = new Date();
          // Check if event is today or future.
          // Note: Logic allows "Ongoing" to show up as long as it's effectively "today" or later.
          // Precise logic: Event end time > now.
          // If no end time, assume end of day? Or start time + duration.
          // Simple check: Date >= Today (ignoring time for list filtering to be inclusive)
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

  const handleEditClick = (event: Event) => {
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
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        // Direct Firestore delete to ensure it works immediately
        await deleteDoc(doc(db, 'events', id));
      } catch (err) {
        console.error("Error deleting event", err);
        alert("Failed to delete event.");
      }
    }
  };

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
    }
  };

  const handleRSVP = async (event: Event) => {
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
    const startStr = `${event.date.replace(/-/g, '')}T${event.time ? event.time.replace(/:/g, '') : '0000'}00`;
    let endStr = startStr;
    if (event.endTime) {
        endStr = `${event.date.replace(/-/g, '')}T${event.endTime.replace(/:/g, '')}00`;
    } else {
        // Default 1 hour
        // Not easily calculating +1 hr on formatted string without Date obj.
        // Just use startStr/startStr which Google Cal defaults to 1 hr.
    }

    // Clean description for URL
    const text = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description.replace(/<[^>]*>?/gm, '')); // Strip HTML for calendar details
    const location = encodeURIComponent(event.location);
    const dates = `${startStr}/${endStr}`;

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}&sf=true&output=xml`;
  };

  const getEventStatus = (event: Event) => {
    if (event.status === 'canceled') return 'canceled';

    const now = new Date();
    const start = new Date(`${event.date}T${event.time || '00:00'}`);
    // If we have endTime, use it. Else assume 2 hours.
    const end = event.endTime
        ? new Date(`${event.date}T${event.endTime}`)
        : new Date(start.getTime() + 2 * 60 * 60 * 1000);

    if (now >= start && now <= end) return 'ongoing';
    if (now < start) return 'upcoming';
    return 'past'; // or completed
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
            <button onClick={() => setIsEditorOpen(false)} className="text-slate-500 hover:text-teal-500" aria-label="Close editor" title="Close editor"><X size={28} /></button>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Start Time</label>
                <input
                  type="time"
                  className={`w-full p-5 border rounded-[1.5rem] focus:outline-none transition-all font-bold ${isDark ? 'bg-white/5 border-white/5 text-white focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                  value={formData.time || ''}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">End Time</label>
                <input
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
              <Button type="submit" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest">{editingId ? 'Update Event' : 'Publish Event'}</Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-8">
        {events.length === 0 && (
          <div className={`text-center py-20 rounded-[3rem] border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <p className="font-medium italic">No events found.</p>
          </div>
        )}

        {events.map((event) => {
          const isAttending = user && event.attendees.includes(user.id);
          const status = getEventStatus(event);

          return (
            <div key={event.id} className={`p-8 md:p-10 rounded-[3rem] shadow-2xl border flex flex-col md:flex-row gap-8 transition-colors duration-500 overflow-hidden relative ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>

              {/* Status Badge */}
              {status !== 'past' && (
                 <div className={`absolute top-0 right-0 px-6 py-3 rounded-bl-[2.5rem] font-black uppercase tracking-widest text-[10px] flex items-center gap-2 ${
                    status === 'canceled' ? 'bg-red-500 text-white' :
                    status === 'ongoing' ? 'bg-teal-500 text-white' :
                    (isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500')
                 }`}>
                    {status === 'canceled' && <AlertTriangle size={12} />}
                    {status === 'ongoing' && <Clock size={12} className="animate-pulse" />}
                    {status}
                 </div>
              )}

              {event.imageUrl && (
                  <div className="md:w-64 h-48 md:h-auto rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 dark:border-white/5 shrink-0">
                      <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  </div>
              )}

              <div className="flex-grow">
                 <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 mt-2">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {event.time} {event.endTime ? `- ${event.endTime}` : ''}</span>
                 </div>

                 <div className="flex items-start justify-between">
                    <h3 className={`text-3xl font-black tracking-tight font-serif italic mb-4 ${isDark ? 'text-white' : 'text-slate-900'} ${status === 'canceled' ? 'line-through opacity-50' : ''}`}>{event.title}</h3>
                 </div>

                 <div className={`flex items-start gap-2 mb-6 font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                    <MapPin size={20} className="shrink-0 mt-0.5" />
                    <span>{event.location}</span>
                 </div>

                 {/* Safe HTML Rendering */}
                 <div
                   className={`prose prose-sm md:prose-base max-w-none mb-8 ${isDark ? 'prose-invert text-slate-400' : 'text-slate-600'}`}
                   dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }}
                 />

                 <div className="flex flex-wrap gap-4 items-center">
                    {status !== 'canceled' && (
                        <>
                            <Button
                                onClick={() => handleRSVP(event)}
                                isLoading={rsvpLoadingId === event.id}
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
                        </>
                    )}

                    {isAdmin && (
                      <div className="flex gap-2 ml-auto">
                         <button onClick={() => handleEditClick(event)} className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-500 p-2.5 rounded-xl transition-all" aria-label="Edit event" title="Edit event"><Edit2 size={16} /></button>
                         <button onClick={() => handleDeleteClick(event.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2.5 rounded-xl transition-all" aria-label="Delete event" title="Delete event"><Trash2 size={16} /></button>
                      </div>
                    )}
                 </div>
              </div>

              <div className={`md:w-56 shrink-0 p-6 rounded-[2.5rem] border flex flex-col items-center justify-center text-center ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
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
