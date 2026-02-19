import React, { useMemo } from 'react';
import { User, Event } from '../types';
import { Button } from './Button';
import { Calendar, MapPin, Clock, Users, Check, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import DOMPurify from 'dompurify';

interface EventCardProps {
  event: Event;
  user: User | null;
  isDark: boolean;
  isAdmin: boolean;
  isRsvpLoading?: boolean;
  allUsers: Record<string, User>;
  onRSVP: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
  onCheckIn: (userId: string, eventId: string) => void;
}

const getEventStatus = (event: Event) => {
  if (event.status === 'canceled') return 'canceled';

  const now = new Date();
  const start = new Date(`${event.date}T${event.time || '00:00'}`);
  const end = event.endTime
      ? new Date(`${event.date}T${event.endTime}`)
      : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  if (now >= start && now <= end) return 'ongoing';
  if (now < start) return 'upcoming';
  return 'past';
};

const getGoogleCalendarUrl = (event: Event) => {
  const startStr = `${event.date.replace(/-/g, '')}T${event.time ? event.time.replace(/:/g, '') : '0000'}00`;
  let endStr = startStr;
  if (event.endTime) {
      endStr = `${event.date.replace(/-/g, '')}T${event.endTime.replace(/:/g, '')}00`;
  }

  const text = encodeURIComponent(event.title);
  const details = encodeURIComponent(event.description.replace(/<[^>]*>?/gm, ''));
  const location = encodeURIComponent(event.location);
  const dates = `${startStr}/${endStr}`;

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}&sf=true&output=xml`;
};

export const EventCard = React.memo(({
  event,
  user,
  isDark,
  isAdmin,
  isRsvpLoading,
  allUsers,
  onRSVP,
  onEdit,
  onDelete,
  onCheckIn
}: EventCardProps) => {
  const isAttending = user && event.attendees.includes(user.id);
  const status = getEventStatus(event);

  // Memoize sanitized HTML to prevent re-sanitization on every render if description hasn't changed
  const sanitizedDescription = useMemo(() => ({
    __html: DOMPurify.sanitize(event.description)
  }), [event.description]);

  return (
    <div className={`p-8 md:p-10 rounded-[3rem] shadow-2xl border flex flex-col md:flex-row gap-8 transition-colors duration-500 overflow-hidden relative ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>

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
            dangerouslySetInnerHTML={sanitizedDescription}
          />

          <div className="flex flex-wrap gap-4 items-center">
            {status !== 'canceled' && (
                <>
                    <Button
                        onClick={() => onRSVP(event)}
                        isLoading={isRsvpLoading}
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
                  <button onClick={() => onEdit(event)} className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-500 p-2.5 rounded-xl transition-all" aria-label="Edit event" title="Edit event"><Edit2 size={16} /></button>
                  <button onClick={() => onDelete(event.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2.5 rounded-xl transition-all" aria-label="Delete event" title="Delete event"><Trash2 size={16} /></button>
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
                                onClick={() => onCheckIn(attendeeId, event.id)}
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
});
