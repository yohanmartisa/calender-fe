'use client'
import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import './globals.css';
import EventModal from './components/EventModal';
import LoginComponent from './components/LoginComponent';

declare module 'react-big-calendar';

const localizer = momentLocalizer(moment);

interface EventFormProps {
  onSave: (event: CalendarEvent) => void;
  event: CalendarEvent;
  onClose: () => void;
}
function EventForm({ onSave, event, onClose }: EventFormProps) {
  const [title, setTitle] = useState(event ? event.title : '');
  const [description, setDescription]  = useState(event ? event.description : '');
  const [person, setPerson]  = useState(event ? event.person : '');
  const [start, setStart] = useState(event ? event.start : new Date());
  const [end, setEnd] = useState(event ? event.end : new Date());
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('daily');
  const [recurringDuration, setRecurringDuration] = useState(1);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({
      ...event,
      title,
      start,
      end,
      isRecurring,
      recurringFrequency,
      recurringDuration,
    });
    onClose();
  }, [onSave, onClose, title, start, end, event, isRecurring, recurringFrequency, recurringDuration]);

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Event Title" />
      <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Event Description" />
      <input type="text" value={person} onChange={e => setPerson(e.target.value)} placeholder="Event Person" />
      <input type="datetime-local" value={start.toISOString().slice(0,16)} onChange={e => setStart(new Date(e.target.value))} />
      <input type="datetime-local" value={end.toISOString().slice(0,16)} onChange={e => setEnd(new Date(e.target.value))} />
      <input
        type="checkbox"
        checked={isRecurring}
        onChange={(e) => setIsRecurring(e.target.checked)}
      />
      <label>Recurring Event</label>
      {isRecurring && (
        <div>
          <select
            value={recurringFrequency}
            onChange={(e) => setRecurringFrequency(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <input
            type="number"
            value={recurringDuration}
            onChange={(e) => setRecurringDuration(parseInt(e.target.value))}
          />
          <label>Duration</label>
        </div>
      )}
      <button type="submit">Save</button>
      <button type="button" onClick={onClose}>Cancel</button>
    </form>
  );
}

interface CalendarEvent {
  start: Date;
  end: Date;
  title: string;
  description: string;
  id: number;
  person: string;
  isRecurring: boolean;
  recurringFrequency: string;
  recurringDuration: number;
}

function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<CalendarEvent | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [uniquePeople, setUniquePeople] = useState<string[]>([]);

  useEffect(() => {
    const cookieToken = localStorage.getItem('token')
    if (cookieToken) {
        setToken(cookieToken);
    }
  }, []);
  useEffect(() => {
    const uniquePeopleList = Array.isArray(events) ? [...new Set(events.map(event => event.person))] : [];
    setUniquePeople(uniquePeopleList);
  }, [events]);

  useEffect(() => {
    
    const fetchEvents = async () => {
      try {    
        const cookieToken = localStorage.getItem('token')
        if (cookieToken) {
          setToken(cookieToken);
        }
        const response = await fetch('http://localhost:3001/events', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
        });
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
      }
    };

    fetchEvents();
  }, [token]);
  
  const handleNavigate = (newDate: React.SetStateAction<Date>) => {
    setDate(newDate);
  };
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (token) {
      setNewEvent({ start, end, title: '', description: '', person: '', id: new Date().getTime(), isRecurring: false, recurringFrequency: '', recurringDuration: 0 });
      setModalOpen(true);
    } else {
      alert('Please login to add events.');
    }
  };
  const addEvents = (newEvents: CalendarEvent[]) => {
    setEvents([...events, ...newEvents]);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setModalOpen(false);
  };

  const handleDeleteEvent = (id: number) => {
    setEvents(prev => prev.filter(event => event.id !== id));
    setModalOpen(false);
  };

  const handlePersonSelect = (person: string) => {
    setSelectedPerson(person);
  };
  const filteredEvents = (Array.isArray(events)) ? events.filter(event => {
    const isPersonSelected = selectedPerson === '' || event.person === selectedPerson;
    const isTitleMatch = search.trim() === '' || event.title.toLowerCase().includes(search.toLowerCase());
    return isPersonSelected && isTitleMatch;
}) : [];
  return (
    <div>
      <LoginComponent onLoginSuccess={(token) => {
        setToken(token)}} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
        <input type="text" placeholder="Search events" onChange={e => setSearch(e.target.value)} />
        <select value={selectedPerson} onChange={e => handlePersonSelect(e.target.value)}>
          <option value="">All People</option>
          {uniquePeople.map(person => (
            <option key={person} value={person}>{person}</option>
          ))}
        </select>
      </div>
      <div style={{ height: 700 }}>
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          view={view} 
          date={date}
          onNavigate={handleNavigate}
          onView={(view: View) => setView(view)}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          startAccessor={(event) => new Date(event.start)}
          endAccessor={(event) => new Date(event.end)}
          style={{ height: 500 }}
        />
        {modalOpen && (
          <EventModal
            show={modalOpen}
            onSave={(newEvents: { title: string; description: string; person: string; start: Date; end: Date; }[]) => addEvents(newEvents as CalendarEvent[])}
            onDelete={handleDeleteEvent}
            onClose={handleCloseModal}
            initialEvent={selectedEvent || newEvent}
            existingEvents={events}
            token={token}
            />
        )}
      </div>
    </div>
  );
}

export default Home;