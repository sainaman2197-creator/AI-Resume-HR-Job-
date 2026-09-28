import React from 'react';

export default function ScoreGauge({ score = 0, size = 180, strokeWidth = 14 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safeScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (safeScore / 100) * circumference;

  let color = '#ef4444'; // Red
  let label = 'Needs Optimization';
  let badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  if (safeScore >= 80) {
    color = '#10b981'; // Green
    label = 'ATS Optimized';
    badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (safeScore >= 60) {
    color = '#f59e0b'; // Amber
    label = 'Good / Competitive';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1f2937"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-white">{safeScore}</span>
          <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold mt-0.5">/ 100</span>
        </div>
      </div>
      <div className={`mt-3 px-3 py-1 text-xs font-semibold rounded-full border ${badgeBg}`}>
        {label}
      </div>
    </div>
  );
}
