import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useFacility } from '../../contexts/FacilityContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const MaintenanceCalendar = () => {
  const navigate = useNavigate();
  const { selectedFacilityId } = useFacility();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      let url = `/maintenance/work-orders/calendar?year=${year}&month=${month + 1}`;
      if (selectedFacilityId) url += `&facility=${selectedFacilityId}`;
      const res = await api.get(url);
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Failed to load maintenance calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [year, month, selectedFacilityId]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar math
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Maintenance & Inspection Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Scheduled calibration routines, statutory vessel examinations, and preventative tasks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-white dark:bg-slate-900">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-xs text-slate-800 dark:text-slate-200 min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Days of Week */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center py-2.5 text-xs font-semibold text-slate-500">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/60 auto-rows-fr">
          {/* Leading blank days */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[110px] p-2 bg-slate-50/30 dark:bg-slate-950/20" />
          ))}

          {/* Month days */}
          {Array.from({ length: daysInMonth }).map((_, dIdx) => {
            const dayNum = dIdx + 1;
            const dayDate = new Date(year, month, dayNum);
            const isToday =
              dayNum === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            // Match work orders due on this day
            const dayOrders = events.filter((e) => {
              const d = new Date(e.dueDate);
              return (
                d.getDate() === dayNum &&
                d.getMonth() === month &&
                d.getFullYear() === year
              );
            });

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[110px] p-2 transition-colors flex flex-col justify-between ${
                  isToday ? 'bg-teal-50/20 dark:bg-teal-950/10' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-mono font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayOrders.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {dayOrders.length} task{dayOrders.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-20">
                  {dayOrders.map((order) => (
                    <div
                      key={order._id}
                      onClick={() => navigate(`/maintenance/work-orders/${order._id}`)}
                      className="p-1 rounded text-[10px] truncate border cursor-pointer transition-transform hover:scale-[1.02] bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800/50 text-teal-800 dark:text-teal-300"
                      title={`${order.workOrderNumber}: ${order.title}`}
                    >
                      <strong className="font-mono">{order.workOrderNumber}</strong>: {order.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
