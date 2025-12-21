
import React from 'react';

// --- Line Graph: Emotional Trajectory ---
interface LineGraphProps {
  data: { progress: number; score: number }[]; // score: 1-10
}

export const EmotionLineGraph: React.FC<LineGraphProps> = ({ data }) => {
  if (data.length < 2) return null;

  const width = 300;
  const height = 150;
  const padding = 20;

  // Scale functions
  const xScale = (p: number) => padding + (p / 100) * (width - padding * 2);
  const yScale = (s: number) => height - padding - ((s - 1) / 9) * (height - padding * 2);

  // Create path
  let pathD = `M ${xScale(data[0].progress)} ${yScale(data[0].score)}`;
  data.slice(1).forEach(point => {
    // Simple straight lines. For curves, use bezier control points.
    pathD += ` L ${xScale(point.progress)} ${yScale(point.score)}`;
  });

  // Smooth curve using Bezier approximation (simple version)
  const points = data.map(d => [xScale(d.progress), yScale(d.score)]);
  const svgPath = (points: number[][], command: any) => {
    const d = points.reduce((acc, point, i, a) => i === 0
      ? `M ${point[0]},${point[1]}`
      : `${acc} ${command(point, i, a)}`
      , '');
    return d;
  };

  const line = (pointA: number[], pointB: number[]) => {
    const lengthX = pointB[0] - pointA[0];
    const lengthY = pointB[1] - pointA[1];
    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX)
    };
  };

  const controlPoint = (current: number[], previous: number[], next: number[], reverse?: boolean) => {
    const p = previous || current;
    const n = next || current;
    const smoothing = 0.2;
    const o = line(p, n);
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
  };

  const bezierCommand = (point: number[], i: number, a: number[][]) => {
    const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
    const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
  };

  const smoothPath = svgPath(points, bezierCommand);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Grid lines */}
        {[2, 4, 6, 8, 10].map(tick => (
          <line
            key={tick}
            x1={padding}
            y1={yScale(tick)}
            x2={width - padding}
            y2={yScale(tick)}
            stroke="#e2e8f0"
            strokeDasharray="2 2"
          />
        ))}

        {/* Path */}
        <path d={smoothPath} fill="none" stroke="#F87171" strokeWidth="4" strokeLinecap="round" />

        {/* Dots */}
        {data.map((point, i) => (
          <circle
            key={i}
            cx={xScale(point.progress)}
            cy={yScale(point.score)}
            r="6"
            fill="#F87171"
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* Labels */}
        <text x={padding} y={height} className="text-[10px] fill-gray-400">10%</text>
        <text x={width - padding} y={height} textAnchor="end" className="text-[10px] fill-gray-400">100%</text>
      </svg>
    </div>
  );
};


// --- Donut Chart: Focus Areas ---
interface DonutChartProps {
  data: { label: string; percentage: number; color: string }[];
}

export const FocusDonutChart: React.FC<DonutChartProps> = ({ data }) => {
  const size = 150;
  const strokeWidth = 50; // thicker donut
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 w-full h-full">
          {data.map((item, i) => {
            const offset = circumference - (item.percentage / 100) * circumference;
            const rotate = (cumulativePercent / 100) * 360;
            cumulativePercent += item.percentage;

            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                // transform={`rotate(${rotate} ${center} ${center})`} // Rotate is handled by stacked segments if calculated differently, but for simple CSS dashoffset stack we need rotation
                style={{
                  transformOrigin: 'center',
                  transform: `rotate(${rotate}deg)`,
                  transition: 'stroke-dashoffset 1s ease-out'
                }}
              />
            );
          })}
        </svg>
        {/* Center Text */}
        {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-gray-400">Focus</span>
        </div> */}
      </div>

      <div className="flex flex-col gap-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs font-bold text-sage-600">{item.label}</span>
            <span className="text-xs text-sage-400">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Bar Chart: Keywords ---
interface BarChartProps {
  data: { label: string; count: number }[];
}

export const KeywordBarChart: React.FC<BarChartProps> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="flex items-end justify-between h-32 w-full px-2 gap-2">
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center flex-1 group">
          <div className="relative w-full flex items-end justify-center h-full">
            <div
              className="w-full max-w-[40px] bg-indigo-400 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-500"
              style={{ height: `${(item.count / maxCount) * 100}%` }}
            />
            <div className="absolute -top-6 text-xs font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.count}
            </div>
          </div>
          <span className="text-[10px] text-sage-500 mt-2 font-medium truncate w-full text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
