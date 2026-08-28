import React, { useEffect, useRef, useState } from 'react';
import { DeskItem, TeacherStation, LoungeZone, WhiteboardSpec } from '../types';
import { ROOM_WIDTH_FT, ROOM_LENGTH_FT } from '../data/classroomData';
import { RotateCw, ZoomIn, ZoomOut, Compass, Sparkles, Maximize2, RefreshCw } from 'lucide-react';

interface Props {
  desks: DeskItem[];
  teacherStation: TeacherStation;
  loungeZone: LoungeZone;
  whiteboard: WhiteboardSpec;
  styleTheme?: string;
}

export const RoomView3D: React.FC<Props> = ({
  desks,
  teacherStation,
  loungeZone,
  whiteboard,
  styleTheme = 'scandinavian_biophilic',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotationAngle, setRotationAngle] = useState(45); // isometric yaw in degrees
  const [pitchAngle, setPitchAngle] = useState(30); // isometric pitch in degrees
  const [zoomLevel, setZoomLevel] = useState(1.1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Draw 3D Isometric View onto HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI Canvas Scaling
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // 3D Projection parameters
    const originX = width / 2;
    const originY = height / 2 + 60;
    const radYaw = (rotationAngle * Math.PI) / 180;
    const radPitch = (pitchAngle * Math.PI) / 180;
    const baseScale = Math.min(width, height) / 36 * zoomLevel;

    // Transform 3D coordinates (x in ft, y in ft, z height in ft) to 2D screen coordinates
    const project = (x: number, y: number, z: number = 0) => {
      // Center coordinates around room center (9ft, 12ft)
      const cx = x - ROOM_WIDTH_FT / 2;
      const cy = y - ROOM_LENGTH_FT / 2;

      // Rotate around Z axis (yaw)
      const rx = cx * Math.cos(radYaw) - cy * Math.sin(radYaw);
      const ry = cx * Math.sin(radYaw) + cy * Math.cos(radYaw);

      // Isometric projection with pitch
      const screenX = originX + rx * baseScale;
      const screenY = originY + (ry * Math.sin(radPitch) - z * Math.cos(radPitch)) * baseScale;

      return { x: screenX, y: screenY, depth: ry };
    };

    // 1. Draw Floor Planks (Oak Wood Laminate)
    const floorCorners = [
      project(0, 0, 0),
      project(ROOM_WIDTH_FT, 0, 0),
      project(ROOM_WIDTH_FT, ROOM_LENGTH_FT, 0),
      project(0, ROOM_LENGTH_FT, 0),
    ];

    // Floor Base Gradient
    const floorGrad = ctx.createLinearGradient(floorCorners[0].x, floorCorners[0].y, floorCorners[2].x, floorCorners[2].y);
    floorGrad.addColorStop(0, '#2d261e');
    floorGrad.addColorStop(0.5, '#3b3228');
    floorGrad.addColorStop(1, '#231d17');

    ctx.beginPath();
    ctx.moveTo(floorCorners[0].x, floorCorners[0].y);
    ctx.lineTo(floorCorners[1].x, floorCorners[1].y);
    ctx.lineTo(floorCorners[2].x, floorCorners[2].y);
    ctx.lineTo(floorCorners[3].x, floorCorners[3].y);
    ctx.closePath();
    ctx.fillStyle = floorGrad;
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Floor grid plank lines (every 2 ft)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 0.8;
    for (let x = 2; x < ROOM_WIDTH_FT; x += 2) {
      const p1 = project(x, 0, 0);
      const p2 = project(x, ROOM_LENGTH_FT, 0);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    for (let y = 2; y < ROOM_LENGTH_FT; y += 2) {
      const p1 = project(0, y, 0);
      const p2 = project(ROOM_WIDTH_FT, y, 0);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // 2. Draw Back & Side Walls (10ft height)
    const WALL_HEIGHT = 8.5;
    const wallBackTop1 = project(0, 0, WALL_HEIGHT);
    const wallBackTop2 = project(ROOM_WIDTH_FT, 0, WALL_HEIGHT);
    const wallSideTop = project(0, ROOM_LENGTH_FT, WALL_HEIGHT);

    // Front/Back Wall
    ctx.beginPath();
    ctx.moveTo(floorCorners[0].x, floorCorners[0].y);
    ctx.lineTo(floorCorners[1].x, floorCorners[1].y);
    ctx.lineTo(wallBackTop2.x, wallBackTop2.y);
    ctx.lineTo(wallBackTop1.x, wallBackTop1.y);
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Side Wall (Left Wall with Windows)
    ctx.beginPath();
    ctx.moveTo(floorCorners[0].x, floorCorners[0].y);
    ctx.lineTo(floorCorners[3].x, floorCorners[3].y);
    ctx.lineTo(wallSideTop.x, wallSideTop.y);
    ctx.lineTo(wallBackTop1.x, wallBackTop1.y);
    ctx.closePath();
    ctx.fillStyle = '#172033';
    ctx.fill();
    ctx.stroke();

    // 3. Draw 16-Foot Whiteboard on Front Wall
    const wbLeft = project(whiteboard.x, 0.05, 2.8);
    const wbRight = project(whiteboard.x + whiteboard.width, 0.05, 2.8);
    const wbTopRight = project(whiteboard.x + whiteboard.width, 0.05, 6.8);
    const wbTopLeft = project(whiteboard.x, 0.05, 6.8);

    ctx.beginPath();
    ctx.moveTo(wbLeft.x, wbLeft.y);
    ctx.lineTo(wbRight.x, wbRight.y);
    ctx.lineTo(wbTopRight.x, wbTopRight.y);
    ctx.lineTo(wbTopLeft.x, wbTopLeft.y);
    ctx.closePath();
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Whiteboard Label & Marker Tray
    const wbCenter = project(whiteboard.x + whiteboard.width / 2, 0.06, 4.8);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('16FT MAGNETIC CERAMIC WHITEBOARD', wbCenter.x, wbCenter.y);

    // 4. Sort and Render Furniture by Depth for Perfect Occlusion
    interface Renderable {
      type: 'desk' | 'teacher' | 'sofa' | 'coffeeTable' | 'stool';
      depth: number;
      data: any;
    }

    const renderQueue: Renderable[] = [];

    // Add 30 Desks to render queue
    desks.forEach((d) => {
      const p = project(d.x, d.y, 0);
      renderQueue.push({ type: 'desk', depth: p.depth, data: d });
    });

    // Add Teacher Standing Station
    const pt = project(teacherStation.x, teacherStation.y, 0);
    renderQueue.push({ type: 'teacher', depth: pt.depth, data: teacherStation });

    // Add Lounge Sofa
    const ps = project(loungeZone.sofa.x, loungeZone.sofa.y, 0);
    renderQueue.push({ type: 'sofa', depth: ps.depth, data: loungeZone.sofa });

    // Add Coffee Tables
    loungeZone.coffeeTables.forEach((ct) => {
      const pct = project(ct.x, ct.y, 0);
      renderQueue.push({ type: 'coffeeTable', depth: pct.depth, data: ct });
    });

    // Add Stools
    loungeZone.stools.forEach((st) => {
      const pst = project(st.x, st.y, 0);
      renderQueue.push({ type: 'stool', depth: pst.depth, data: st });
    });

    // Sort from back to front (lowest depth to highest depth)
    renderQueue.sort((a, b) => a.depth - b.depth);

    // Render sorted elements
    renderQueue.forEach((item) => {
      if (item.type === 'desk') {
        const d = item.data;
        const w = 1.1; // half width in feet
        const l = 0.8; // half depth in feet
        const h = 2.4; // 29" height

        // 4 Desk surface corners in 3D
        const p1 = project(d.x - w, d.y - l, h);
        const p2 = project(d.x + w, d.y - l, h);
        const p3 = project(d.x + w, d.y + l, h);
        const p4 = project(d.x - w, d.y + l, h);

        // Legs to floor
        const b1 = project(d.x - w, d.y - l, 0);
        const b2 = project(d.x + w, d.y - l, 0);
        const b3 = project(d.x + w, d.y + l, 0);
        const b4 = project(d.x - w, d.y + l, 0);

        // Draw Metal Legs with Caster Wheels
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.8;
        [ [p1, b1], [p2, b2], [p3, b3], [p4, b4] ].forEach(([top, bot]) => {
          ctx.beginPath();
          ctx.moveTo(top.x, top.y);
          ctx.lineTo(bot.x, bot.y);
          ctx.stroke();
          // Caster circle at bottom
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.arc(bot.x, bot.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw Desktop Surface (High Pressure Laminate)
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fillStyle = '#e2e8f0';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Draw Ergonomic Mesh Chair behind desk
        const chairSeatH = 1.5;
        const chairBackH = 2.8;
        const cpSeat = project(d.x, d.y + 0.6, chairSeatH);
        const cpBack = project(d.x, d.y + 0.9, chairBackH);
        const cpBase = project(d.x, d.y + 0.6, 0);

        // Chair Stem & 5-Star Base
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cpBase.x, cpBase.y);
        ctx.lineTo(cpSeat.x, cpSeat.y);
        ctx.stroke();

        // Seat Cushion
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(cpSeat.x, cpSeat.y, 5.5, 0, Math.PI * 2);
        ctx.fill();

        // Curved Mesh Backrest
        ctx.strokeStyle = '#0369a1';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(cpBack.x, cpBack.y, 7, Math.PI, Math.PI * 2);
        ctx.stroke();

        // Student Number on Desk
        const center = project(d.x, d.y, h + 0.05);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${d.studentNumber}`, center.x, center.y + 3);
      }

      // Teacher Height-Adjustable Standing Desk with Bottom Shelves
      if (item.type === 'teacher') {
        const ts = item.data;
        const w = 2.0;
        const l = 1.1;
        const hTop = 3.4; // Standing height
        const hShelf1 = 0.8;
        const hShelf2 = 1.6;

        // Standing Desk Top
        const p1 = project(ts.x - w, ts.y - l, hTop);
        const p2 = project(ts.x + w, ts.y - l, hTop);
        const p3 = project(ts.x + w, ts.y + l, hTop);
        const p4 = project(ts.x - w, ts.y + l, hTop);

        // Lower Shelves
        const s1_1 = project(ts.x - w * 0.9, ts.y - l * 0.8, hShelf1);
        const s1_2 = project(ts.x + w * 0.9, ts.y - l * 0.8, hShelf1);
        const s1_3 = project(ts.x + w * 0.9, ts.y + l * 0.8, hShelf1);
        const s1_4 = project(ts.x - w * 0.9, ts.y + l * 0.8, hShelf1);

        // Draw Motorized Column Legs
        const b1 = project(ts.x - w * 0.8, ts.y, 0);
        const b2 = project(ts.x + w * 0.8, ts.y, 0);
        const t1 = project(ts.x - w * 0.8, ts.y, hTop);
        const t2 = project(ts.x + w * 0.8, ts.y, hTop);

        ctx.strokeStyle = '#4338ca';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(b1.x, b1.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.moveTo(b2.x, b2.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.stroke();

        // Draw Bottom Storage Shelf
        ctx.beginPath();
        ctx.moveTo(s1_1.x, s1_1.y);
        ctx.lineTo(s1_2.x, s1_2.y);
        ctx.lineTo(s1_3.x, s1_3.y);
        ctx.lineTo(s1_4.x, s1_4.y);
        ctx.closePath();
        ctx.fillStyle = '#312e81';
        ctx.fill();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw Top Work Surface
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fillStyle = '#6366f1';
        ctx.fill();
        ctx.strokeStyle = '#a5b4fc';
        ctx.lineWidth = 2;
        ctx.stroke();

        const tsCenter = project(ts.x, ts.y, hTop + 0.1);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TEACHER STANDING DESK', tsCenter.x, tsCenter.y);
      }

      // Lounge Sofa
      if (item.type === 'sofa') {
        const s = item.data;
        const w = 3.0;
        const l = 1.2;
        const hSeat = 1.4;
        const hBack = 2.6;

        const p1 = project(s.x - w, s.y - l, hSeat);
        const p2 = project(s.x + w, s.y - l, hSeat);
        const p3 = project(s.x + w, s.y + l, hSeat);
        const p4 = project(s.x - w, s.y + l, hSeat);

        const b1 = project(s.x - w, s.y + l * 0.9, hBack);
        const b2 = project(s.x + w, s.y + l * 0.9, hBack);

        // Sofa Base / Plinth
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fillStyle = '#475569';
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.stroke();

        // Sofa Backrest
        ctx.beginPath();
        ctx.moveTo(p4.x, p4.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.lineTo(b1.x, b1.y);
        ctx.closePath();
        ctx.fillStyle = '#334155';
        ctx.fill();
        ctx.stroke();
      }

      // Coffee Tables
      if (item.type === 'coffeeTable') {
        const ct = item.data;
        const h = 1.5;
        const pTop = project(ct.x, ct.y, h);
        const pBot = project(ct.x, ct.y, 0);

        // Legs
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pTop.x, pTop.y);
        ctx.lineTo(pBot.x, pBot.y);
        ctx.stroke();

        // Round Top
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(pTop.x, pTop.y, 14 * zoomLevel, 8 * zoomLevel, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Active Stools
      if (item.type === 'stool') {
        const st = item.data;
        const h = 1.5;
        const pTop = project(st.x, st.y, h);
        const pBot = project(st.x, st.y, 0);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pTop.x, pTop.y);
        ctx.lineTo(pBot.x, pBot.y);
        ctx.stroke();

        ctx.fillStyle = st.color || '#0d9488';
        ctx.beginPath();
        ctx.ellipse(pTop.x, pTop.y, 8 * zoomLevel, 5 * zoomLevel, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }, [desks, teacherStation, loungeZone, whiteboard, rotationAngle, pitchAngle, zoomLevel, styleTheme]);

  // Mouse interaction handlers for 3D Orbiting
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setRotationAngle((prev) => (prev + deltaX * 0.5 + 360) % 360);
    setPitchAngle((prev) => Math.max(10, Math.min(80, prev - deltaY * 0.3)));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div id="room-3d-isometric-view" className="w-full max-w-7xl mx-auto flex flex-col gap-4">
      {/* 3D Canvas Container */}
      <div className="relative w-full h-[620px] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center select-none">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Floating 3D Navigation Controls */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3 rounded-xl flex flex-col gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-semibold text-slate-100">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>3D Interactive Orbit</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Click & drag to orbit 360° · Scroll to zoom
          </p>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            <span>Yaw: {Math.round(rotationAngle)}°</span>
            <span>Pitch: {Math.round(pitchAngle)}°</span>
          </div>
        </div>

        {/* Orbit Quick Action Buttons */}
        <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-slate-800" />
          <button
            onClick={() => setRotationAngle((r) => (r + 45) % 360)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Rotate 45°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setRotationAngle(45);
              setPitchAngle(30);
              setZoomLevel(1.1);
            }}
            className="p-2 rounded-lg hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 transition-colors text-xs font-medium flex items-center gap-1"
            title="Reset to Default Isometric Perspective"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>
        </div>
      </div>
    </div>
  );
};
