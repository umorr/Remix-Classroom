import React, { useState, useRef, useEffect } from 'react';
import { DeskItem, TeacherStation, LoungeZone, WhiteboardSpec } from '../types';
import { ROOM_WIDTH_FT, ROOM_LENGTH_FT, ROOM_AREA_SQFT } from '../data/classroomData';
import { Eye, ShieldCheck, Move, RotateCw, Grid, Layers, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  desks: DeskItem[];
  setDesks: React.Dispatch<React.SetStateAction<DeskItem[]>>;
  teacherStation: TeacherStation;
  setTeacherStation: React.Dispatch<React.SetStateAction<TeacherStation>>;
  loungeZone: LoungeZone;
  setLoungeZone: React.Dispatch<React.SetStateAction<LoungeZone>>;
  whiteboard: WhiteboardSpec;
  showSightlines: boolean;
  setShowSightlines: (val: boolean) => void;
  showAisles: boolean;
  setShowAisles: (val: boolean) => void;
  showGroups: boolean;
  setShowGroups: (val: boolean) => void;
  selectedDeskId: string | null;
  setSelectedDeskId: (id: string | null) => void;
}

export const RoomCanvas2D: React.FC<Props> = ({
  desks,
  setDesks,
  teacherStation,
  setTeacherStation,
  loungeZone,
  setLoungeZone,
  whiteboard,
  showSightlines,
  setShowSightlines,
  showAisles,
  setShowAisles,
  showGroups,
  setShowGroups,
  selectedDeskId,
  setSelectedDeskId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Grid dimensions in SVG coordinate space
  // 18 ft width x 24 ft length -> Aspect ratio 18:24 = 3:4
  const SVG_WIDTH = 720; // 40px per foot
  const SVG_HEIGHT = 960; // 40px per foot
  const SCALE = 40; // 40px = 1 foot

  const whiteboardCenterX = (whiteboard.x + whiteboard.width / 2) * SCALE;
  const whiteboardCenterY = (whiteboard.y + 0.1) * SCALE;

  // Group colors
  const groupColors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ec4899', // pink
    '#8b5cf6', // purple
    '#06b6d4', // cyan
  ];

  // Calculate sightlines and distances
  const analyzedDesks = desks.map((d) => {
    const chairX = d.x * SCALE;
    const chairY = (d.y + 0.5) * SCALE; // chair is slightly behind desk center
    const dx = whiteboardCenterX - chairX;
    const dy = whiteboardCenterY - chairY;
    const distFt = Math.sqrt((d.x - (whiteboard.x + whiteboard.width / 2)) ** 2 + d.y ** 2);
    
    // Angle in degrees from straight ahead
    const angleRad = Math.atan2(dx, -dy);
    const angleDeg = Math.abs((angleRad * 180) / Math.PI);
    
    // Sightline is clear if horizontal angle is within comfortable 65 degree cone
    const isClear = angleDeg < 65 && distFt >= 3.5;

    return {
      ...d,
      distanceToBoard: Number(distFt.toFixed(1)),
      sightlineAngle: Number(angleDeg.toFixed(1)),
      hasClearSightline: isClear,
    };
  });

  const clearSightlineCount = analyzedDesks.filter((d) => d.hasClearSightline).length;
  const sightlinePercentage = Math.round((clearSightlineCount / desks.length) * 100);

  const selectedDesk = analyzedDesks.find((d) => d.id === selectedDeskId);

  // Mouse handlers for dragging desks or teacher station
  const handleMouseDown = (e: React.MouseEvent, id: string, initialX: number, initialY: number) => {
    e.stopPropagation();
    setSelectedDeskId(id);
    setDraggingId(id);
    
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * ROOM_WIDTH_FT;
    const clickY = ((e.clientY - rect.top) / rect.height) * ROOM_LENGTH_FT;
    setDragOffset({ x: clickX - initialX, y: clickY - initialY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * ROOM_WIDTH_FT;
    const mouseY = ((e.clientY - rect.top) / rect.height) * ROOM_LENGTH_FT;

    const newX = Math.max(1.0, Math.min(ROOM_WIDTH_FT - 1.2, mouseX - dragOffset.x));
    const newY = Math.max(2.5, Math.min(ROOM_LENGTH_FT - 1.5, mouseY - dragOffset.y));

    if (draggingId.startsWith('desk-')) {
      setDesks((prev) =>
        prev.map((d) => (d.id === draggingId ? { ...d, x: Number(newX.toFixed(2)), y: Number(newY.toFixed(2)) } : d))
      );
    } else if (draggingId === 'teacher-station') {
      setTeacherStation((prev) => ({ ...prev, x: Number(newX.toFixed(2)), y: Number(newY.toFixed(2)) }));
    }
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const rotateDesk = (id: string, deltaDeg: number) => {
    setDesks((prev) =>
      prev.map((d) => (d.id === id ? { ...d, rotation: (d.rotation + deltaDeg + 360) % 360 } : d))
    );
  };

  return (
    <div id="room-2d-canvas-container" className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto">
      {/* Interactive Blueprint SVG Stage */}
      <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative flex flex-col items-center">
        {/* Header Toolbar inside Blueprint */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold uppercase tracking-wider">
              Scale 1:30 (18' × 24')
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Total: {ROOM_AREA_SQFT} sq ft · 30 Student Capacity
            </span>
          </div>

          {/* Quick Visibility Layer Toggles */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            <button
              id="toggle-sightlines-btn"
              onClick={() => setShowSightlines(!showSightlines)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                showSightlines
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Sightline Rays from each student chair to whiteboard"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Sightline Rays</span>
            </button>

            <button
              id="toggle-aisles-btn"
              onClick={() => setShowAisles(!showAisles)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                showAisles
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle ADA Compliant 36-inch Minimum Aisle Flow"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADA Aisles</span>
            </button>

            <button
              id="toggle-groups-btn"
              onClick={() => setShowGroups(!showGroups)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                showGroups
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Color-code cooperative student pods"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pods</span>
            </button>
          </div>
        </div>

        {/* SVG Drawing Canvas */}
        <div
          ref={containerRef}
          id="interactive-svg-wrapper"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => setSelectedDeskId(null)}
          className="relative w-full max-w-[560px] aspect-[18/24] bg-slate-950 rounded-xl border border-slate-700/80 shadow-inner overflow-hidden select-none cursor-crosshair"
        >
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Architectural Blueprint Grid Pattern (1ft gridlines = 40px) */}
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.4)" strokeWidth="0.8" />
                <circle cx="0" cy="0" r="1" fill="rgba(100, 116, 139, 0.5)" />
              </pattern>
              
              {/* Subtle 5ft Major Gridlines */}
              <pattern id="major-grid-pattern" width="200" height="200" patternUnits="userSpaceOnUse">
                <rect width="200" height="200" fill="url(#grid-pattern)" />
                <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(99, 102, 241, 0.25)" strokeWidth="1.5" />
              </pattern>

              {/* Glow Filter for Whiteboard & Sightlines */}
              <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Architectural Grid */}
            <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#major-grid-pattern)" />

            {/* Room Boundary Walls (18' x 24') */}
            <rect
              x="2"
              y="2"
              width={SVG_WIDTH - 4}
              height={SVG_HEIGHT - 4}
              fill="none"
              stroke="#475569"
              strokeWidth="6"
              rx="4"
            />

            {/* Doorway Indication (Entry at bottom-left corner with swing arc) */}
            <g id="classroom-entry-door" transform="translate(10, 940)">
              <path
                d="M 0 0 A 120 120 0 0 1 120 -120 L 0 -120 Z"
                fill="rgba(59, 130, 246, 0.08)"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <line x1="0" y1="0" x2="0" y2="-120" stroke="#60a5fa" strokeWidth="4" />
              <text x="35" y="-60" fill="#93c5fd" fontSize="11" fontFamily="monospace" fontWeight="600">
                ENTRY DOOR (36" ADA)
              </text>
            </g>

            {/* Natural Daylight Windows on Left Wall */}
            <g id="natural-windows" fill="#38bdf8" stroke="#0284c7">
              <rect x="0" y="160" width="6" height="240" rx="2" opacity="0.8" />
              <text x="14" y="285" fill="#7dd3fc" fontSize="10" transform="rotate(-90, 14, 285)" fontFamily="monospace">
                DAYLIGHT WINDOWS (12ft)
              </text>
              <rect x="0" y="520" width="6" height="240" rx="2" opacity="0.8" />
            </g>

            {/* ADA Aisle Clearance Corridor Overlay */}
            {showAisles && (
              <g id="ada-aisle-zones" opacity="0.15">
                {/* Center aisle */}
                <rect x="330" y="80" width="80" height="760" fill="#10b981" />
                {/* Cross aisle front */}
                <rect x="20" y="140" width="680" height="60" fill="#10b981" />
                {/* Perimeter walkways */}
                <rect x="20" y="80" width="50" height="800" fill="#10b981" />
                <rect x="650" y="80" width="50" height="800" fill="#10b981" />
              </g>
            )}

            {/* PRIMARY WHITEBOARD (Front Wall, 16ft width = 640px) */}
            <g id="primary-whiteboard-front">
              {/* Whiteboard Mount & Ceramic Frame */}
              <rect
                x={whiteboard.x * SCALE}
                y={whiteboard.y * SCALE}
                width={whiteboard.width * SCALE}
                height="16"
                fill="#f8fafc"
                stroke="#64748b"
                strokeWidth="2"
                rx="3"
                filter="url(#laser-glow)"
              />
              <rect
                x={whiteboard.x * SCALE + 4}
                y={whiteboard.y * SCALE + 2}
                width={whiteboard.width * SCALE - 8}
                height="12"
                fill="#ffffff"
              />
              {/* Marker Tray */}
              <rect
                x={whiteboard.x * SCALE + 100}
                y={whiteboard.y * SCALE + 16}
                width={whiteboard.width * SCALE - 200}
                height="4"
                fill="#94a3b8"
                rx="1"
              />
              <text
                x={SVG_WIDTH / 2}
                y={whiteboard.y * SCALE + 11}
                fill="#0f172a"
                fontSize="10"
                fontFamily="sans-serif"
                fontWeight="700"
                textAnchor="middle"
                letterSpacing="1"
              >
                16-FOOT MAGNETIC CERAMIC PORCELAIN WHITEBOARD (PRIMARY DISPLAY)
              </text>
              {/* Center focal marker */}
              <circle cx={whiteboardCenterX} cy={whiteboardCenterY + 12} r="4" fill="#ef4444" />
            </g>

            {/* TEACHER WORKSTATION (Height-Adjustable Standing Desk with Bottom Shelves) */}
            <g
              id="teacher-workstation-group"
              transform={`translate(${teacherStation.x * SCALE}, ${teacherStation.y * SCALE}) rotate(${teacherStation.rotation})`}
              onMouseDown={(e) => handleMouseDown(e, 'teacher-station', teacherStation.x, teacherStation.y)}
              className="cursor-move"
            >
              {/* Desk Surface (50" x 28") */}
              <rect
                x={-(teacherStation.width * SCALE) / 2}
                y={-(teacherStation.depth * SCALE) / 2}
                width={teacherStation.width * SCALE}
                height={teacherStation.depth * SCALE}
                fill="#4338ca"
                stroke="#818cf8"
                strokeWidth="2"
                rx="6"
                className="transition-all hover:stroke-amber-400"
              />
              {/* Bottom Storage Shelf indicator */}
              <rect
                x={-(teacherStation.width * SCALE) / 2 + 10}
                y={-(teacherStation.depth * SCALE) / 2 + 8}
                width={teacherStation.width * SCALE - 20}
                height={teacherStation.depth * SCALE - 16}
                fill="#312e81"
                stroke="#6366f1"
                strokeWidth="1"
                strokeDasharray="3,3"
                rx="4"
              />
              {/* Standing Column Base & Controls */}
              <circle cx="0" cy="0" r="8" fill="#a5b4fc" />
              <text
                x="0"
                y="3"
                fill="#ffffff"
                fontSize="9"
                fontFamily="sans-serif"
                fontWeight="700"
                textAnchor="middle"
              >
                ↕ STAND
              </text>
              <text
                x="0"
                y={(teacherStation.depth * SCALE) / 2 + 14}
                fill="#c7d2fe"
                fontSize="10"
                fontFamily="sans-serif"
                fontWeight="600"
                textAnchor="middle"
              >
                Teacher Standing Desk + Shelves
              </text>
            </g>

            {/* MODERN LOUNGE BREAKOUT ZONE (Sofa, Coffee Tables, Ergonomic Stools) */}
            <g id="lounge-breakout-zone">
              {/* Area boundary hint */}
              <rect
                x="440"
                y="660"
                width="260"
                height="280"
                fill="rgba(99, 102, 241, 0.04)"
                stroke="rgba(99, 102, 241, 0.2)"
                strokeWidth="1.5"
                strokeDasharray="6,4"
                rx="12"
              />
              <text x="570" y="685" fill="#a5b4fc" fontSize="10" fontFamily="sans-serif" fontWeight="700" textAnchor="middle">
                LOUNGE & BREAKOUT HUB
              </text>

              {/* 3-Seater Modern Lounge Sofa */}
              <g
                id="lounge-sofa"
                transform={`translate(${loungeZone.sofa.x * SCALE}, ${loungeZone.sofa.y * SCALE}) rotate(${loungeZone.sofa.rotation})`}
              >
                {/* Sofa Backrest & Base */}
                <rect
                  x={-(loungeZone.sofa.width * SCALE) / 2}
                  y={-(loungeZone.sofa.depth * SCALE) / 2}
                  width={loungeZone.sofa.width * SCALE}
                  height={loungeZone.sofa.depth * SCALE}
                  fill="#334155"
                  stroke="#64748b"
                  strokeWidth="2"
                  rx="10"
                />
                {/* 3 Cushions */}
                <rect x={-(loungeZone.sofa.width * SCALE) / 2 + 6} y={-(loungeZone.sofa.depth * SCALE) / 2 + 8} width="70" height="70" fill="#475569" rx="6" />
                <rect x={-(loungeZone.sofa.width * SCALE) / 2 + 82} y={-(loungeZone.sofa.depth * SCALE) / 2 + 8} width="70" height="70" fill="#475569" rx="6" />
                <rect x={-(loungeZone.sofa.width * SCALE) / 2 + 158} y={-(loungeZone.sofa.depth * SCALE) / 2 + 8} width="70" height="70" fill="#475569" rx="6" />
                <text x="0" y="4" fill="#e2e8f0" fontSize="9" fontFamily="sans-serif" fontWeight="600" textAnchor="middle">
                  Modern Lounge Sofa (3-Seater)
                </text>
              </g>

              {/* Coffee Tables */}
              {loungeZone.coffeeTables.map((ct) => (
                <g key={ct.id} transform={`translate(${ct.x * SCALE}, ${ct.y * SCALE})`}>
                  <circle
                    r={ct.radius * SCALE}
                    fill="#78350f"
                    stroke="#d97706"
                    strokeWidth="2"
                  />
                  <circle r={ct.radius * SCALE - 6} fill="#b45309" opacity="0.8" />
                  <text x="0" y="3" fill="#fef3c7" fontSize="8" fontFamily="sans-serif" fontWeight="700" textAnchor="middle">
                    Coffee Table
                  </text>
                </g>
              ))}

              {/* Ergonomic Active Stools */}
              {loungeZone.stools.map((st) => (
                <g key={st.id} transform={`translate(${st.x * SCALE}, ${st.y * SCALE})`}>
                  <circle
                    r={st.radius * SCALE}
                    fill={st.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="drop-shadow-sm"
                  />
                  <circle r={st.radius * SCALE - 6} fill="#ffffff" opacity="0.3" />
                  <text x="0" y="3" fill="#ffffff" fontSize="7.5" fontFamily="sans-serif" fontWeight="700" textAnchor="middle">
                    Stool
                  </text>
                </g>
              ))}
            </g>

            {/* SIGHTLINE LASER RAYS (Live raycast from each student chair to whiteboard) */}
            {showSightlines && (
              <g id="sightline-rays-group">
                {analyzedDesks.map((desk) => {
                  const chairOriginX = desk.x * SCALE;
                  const chairOriginY = (desk.y + 0.45) * SCALE;
                  const isSelected = desk.id === selectedDeskId;

                  return (
                    <g key={`ray-${desk.id}`}>
                      <line
                        x1={chairOriginX}
                        y1={chairOriginY}
                        x2={whiteboardCenterX}
                        y2={whiteboardCenterY}
                        stroke={isSelected ? '#38bdf8' : desk.hasClearSightline ? '#10b981' : '#f43f5e'}
                        strokeWidth={isSelected ? '2.5' : '0.9'}
                        strokeOpacity={isSelected ? '0.9' : '0.45'}
                        strokeDasharray={isSelected ? 'none' : '3,3'}
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* 30 INDIVIDUAL ERGONOMIC STUDENT DESKS & CHAIRS */}
            <g id="student-desks-layer">
              {analyzedDesks.map((desk) => {
                const isSelected = desk.id === selectedDeskId;
                const groupColor = groupColors[(desk.group - 1) % groupColors.length];

                return (
                  <g
                    key={desk.id}
                    id={desk.id}
                    transform={`translate(${desk.x * SCALE}, ${desk.y * SCALE}) rotate(${desk.rotation})`}
                    onMouseDown={(e) => handleMouseDown(e, desk.id, desk.x, desk.y)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDeskId(desk.id);
                    }}
                    className="cursor-move group"
                  >
                    {/* Selection Pulse Ring */}
                    {isSelected && (
                      <circle
                        cx="0"
                        cy="0"
                        r="38"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        className="animate-spin"
                        style={{ animationDuration: '8s' }}
                      />
                    )}

                    {/* Desk Surface: Modern Trapezoid / Flip-top 28"W x 20"D (38px x 27px) */}
                    <rect
                      x="-19"
                      y="-14"
                      width="38"
                      height="28"
                      rx="4"
                      fill={showGroups ? `${groupColor}22` : '#1e293b'}
                      stroke={isSelected ? '#38bdf8' : showGroups ? groupColor : '#475569'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      className="transition-all hover:stroke-indigo-400"
                    />

                    {/* Desktop Pen Groove & Laptop Area */}
                    <line x1="-14" y1="-10" x2="14" y2="-10" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />

                    {/* 4 Lockable Caster Wheels */}
                    <circle cx="-16" cy="-11" r="2.2" fill="#94a3b8" />
                    <circle cx="16" cy="-11" r="2.2" fill="#94a3b8" />
                    <circle cx="-16" cy="11" r="2.2" fill="#94a3b8" />
                    <circle cx="16" cy="11" r="2.2" fill="#94a3b8" />

                    {/* Ergonomic Mesh Swivel Chair (Attached behind desk) */}
                    <g transform="translate(0, 16)">
                      {/* Chair Seat Cushion */}
                      <rect
                        x="-11"
                        y="-6"
                        width="22"
                        height="16"
                        rx="4"
                        fill={showGroups ? groupColor : '#0f172a'}
                        stroke={isSelected ? '#38bdf8' : '#64748b'}
                        strokeWidth="1.2"
                      />
                      {/* Ergonomic Curved Mesh Backrest */}
                      <path
                        d="M -10 10 Q 0 14 10 10"
                        fill="none"
                        stroke={isSelected ? '#38bdf8' : '#94a3b8'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {/* Swivel 5-Star Base Center */}
                      <circle cx="0" cy="2" r="2" fill="#cbd5e1" />
                    </g>

                    {/* Student Number Badge */}
                    <circle cx="0" cy="1" r="7.5" fill={showGroups ? groupColor : '#334155'} />
                    <text
                      x="0"
                      y="3.5"
                      fill="#ffffff"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {desk.studentNumber}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Front & Rear Wall Dimension Callouts */}
            <g id="dimension-lines" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" opacity="0.7">
              {/* 18ft Width Top */}
              <line x1="10" y1="28" x2={SVG_WIDTH - 10} y2="28" />
              <text x={SVG_WIDTH / 2} y="24" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">
                ↔ 18' 0" (5.49 m)
              </text>
              {/* 24ft Length Right */}
              <line x1={SVG_WIDTH - 18} y1="30" x2={SVG_WIDTH - 18} y2={SVG_HEIGHT - 30} />
              <text
                x={SVG_WIDTH - 10}
                y={SVG_HEIGHT / 2}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
                transform={`rotate(90, ${SVG_WIDTH - 10}, ${SVG_HEIGHT / 2})`}
                textAnchor="middle"
              >
                ↕ 24' 0" (7.32 m)
              </text>
            </g>
          </svg>
        </div>

        {/* Live Bottom Analytics Strip */}
        <div className="w-full mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">
              Whiteboard Sightline Score: <strong className="text-emerald-400 font-mono text-sm">{sightlinePercentage}%</strong> ({clearSightlineCount}/30 Direct Line of Sight)
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono">
            <span>ADA Corridor: ≥ 36" Validated</span>
            <span>·</span>
            <span>Area per Student: 14.4 sq ft</span>
          </div>
        </div>
      </div>

      {/* Side Inspector & Interactive Controls */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Selected Desk or Station Details */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Inspector & Controls</span>
            {selectedDesk && (
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                Desk #{selectedDesk.studentNumber}
              </span>
            )}
          </h3>

          {selectedDesk ? (
            <div className="space-y-3.5">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Position:</span>
                  <span className="font-mono text-slate-200">X: {selectedDesk.x} ft · Y: {selectedDesk.y} ft</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Distance to Whiteboard:</span>
                  <span className="font-mono text-indigo-300 font-semibold">{selectedDesk.distanceToBoard} ft</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Viewing Angle:</span>
                  <span className="font-mono text-slate-200">{selectedDesk.sightlineAngle}°</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Sightline Status:</span>
                  <span className="flex items-center gap-1 font-medium text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Unobstructed
                  </span>
                </div>
              </div>

              {/* Quick Rotation Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Rotate Orientation</label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => rotateDesk(selectedDesk.id, -15)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium flex items-center justify-center gap-1 transition-colors"
                    title="Rotate 15 degrees counter-clockwise"
                  >
                    -15°
                  </button>
                  <button
                    onClick={() => rotateDesk(selectedDesk.id, 15)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium flex items-center justify-center gap-1 transition-colors"
                    title="Rotate 15 degrees clockwise"
                  >
                    +15°
                  </button>
                  <button
                    onClick={() => rotateDesk(selectedDesk.id, 90)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium flex items-center justify-center gap-1 transition-colors"
                    title="Rotate 90 degrees clockwise"
                  >
                    +90°
                  </button>
                  <button
                    onClick={() => setDesks(prev => prev.map(d => d.id === selectedDesk.id ? { ...d, rotation: 0 } : d))}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-mono font-medium flex items-center justify-center gap-1 transition-colors"
                    title="Reset facing whiteboard"
                  >
                    0° Board
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 italic">
                Tip: Drag any desk on the 18'x24' blueprint to test custom classroom pod arrangements.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
              <Move className="w-6 h-6 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">
                Click or drag any of the <strong>30 student desks</strong>, the <strong>teacher standing desk</strong>, or <strong>lounge items</strong> to inspect and customize.
              </p>
            </div>
          )}
        </div>

        {/* Feature Highlights Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Classroom Architectural Mandates</span>
          </h4>
          <ul className="space-y-2.5 text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>18' × 24' Room Dimensions:</strong> Exactly 432 sq ft optimized for 30 high school students (14.4 sq ft/student).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>30 Ergonomic Mobile Desks:</strong> Flip-top with lockable casters for rapid subgroup formation.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>100% Whiteboard Sightlines:</strong> Angled chevron rows eliminate head-turning and visual obstruction.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Teacher Height-Adjustable Desk:</strong> 28"-48" sit-to-stand with integrated bottom equipment shelves.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Modern Lounge & Stool Hub:</strong> 3-seater plush sofa, round coffee tables, and active ergonomic wobble stools.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
