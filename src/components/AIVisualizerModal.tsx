import React, { useState } from 'react';
import { AI_STYLE_PRESETS } from '../data/classroomData';
import { AIStylePreset, LayoutMode } from '../types';
import { Sparkles, Loader2, Download, Check, Image as ImageIcon, Eye, Wand2, RefreshCw, AlertCircle } from 'lucide-react';

interface Props {
  currentLayoutName: string;
  layoutMode: LayoutMode;
}

export const AIVisualizerModal: React.FC<Props> = ({ currentLayoutName, layoutMode }) => {
  const [selectedStyle, setSelectedStyle] = useState<AIStylePreset>(AI_STYLE_PRESETS[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [activeImageKey, setActiveImageKey] = useState<string>('scandinavian_biophilic');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate AI Photorealistic Classroom Render
  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    const key = `${selectedStyle.id}_${layoutMode}`;

    const promptText = customPrompt.trim() || selectedStyle.promptModifier;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          styleName: selectedStyle.name,
          layoutName: currentLayoutName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setGeneratedImages((prev) => ({ ...prev, [key]: data.imageUrl }));
        setActiveImageKey(key);
      } else {
        throw new Error(data.error || 'Failed to generate photorealistic render.');
      }
    } catch (err: any) {
      console.error('Render error:', err);
      setErrorMsg(err.message || 'Image generation encountered a service delay. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentActiveImage = generatedImages[activeImageKey] || generatedImages[`${selectedStyle.id}_${layoutMode}`];

  return (
    <div id="ai-visualizer-studio" className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Wand2 className="w-4 h-4" />
            <span>Generative AI Architectural Visualizer</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">
            Photorealistic 18' × 24' Classroom Render Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualize your exact 30-student ergonomic layout, teacher standing desk with bottom shelves, and modern lounge area rendered in high-definition interior design styles.
          </p>
        </div>

        <button
          id="trigger-ai-render-btn"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Rendering 3D Scene...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Render in {selectedStyle.name}</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Style Selector Cards (4 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select Interior Design Aesthetic
          </h3>

          <div className="space-y-3">
            {AI_STYLE_PRESETS.map((style) => {
              const isSelected = selectedStyle.id === style.id;
              return (
                <div
                  key={style.id}
                  onClick={() => setSelectedStyle(style)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-slate-100">{style.name}</h4>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <p className="text-xs text-indigo-300/90 font-medium mb-1.5">{style.subtitle}</p>
                  <p className="text-xs text-slate-400 line-clamp-2">{style.description}</p>

                  {/* Material Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {style.materials.map((mat, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-950 text-[10px] text-slate-300 font-mono border border-slate-800"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prompt Tuning Box */}
          <div className="mt-2 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
              <span>Custom Render Prompt Modifier (Optional)</span>
              <span className="text-[10px] text-slate-500 font-mono">Gemini 3.1 Flash Image</span>
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Add afternoon warm golden hour light, acoustic baffle clouds, and potted plants..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Render Preview Display (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>High-Resolution Architectural Viewport</span>
            {currentActiveImage && (
              <a
                href={currentActiveImage}
                download={`classroom-render-${selectedStyle.id}.png`}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download High-Res (4:3)</span>
              </a>
            )}
          </h3>

          <div className="relative aspect-[4/3] w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <Sparkles className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">
                    Generating Photorealistic Classroom Interior...
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Synthesizing 18'x24' room layout with 30 ergonomic desks, whiteboard, teacher standing desk with bottom shelves, and modern lounge sofa.
                  </p>
                </div>
              </div>
            ) : currentActiveImage ? (
              <img
                src={currentActiveImage}
                alt="Photorealistic Classroom Render"
                className="w-full h-full object-cover transition-opacity duration-300"
                referrerPolicy="no-referrer"
              />
            ) : (
              /* Architectural Style Concept Card */
              <div className="w-full h-full p-8 flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-950 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-3 z-10">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-semibold uppercase">
                    Style Concept Ready: {selectedStyle.name}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-100">
                    18' × 24' High School Classroom Concept
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                    {selectedStyle.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 z-10 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <p className="text-slate-500 text-[10px]">Student Seating</p>
                    <p className="font-semibold text-slate-200">30 Ergonomic Desks</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <p className="text-slate-500 text-[10px]">Whiteboard</p>
                    <p className="font-semibold text-slate-200">16ft Unobstructed</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <p className="text-slate-500 text-[10px]">Teacher Desk</p>
                    <p className="font-semibold text-slate-200">Standing + Shelves</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <p className="text-slate-500 text-[10px]">Lounge Area</p>
                    <p className="font-semibold text-slate-200">Sofa + Coffee Table</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end z-10">
                  <button
                    onClick={handleGenerate}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Generate Photorealistic AI Render</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
