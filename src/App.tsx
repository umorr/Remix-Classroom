import React, { useState } from 'react';
import { LayoutMode, ViewTab, DeskItem, TeacherStation, LoungeZone, WhiteboardSpec } from './types';
import { ROOM_LAYOUT_CONFIGS, ROOM_WIDTH_FT, ROOM_LENGTH_FT, ROOM_AREA_SQFT, WHITEBOARD_SPEC } from './data/classroomData';
import { RoomCanvas2D } from './components/RoomCanvas2D';
import { RoomView3D } from './components/RoomView3D';
import { AIVisualizerModal } from './components/AIVisualizerModal';
import { SightlineAnalyzer } from './components/SightlineAnalyzer';
import { FurnitureBOMModal } from './components/FurnitureBOMModal';
import {
  LayoutGrid,
  Users,
  Box,
  Eye,
  Package,
  Wand2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Armchair,
  BookOpen
} from 'lucide-react';

export default function App() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('chevron');
  const [activeTab, setActiveTab] = useState<ViewTab>('blueprint2d');

  // Interactive Classroom State
  const currentConfig = ROOM_LAYOUT_CONFIGS[layoutMode] || ROOM_LAYOUT_CONFIGS['chevron'];
  const [desks, setDesks] = useState<DeskItem[]>(currentConfig.desks);
  const [teacherStation, setTeacherStation] = useState<TeacherStation>(currentConfig.teacherStation);
  const [loungeZone, setLoungeZone] = useState<LoungeZone>(currentConfig.loungeZone);
  const [whiteboard] = useState<WhiteboardSpec>(WHITEBOARD_SPEC);

  // Overlay layer toggles
  const [showSightlines, setShowSightlines] = useState<boolean>(true);
  const [showAisles, setShowAisles] = useState<boolean>(false);
  const [showGroups, setShowGroups] = useState<boolean>(true);
  const [selectedDeskId, setSelectedDeskId] = useState<string | null>(null);

  // Switch layout mode and update desk positions with clean reset
  const handleModeChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
    const newConfig = ROOM_LAYOUT_CONFIGS[mode];
    if (newConfig) {
      setDesks(newConfig.desks);
      setTeacherStation(newConfig.teacherStation);
      setLoungeZone(newConfig.loungeZone);
      setSelectedDeskId(null);
    }
  };

  const handleResetCurrentLayout = () => {
    const config = ROOM_LAYOUT_CONFIGS[layoutMode];
    if (config) {
      setDesks(config.desks);
      setTeacherStation(config.teacherStation);
      setLoungeZone(config.loungeZone);
      setSelectedDeskId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Logo & Specifications Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-100 tracking-tight">
                  18' × 24' High School Classroom Studio
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-semibold">
                  30 Students
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ergonomic Mobile Desks · Unobstructed Whiteboard Sightlines · Height-Adjustable Teacher Desk · Lounge Corner
              </p>
            </div>
          </div>

          {/* Primary View Mode Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-stretch md:self-auto overflow-x-auto">
            <button
              id="tab-blueprint2d"
              onClick={() => setActiveTab('blueprint2d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'blueprint2d'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>2D Blueprint</span>
            </button>

            <button
              id="tab-isometric3d"
              onClick={() => setActiveTab('isometric3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'isometric3d'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Isometric Orbit</span>
            </button>

            <button
              id="tab-ai-renders"
              onClick={() => setActiveTab('aiRenders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'aiRenders'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Photorealistic Renders</span>
            </button>

            <button
              id="tab-sightlines"
              onClick={() => setActiveTab('sightlineAnalysis')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'sightlineAnalysis'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Sightline & Acoustics</span>
            </button>

            <button
              id="tab-specs-bom"
              onClick={() => setActiveTab('specsBOM')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'specsBOM'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Furniture BOM</span>
            </button>
          </nav>
        </div>

        {/* Sub-Header: Reconfigurable Layout Preset Selector Bar */}
        <div className="bg-slate-900/60 border-t border-slate-800/80 px-4 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1">
                Layout Formations:
              </span>

              {Object.values(ROOM_LAYOUT_CONFIGS).map((preset) => {
                const isCurrent = layoutMode === preset.id;
                return (
                  <button
                    key={preset.id}
                    id={`preset-btn-${preset.id}`}
                    onClick={() => handleModeChange(preset.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm font-semibold'
                        : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>{preset.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleResetCurrentLayout}
              className="hidden sm:flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap"
              title="Reset layout positions to preset defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Positions</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Layout Mode Context Banner */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Active Formation: {currentConfig.name}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">{currentConfig.tagline}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Whiteboard Sightlines
            </span>
            <span>·</span>
            <span>Reconfig Time: {currentConfig.reconfigurationTimeSec}s</span>
          </div>
        </div>

        {/* View Tab Switcher Content */}
        {activeTab === 'blueprint2d' && (
          <RoomCanvas2D
            desks={desks}
            setDesks={setDesks}
            teacherStation={teacherStation}
            setTeacherStation={setTeacherStation}
            loungeZone={loungeZone}
            setLoungeZone={setLoungeZone}
            whiteboard={whiteboard}
            showSightlines={showSightlines}
            setShowSightlines={setShowSightlines}
            showAisles={showAisles}
            setShowAisles={setShowAisles}
            showGroups={showGroups}
            setShowGroups={setShowGroups}
            selectedDeskId={selectedDeskId}
            setSelectedDeskId={setSelectedDeskId}
          />
        )}

        {activeTab === 'isometric3d' && (
          <RoomView3D
            desks={desks}
            teacherStation={teacherStation}
            loungeZone={loungeZone}
            whiteboard={whiteboard}
          />
        )}

        {activeTab === 'aiRenders' && (
          <AIVisualizerModal
            currentLayoutName={currentConfig.name}
            layoutMode={layoutMode}
          />
        )}

        {activeTab === 'sightlineAnalysis' && (
          <SightlineAnalyzer
            desks={desks}
            teacherStation={teacherStation}
            loungeZone={loungeZone}
            whiteboard={whiteboard}
            layoutMode={layoutMode}
            layoutName={currentConfig.name}
          />
        )}

        {activeTab === 'specsBOM' && <FurnitureBOMModal />}
      </main>

      {/* Footer Specification Strip */}
      <footer className="bg-slate-950 border-t border-slate-800 py-4 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>Room: 18'0" × 24'0" (432 sq ft / 40.1 m²)</span>
            <span>·</span>
            <span>Capacity: 30 Students + 1 Educator</span>
            <span>·</span>
            <span>Whiteboard: 16' Ceramic Porcelain</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Complies with ANSI/BIFMA X5.5 & ADA 36" Corridor Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
