import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, Radio, AlertTriangle, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
        if (res.success) {
          setResults(res.results);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url) => {
    onClose();
    navigate(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative mx-auto max-w-2xl transform divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all">
        {/* Search Input */}
        <div className="relative flex items-center px-4">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a facility name, sensor ID, alert code, or document..."
            className="h-14 w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-teal-600 mr-2" />}
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 text-xs">
          {!results && !loading && (
            <div className="py-10 text-center text-slate-400">
              Search by typing facility (e.g. "Mojave"), sensor (e.g. "SEN-MOJ"), alerts, or work orders.
            </div>
          )}

          {results && (
            <div className="space-y-4">
              {/* Facilities */}
              {results.facilities?.length > 0 && (
                <div>
                  <div className="px-3 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                    Facilities
                  </div>
                  {results.facilities.map((f) => (
                    <div
                      key={f._id}
                      onClick={() => handleSelect(`/facilities/${f._id}`)}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-teal-600" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{f.name}</span>
                        <span className="text-slate-400">({f.code})</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600" />
                    </div>
                  ))}
                </div>
              )}

              {/* Sensors */}
              {results.sensors?.length > 0 && (
                <div>
                  <div className="px-3 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                    Sensors
                  </div>
                  {results.sensors.map((s) => (
                    <div
                      key={s._id}
                      onClick={() => handleSelect(`/sensors/${s._id}`)}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Radio className="w-4 h-4 text-sky-600" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{s.sensorId}</span>
                        <span className="text-slate-500">{s.name} ({s.type})</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600" />
                    </div>
                  ))}
                </div>
              )}

              {/* Alerts */}
              {results.alerts?.length > 0 && (
                <div>
                  <div className="px-3 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                    Alerts
                  </div>
                  {results.alerts.map((a) => (
                    <div
                      key={a._id}
                      onClick={() => handleSelect(`/alerts/${a._id}`)}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{a.title}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600" />
                    </div>
                  ))}
                </div>
              )}

              {/* Work Orders */}
              {results.workOrders?.length > 0 && (
                <div>
                  <div className="px-3 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                    Work Orders
                  </div>
                  {results.workOrders.map((w) => (
                    <div
                      key={w._id}
                      onClick={() => handleSelect(`/maintenance/work-orders/${w._id}`)}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-purple-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{w.workOrderNumber}</span>
                        <span className="text-slate-500 truncate">{w.title}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
