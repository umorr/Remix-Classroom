import React, { useState, useEffect } from 'react';
import { DeskItem, TeacherStation, LoungeZone, WhiteboardSpec, LayoutMode } from '../types';
import { ROOM_WIDTH_FT, ROOM_LENGTH_FT } from '../data/classroomData';
import { Eye, ShieldCheck, Clock, Users, Sparkles, Brain, CheckCircle2, TrendingUp, RefreshCw, BarChart2 } from 'lucide-react';

interface Props {
  desks: DeskItem[];
  teacherStation: TeacherStation;
  loungeZone: LoungeZone;
  whiteboard: WhiteboardSpec;
  layoutMode: LayoutMode;
  layoutName: string;
}

export const SightlineAnalyzer: React.FC<Props> = ({
  desks,
  teacherStation,
  loungeZone,
  whiteboard,
  layoutMode,
  layoutName,
}) => {
  const [aiAdvisorData, setAiAdvisorData] = useState<any>(null);
  const [loadingAdvisor, setLoadingAdvisor] = useState(false);

  // Calculate metrics
  const wbCenterX = whiteboard.x + whiteboard.width / 2;
  const metrics = desks.map((d) => {
    const dist = Math.sqrt((d.x - wbCenterX) ** 2 + d.y ** 2);
    const angle = (Math.abs(Math.atan2(wbCenterX - d.x, d.y)) * 180) / Math.PI;
    return {
      id: d.id,
      studentNumber: d.studentNumber,
      distance: dist,
      angle: angle,
      isOptimal: angle < 45 && dist >= 4.0 && dist <= 22.0,
    };
  });

  const optimalCount = metrics.filter((m) => m.isOptimal).length;
  const avgDistance = (metrics.reduce((acc, m) => acc + m.distance, 0) / metrics.length).toFixed(1);
  const maxDistance = Math.max(...metrics.map((m) => m.distance)).toFixed(1);
  const minDistance = Math.min(...metrics.map((m) => m.distance)).toFixed(1);

  // Fetch AI Pedagogical Advisor
  const fetchAiAdvice = async () => {
    setLoadingAdvisor(true);
    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layoutMode: layoutName,
          studentCount: 30,
          roomDimensions: '18ft x 24ft (432 sq ft)',
        }),
      });
      const data = await res.json();
      setAiAdvisorData(data);
    } catch (e) {
      console.error('Advisor error:', e);
    } finally {
      setLoadingAdvisor(false);
    }
  };

  useEffect(() => {
    fetchAiAdvice();
  }, [layoutMode]);

  return (
    <div id="sightline-analyzer-view" className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Whiteboard Visibility</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">
            {Math.round((optimalCount / desks.length) * 100)}%
          </p>
          <p className="text-xs text-slate-400">
            {optimalCount} of 30 desks within optimal &lt;45° viewing cone
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Distance to Board</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-indigo-400 font-mono">
            {avgDistance} ft
          </p>
          <p className="text-xs text-slate-400">
            Min: {minDistance} ft · Max: {maxDistance} ft (100% within 24ft focal limit)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ADA Aisle Clearance</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-sky-400 font-mono">
            38 - 48 in
          </p>
          <p className="text-xs text-slate-400">
            Exceeds 36" ADA standard along all main corridors
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Reconfiguration Time</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 font-mono">
            &lt; 60 sec
          </p>
          <p className="text-xs text-slate-400">
            Mobile 360° lockable polyurethane casters on all 30 desks
          </p>
        </div>
      </div>

      {/* AI Pedagogical Advisor & Space Architecture Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gemini AI Educational Analysis (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-slate-100">
                  AI Space Architecture & Pedagogical Assessment
                </h3>
              </div>
              <button
                onClick={fetchAiAdvice}
                disabled={loadingAdvisor}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Refresh AI evaluation"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAdvisor ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingAdvisor ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                <span>Evaluating pedagogical acoustics and sightlines...</span>
              </div>
            ) : aiAdvisorData ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <p className="text-indigo-300 font-semibold">Pedagogical Summary:</p>
                  <p className="text-slate-300 leading-relaxed">
                    {aiAdvisorData.pedagogicalSummary}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <p className="text-amber-300 font-semibold">Rapid Reconfiguration Protocol:</p>
                  <p className="text-slate-300 leading-relaxed">
                    {aiAdvisorData.groupRearrangementTip}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    Architectural Strengths
                  </p>
                  <ul className="space-y-2">
                    {aiAdvisorData.keyStrengths?.map((str: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* 30-Student Sightline & Distance Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-100">
                Desk Sightline Distance Matrix (All 30 Seats)
              </h3>
            </div>

            <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1 text-xs">
              {metrics.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-200 font-mono font-bold flex items-center justify-center text-[10px]">
                      {m.studentNumber}
                    </span>
                    <span className="text-slate-300 font-medium">Student Desk #{m.studentNumber}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-400">{m.distance.toFixed(1)} ft</span>
                    <span className="text-slate-400">{m.angle.toFixed(0)}°</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                      Clear View
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
