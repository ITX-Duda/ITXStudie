'use client';

import { useMemo } from 'react';
import { CirclePhase } from '@/store/useCircleStore';

interface CycleWheelProps {
  phases: CirclePhase[];
  /** Index (0-based) of the currently active phase. -1 = none (preview mode) */
  activeIndex?: number;
  /** 0–1 progress within the current phase (for the inner arc fill) */
  phaseProgress?: number;
  /** px size of the wheel */
  size?: number;
}

/**
 * Renders all phases of a circle as coloured arc segments arranged like a
 * clock face. The active segment glows and the inner ring shows how far through
 * the current phase the user is.
 */
export default function CycleWheel({
  phases,
  activeIndex = -1,
  phaseProgress = 0,
  size = 200,
}: CycleWheelProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 8;   // outer edge of segments
  const innerR = outerR - 22;     // inner edge of segments (ring thickness)
  const progressR = innerR - 8;   // radius of the phase-progress arc
  const gap = 3;                  // gap between segments in degrees

  const totalMins = useMemo(
    () => phases.reduce((s, p) => s + p.durationMins, 0),
    [phases],
  );

  // Convert polar coordinates to cartesian
  const polar = (r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  // Build an SVG arc-path for one segment
  const arcPath = (
    startDeg: number,
    endDeg: number,
    inner: number,
    outer: number,
  ) => {
    const s = polar(outer, startDeg);
    const e = polar(outer, endDeg);
    const si = polar(inner, startDeg);
    const ei = polar(inner, endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return [
      `M ${s.x} ${s.y}`,
      `A ${outer} ${outer} 0 ${large} 1 ${e.x} ${e.y}`,
      `L ${ei.x} ${ei.y}`,
      `A ${inner} ${inner} 0 ${large} 0 ${si.x} ${si.y}`,
      'Z',
    ].join(' ');
  };

  // Build segments from phases
  let cursor = 0;
  const segments = phases.map((phase, i) => {
    const sweep = (phase.durationMins / totalMins) * 360;
    const startDeg = cursor + gap / 2;
    const endDeg = cursor + sweep - gap / 2;
    cursor += sweep;

    const isActive = i === activeIndex;
    const isDone = i < activeIndex;
    const isStudy = phase.type === 'study';

    return { phase, i, startDeg, endDeg, isActive, isDone, isStudy };
  });

  // Inner progress arc (only when a phase is running)
  const progressArc = useMemo(() => {
    if (activeIndex < 0 || phaseProgress <= 0) return null;
    const seg = segments[activeIndex];
    if (!seg) return null;
    const totalSweep = seg.endDeg - seg.startDeg;
    const filled = totalSweep * phaseProgress;
    const startDeg = seg.startDeg;
    const endDeg = startDeg + filled;
    const s = polar(progressR, startDeg);
    const e = polar(progressR, endDeg);
    const large = filled > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${progressR} ${progressR} 0 ${large} 1 ${e.x} ${e.y}`;
  }, [activeIndex, phaseProgress, segments, progressR]);

  // Active segment centre angle (for the glowing dot indicator)
  const activeSeg = activeIndex >= 0 ? segments[activeIndex] : null;
  const activeMidAngle = activeSeg
    ? (activeSeg.startDeg + activeSeg.endDeg) / 2
    : null;
  const activeDot = activeMidAngle !== null ? polar(outerR + 4, activeMidAngle) : null;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="select-none"
      aria-label="Study cycle wheel"
    >
      {/* ── Subtle background circle ── */}
      <circle cx={cx} cy={cy} r={outerR + 2} fill="none" stroke="#1e293b" strokeWidth={2} />

      {/* ── Segments ── */}
      {segments.map(({ phase, i, startDeg, endDeg, isActive, isDone, isStudy }) => {
        const baseColor = isStudy ? '#10b981' : '#475569'; // emerald vs slate
        const opacity = isDone ? 0.55 : isActive ? 1 : 0.25;

        return (
          <g key={phase.id ?? i}>
            <path
              d={arcPath(startDeg, endDeg, innerR, outerR)}
              fill={baseColor}
              opacity={opacity}
              style={{
                filter: isActive
                  ? `drop-shadow(0 0 6px ${isStudy ? '#10b981' : '#64748b'})`
                  : undefined,
                transition: 'opacity 0.4s, filter 0.4s',
              }}
            />
            {/* Pulse ring on active segment */}
            {isActive && (
              <path
                d={arcPath(startDeg, endDeg, innerR, outerR)}
                fill="none"
                stroke={isStudy ? '#34d399' : '#94a3b8'}
                strokeWidth={1.5}
                opacity={0.7}
                className="animate-pulse"
              />
            )}
          </g>
        );
      })}

      {/* ── Inner progress arc ── */}
      {progressArc && (
        <path
          d={progressArc}
          fill="none"
          stroke={activeSeg?.isStudy ? '#6ee7b7' : '#94a3b8'}
          strokeWidth={3}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      )}

      {/* ── Track ring for progress arc ── */}
      <circle
        cx={cx}
        cy={cy}
        r={progressR}
        fill="none"
        stroke="#0f172a"
        strokeWidth={3}
      />

      {/* ── Centre info ── */}
      {activeIndex >= 0 && activeSeg ? (
        <>
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            fontSize={10}
            fill={activeSeg.isStudy ? '#6ee7b7' : '#94a3b8'}
            fontFamily="ui-monospace, monospace"
            fontWeight="600"
          >
            {activeSeg.isStudy ? '📖 FOCUS' : '☕ BREAK'}
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            fontSize={9}
            fill="#64748b"
            fontFamily="ui-sans-serif, sans-serif"
          >
            {activeIndex + 1} / {phases.length}
          </text>
          <text
            x={cx}
            y={cy + 24}
            textAnchor="middle"
            fontSize={8}
            fill="#334155"
            fontFamily="ui-sans-serif, sans-serif"
          >
            {activeSeg.phase.durationMins}m
          </text>
        </>
      ) : (
        <>
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            fontSize={10}
            fill="#475569"
            fontFamily="ui-sans-serif, sans-serif"
          >
            {phases.length} phases
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            fontSize={9}
            fill="#334155"
            fontFamily="ui-monospace, monospace"
          >
            {totalMins}m
          </text>
        </>
      )}

      {/* ── Spinning indicator dot on active segment ── */}
      {activeDot && activeSeg && (
        <circle
          cx={activeDot.x}
          cy={activeDot.y}
          r={4}
          fill={activeSeg.isStudy ? '#34d399' : '#94a3b8'}
          style={{ filter: 'drop-shadow(0 0 4px #34d399)' }}
        />
      )}
    </svg>
  );
}
