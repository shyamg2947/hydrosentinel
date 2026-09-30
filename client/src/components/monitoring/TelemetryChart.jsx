import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

export const TelemetryChart = ({
  data = [],
  dataKey = 'value',
  unit = 'bar',
  color = '#0d9488',
  height = 240,
  referenceLineValue = null,
  referenceLineLabel = ''
}) => {
  const { isDark } = useTheme();

  const formattedData = data.map((d) => ({
    ...d,
    formattedTime: d.timestamp ? new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
  }));

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div style={{ width: '100%', height }} className="font-sans">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="formattedTime"
            stroke={textColor}
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={textColor}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs border border-slate-700">
                    <div className="text-slate-400 font-mono text-[10px]">{label}</div>
                    <div className="font-bold font-mono text-sm text-teal-300 mt-0.5">
                      {payload[0].value} {unit}
                    </div>
                    {payload[0].payload.sensorId && (
                      <div className="text-[10px] text-slate-300 mt-0.5">
                        Sensor: {payload[0].payload.sensorId}
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#gradient-${color})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
