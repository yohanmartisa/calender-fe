import React, { useState } from 'react';
import '../globals.css'

interface EventModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (events: { title: string; description: string; person: string; start: Date; end: Date }[]) => void;
  onDelete: (id: number) => void;
  initialEvent: {
    id: number; title: string; description: string; person: string; start: Date; end: Date 
} | null;
  existingEvents: { id: number; start: Date; end: Date }[];
  token: string;
}
const EventModal = ({ show, onClose, onDelete, onSave, initialEvent, existingEvents, token }: EventModalProps) => {
  const [id, setId] = useState(initialEvent ? initialEvent.id : 0);
  const [title, setTitle] = useState(initialEvent ? initialEvent.title : '');
  const [description, setDescription] = useState(initialEvent ? initialEvent.description : '');
  const [person, setPerson] = useState(initialEvent ? initialEvent.person : '');
  const [start, setStart] = useState(initialEvent ? new Date(initialEvent.start) : new Date());
  const [end, setEnd] = useState(initialEvent ? new Date(initialEvent.end) : new Date());
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('daily');
  const [recurringDuration, setRecurringDuration] = useState(1);
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
        if (isRecurring) {
            const recurringEvents = generateRecurringEvents({ title, description, person, start, end, isRecurring, recurringFrequency, recurringDuration });
            await fetch('http://localhost:3001/events', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(recurringEvents),
            });
            window.location.reload();

            onSave(recurringEvents);
        } else {
          const data = await fetch('http://localhost:3001/events', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify([{ title, description, person, start, end }]),
            });
            window.location.reload();
            onSave([{ title, description, person, start, end }]);
        }
        window.location.reload();
        onClose();
  };

  const handleDelete = async () => {
    console.log(initialEvent);
    if (initialEvent) {
      const response = await fetch(`http://localhost:3001/events/${initialEvent.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      });

      if (response.ok) {
        onDelete(initialEvent.id);
        onClose();
      }
    }
  };


  const generateRecurringEvents = (event: { title: string; description: string; person: string; start: Date; end: Date; isRecurring: boolean; recurringFrequency: string; recurringDuration: number}) => {
    const recurringEvents: { title: string; description: string; person: string; start: Date; end: Date }[] = [];
    let currentDate = new Date(event.start);
    let duration = 0;
    switch (recurringFrequency) {
      case 'daily':
        duration = recurringDuration;
        break;
        case 'weekly':
          duration = recurringDuration * 7;
          break;
        case 'monthly':
          duration = recurringDuration * 30;
          break;
        default:
          break;
    }
    if (duration !== undefined) {
      for (let i = 0; i < duration; i++) {
        const newEvent = { title: event.title, description: event.description, person: event.person, start: new Date(currentDate), end: new Date(currentDate) };
        recurringEvents.push(newEvent);
          currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    return recurringEvents;
  };

  return (
    <div className="modal">
      <form>
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
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add title"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add description"
        />
        <input
          type="text"
          value={person}
          onChange={(e) => setPerson(e.target.value)}
          placeholder="Add person"
        />
        <input
          type="datetime-local"
          value={start.toISOString().slice(0, 16)}
          onChange={(e) => setStart(new Date(e.target.value))}
        />
        <input
          type="datetime-local"
          value={end.toISOString().slice(0, 16)}
          onChange={(e) => setEnd(new Date(e.target.value))}
        />
        <button type="submit" onClick={handleSubmit as any}>Save</button>
        <button type="button" onClick={onClose as any}>Cancel</button>
        <button type="button" onClick={handleDelete as any}>Delete</button>
      </form>
    </div>
  );
};

export default EventModal;