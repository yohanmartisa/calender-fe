'use client'
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './globals.css';
import EventModal from './components/EventModal';
import LoginComponent from './components/LoginComponent';

declare module 'react-big-calendar';

const localizer = momentLocalizer(moment);

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
        if (token) {
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
        }
      } catch (error) {
        console.error('Error fetching events:', error);
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
      setNewEvent({ start, end, title: '', description: '', person: '', id: 0, isRecurring: false, recurringFrequency: '', recurringDuration: 0 });
      setModalOpen(true);
    } else {
      alert('Please login to add events.');
    }
  };
  const addEvents = (newEvents: CalendarEvent[]) => {
    setEvents([...events, ...newEvents]);
  };
  const editEvents = (newEvents: CalendarEvent) => {
    setEvents([...events, newEvents]);
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
      <LoginComponent
        onLoginSuccess={(token) => {
          if (token) {
            setToken(token);
            localStorage.setItem('token', token);
          }
        }}
        token={token}
      />
      <div className="filter-container" style={{ display: 'flex', alignItems: 'center' }}>
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
            onUpdate={(newEvents: {id: number; title: string; description: string; person: string; start: Date; end: Date; }) => editEvents(newEvents as CalendarEvent)}
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
