import React from 'react';
import './Charts.css';

/* Simple CSS-based bar chart — no external lib needed, matches existing project style */
export const SimpleBarChart = ({ data = [], valueKey = 'qty', labelKey = 'type', color = '#f59e0b' }) => {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="chart">
      {data.slice(0, 8).map((d, i) => (
        <div key={i} className="chart__row">
          <div className="chart__label">{d.emoji || ''} {d[labelKey]}</div>
          <div className="chart__bar-wrap">
            <div className="chart__bar" style={{ width: `${(d[valueKey] / max) * 100}%`, background: color }} />
          </div>
          <div className="chart__value">{d[valueKey]}</div>
        </div>
      ))}
    </div>
  );
};
