'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Check, Trash2 } from 'lucide-react';
import { Appointment, Client } from '@/types/admin';

interface AppointmentsBoardProps {
  mode: 'portal' | 'admin';
  ambassadorId?: string; // Required for admin, optional for portal (if not passed, backend uses session)
  initialAppointments: Appointment[];
  clients?: Client[]; // For the dropdown
}

export default function AppointmentsBoard({ 
  mode, 
  ambassadorId, 
  initialAppointments,
  clients = []
}: AppointmentsBoardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState(''); // Added end time support
  const [notes, setNotes] = useState('');

  // Determine API base URL
  const getApiUrl = () => {
    if (mode === 'admin') {
      if (!ambassadorId) throw new Error('Ambassador ID required for admin mode');
      return `/api/admin/ambassadors/${ambassadorId}/appointments`;
    }
    return '/api/appointments';
  };

  const getDetailApiUrl = (id: string) => {
    if (mode === 'admin') {
      return `/api/admin/appointments/${id}`;
    }
    return `/api/appointments/${id}`;
  };

  const openModal = (apt?: Appointment, defaultDate?: Date) => {
    if (apt) {
      setEditingId(apt.id);
      setTitle(apt.title);
      setClientId(apt.client_id || '');
      
      const start = new Date(apt.start_at);
      const end = new Date(apt.end_at);
      
      setDate(start.toISOString().split('T')[0]);
      setTime(start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      setEndTime(end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      setNotes(apt.notes || '');
    } else {
      setEditingId(null);
      setTitle('');
      setClientId('');
      
      const targetDate = defaultDate || new Date();
      setDate(targetDate.toISOString().split('T')[0]);
      
      // Default time: next hour
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      
      // Default duration: 1 hour
      const end = new Date(now);
      end.setHours(end.getHours() + 1);
      setEndTime(end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startAt = new Date(`${date}T${time}`).toISOString();
      const endAt = new Date(`${date}T${endTime}`).toISOString();

      if (new Date(endAt) <= new Date(startAt)) {
        alert('End time must be after start time');
        setLoading(false);
        return;
      }

      const payload = {
        title,
        client_id: clientId || null,
        start_at: startAt,
        end_at: endAt,
        notes
      };

      if (editingId) {
        await fetch(getDetailApiUrl(editingId), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(getApiUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error saving appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'cancelled' | 'done') => {
    if (!confirm(`Are you sure you want to mark this as ${newStatus}?`)) return;
    
    try {
      await fetch(getDetailApiUrl(id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      router.refresh();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment? This cannot be undone.')) return;

    try {
      await fetch(getDetailApiUrl(id), {
        method: 'DELETE'
      });
      router.refresh();
    } catch (error) {
      alert('Error deleting appointment');
    }
  };

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty cells for days before start of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[100px] border-b border-r bg-gray-50/30"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDayDate = new Date(year, month, day);
      const isToday = new Date().toDateString() === currentDayDate.toDateString();
      
      const dayAppointments = (initialAppointments || []).filter(apt => {
        const aptDate = new Date(apt.start_at);
        return aptDate.getDate() === day && 
               aptDate.getMonth() === month && 
               aptDate.getFullYear() === year &&
               apt.status !== 'cancelled'; // Optionally hide cancelled in calendar
      });

      days.push(
        <div key={day} className={`min-h-[100px] border-b border-r p-2 relative group hover:bg-gray-50 transition-colors ${isToday ? 'bg-blue-50/30' : ''}`}>
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-[80px]">
            {dayAppointments.map(apt => (
              <div 
                key={apt.id}
                onClick={(e) => { e.stopPropagation(); openModal(apt); }}
                className={`text-xs p-1.5 rounded border truncate cursor-pointer transition-shadow hover:shadow-sm ${
                  apt.status === 'done' ? 'bg-green-50 border-green-100 text-green-700' :
                  'bg-blue-50 border-blue-100 text-blue-700'
                }`}
                title={`${apt.title} - ${new Date(apt.start_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
              >
                {new Date(apt.start_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} {apt.title}
              </div>
            ))}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              openModal(undefined, currentDayDate);
            }}
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-full transition-opacity"
          >
            <Plus size={14} className="text-gray-500" />
          </button>
        </div>
      );
    }

    return days;
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          {mode === 'admin' && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">Viewing as Admin</span>}
        </div>
        <div className="flex gap-3">
          <div className="bg-gray-100 p-1 rounded-lg flex text-sm">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm font-medium' : 'text-gray-500 hover:text-gray-900'}`}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm font-medium' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Calendar
            </button>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 shadow-sm text-sm font-medium"
          >
            <Plus size={18} />
            New Appointment
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex-1 flex flex-col min-h-[600px]">
          {/* Calendar Header */}
          <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-gray-200 transition-all">
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-gray-200 transition-all">
                Today
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-gray-200 transition-all">
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 border-b bg-gray-50 text-xs font-semibold text-gray-500 text-center py-2">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 bg-white flex-1 auto-rows-fr border-l border-t">
            {renderCalendar()}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase">
                <tr>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date & Time</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Notes</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(!initialAppointments || initialAppointments.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  initialAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'done' ? 'bg-green-100 text-green-800' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon size={16} className="text-gray-400" />
                          {new Date(apt.start_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <Clock size={16} className="text-gray-400" />
                          {new Date(apt.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(apt.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {apt.title}
                      </td>
                      <td className="px-6 py-4">
                        {apt.client_id ? (clients.find(c => c.id === apt.client_id)?.name || 'Unknown Client') : (apt.client_name || '-')}
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{apt.notes}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {apt.status !== 'cancelled' && (
                             <>
                                {apt.status !== 'done' && (
                                    <button 
                                        onClick={() => handleStatusChange(apt.id, 'done')}
                                        className="text-green-600 hover:bg-green-50 p-1.5 rounded"
                                        title="Mark Done"
                                    >
                                        <Check size={16} />
                                    </button>
                                )}
                                <button 
                                    onClick={() => openModal(apt)}
                                    className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"
                                    title="Edit"
                                >
                                    <CalendarIcon size={16} />
                                </button>
                                <button 
                                    onClick={() => handleStatusChange(apt.id, 'cancelled')}
                                    className="text-red-600 hover:bg-red-50 p-1.5 rounded"
                                    title="Cancel"
                                >
                                    <X size={16} />
                                </button>
                             </>
                          )}
                          <button 
                            onClick={() => handleDelete(apt.id)}
                            className="text-gray-400 hover:text-red-600 p-1.5 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{editingId ? 'Edit Appointment' : 'New Appointment'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. Weekly Review"
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Client (Optional)</label>
                <select 
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">-- Select Client --</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required 
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">Start</label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required 
                  />
                </div>
                 <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">End</label>
                  <input 
                    type="time" 
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2.5 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Meeting agenda..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium shadow-sm"
                >
                  {loading ? 'Saving...' : 'Save Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
