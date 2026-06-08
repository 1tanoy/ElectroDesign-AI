/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface TwoDDrawingProps {
  categoryId: string;
  equipmentId: string;
  dimensions: Record<string, number>;
}

export default function TwoDDrawing({ categoryId, equipmentId, dimensions }: TwoDDrawingProps) {
  const [activeView, setActiveView] = useState<'front' | 'side' | 'cross_section'>('front');

  const w = dimensions?.W || 240;
  const h = dimensions?.H || 200;
  const d = dimensions?.D || 80;
  const winW = dimensions?.windowW || 40;
  const winH = dimensions?.windowH || 120;
  const coreRad = dimensions?.coreRadius || 20;

  // Let's normalize drawing coordinates to fit beautifully in an SVG container
  const paddingX = 40;
  const paddingY = 30;
  const canvasW = 320;
  const canvasH = 240;

  // Render SVG based on Category and selected View
  const renderSVGView = () => {
    if (categoryId === 'transformers') {
      const limbWidth = coreRad * 2;
      const xLeftCol = paddingX;
      const xRightCol = canvasW - paddingX - limbWidth;
      const xCenterCol = (canvasW - limbWidth) / 2;
      const yTop = paddingY;
      const yBot = canvasH - paddingY;
      const frameHeight = yBot - yTop;

      if (activeView === 'front') {
        return (
          <svg viewBox="0 0 320 240" className="w-full h-48 text-slate-800" id="svg_transformer_front">
            {/* Background workspace grid lines */}
            <defs>
              <pattern id="dot_grid_pattern" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#cbd5e1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot_grid_pattern)" />

            {/* Core Outer Boundary Frame */}
            <rect
              x={xLeftCol}
              y={yTop}
              width={canvasW - paddingX * 2}
              height={frameHeight}
              fill="none"
              stroke="#475569"
              strokeWidth="10"
              strokeLinejoin="miter"
              rx="4"
              id="draw_core_outline"
            />

            {/* Symmetrical Middle Limb */}
            <rect
              x={xCenterCol}
              y={yTop}
              width={limbWidth}
              height={frameHeight}
              fill="#64748b"
              stroke="#475569"
              strokeWidth="2"
              id="draw_middle_limb"
            />

            {/* Primary copper coil wrapping around left limb (dark orange/copper) */}
            <g opacity="0.95" id="draw_primary_winding">
              <rect x={xLeftCol + 10} y={yTop + 25} width={xCenterCol - xLeftCol - 20} height={frameHeight - 50} fill="#b45309" rx="2" />
              {/* Copper coil helix lines to simulate real turns */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <line
                  key={i}
                  x1={xLeftCol + 10}
                  y1={yTop + 25 + i * 18}
                  x2={xCenterCol - 10}
                  y2={yTop + 25 + i * 18 - 4}
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                />
              ))}
              <text x={xLeftCol + 15} y={yTop + 18} className="text-[9px] font-sans font-bold fill-white">PRIMARY HV</text>
            </g>

            {/* Secondary copper coil winding around right limb */}
            <g opacity="0.95" id="draw_secondary_winding">
              <rect x={xCenterCol + limbWidth + 10} y={yTop + 25} width={xCenterCol - xLeftCol - 20} height={frameHeight - 50} fill="#d97706" rx="2" />
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <line
                  key={i}
                  x1={xCenterCol + limbWidth + 10}
                  y1={yTop + 25 + i * 18}
                  x2={xRightCol + limbWidth - 10}
                  y2={yTop + 25 + i * 18 - 4}
                  stroke="#fef08a"
                  strokeWidth="4" // thicker turns secondary
                />
              ))}
              <text x={xCenterCol + limbWidth + 15} y={yTop + 18} className="text-[9px] font-sans font-bold fill-white">LV COILS</text>
            </g>

            {/* Dimension Callout Arrows */}
            <line x1={xLeftCol - 15} y1={yTop} x2={xLeftCol - 15} y2={yBot} stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" />
            <path d={`M ${xLeftCol - 15} ${yTop} l -4 8 m 4 -8 l 4 8 M ${xLeftCol - 15} ${yBot} l -4 -8 m 4 8 l 4 -8`} stroke="#6366f1" strokeWidth="1" />
            <text x={xLeftCol - 30} y={(yTop + yBot) / 2} className="text-[10px] font-mono fill-indigo-600 font-bold" transform={`rotate(-90 ${xLeftCol - 30} ${(yTop + yBot) / 2})`}>H: {h}mm</text>

            <line x1={xLeftCol} y1={yBot + 15} x2={canvasW - paddingX} y2={yBot + 15} stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" />
            <path d={`M ${xLeftCol} ${yBot + 15} l 8 -4 m -8 4 l 8 4 M ${canvasW - paddingX} ${yBot + 15} l -8 -4 m 8 4 l -8 4`} stroke="#6366f1" strokeWidth="1" />
            <text x={(xLeftCol + canvasW - paddingX) / 2} y={yBot + 25} className="text-[10px] font-mono fill-indigo-600 font-bold text-center" textAnchor="middle">W: {w}mm</text>
          </svg>
        );
      } else if (activeView === 'side') {
        return (
          <svg viewBox="0 0 320 240" className="w-full h-48 text-slate-800" id="svg_transformer_side">
            <rect width="100%" height="100%" fill="url(#dot_grid_pattern)" />
            {/* Side view of core stack plates with laminations */}
            <rect x="110" y={yTop} width={d < 120 ? 50 : 80} height={frameHeight} fill="#334155" stroke="#1e293b" strokeWidth="3" rx="1" />
            {/* Drawing vertical split laminations lines */}
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <line key={i} x1={110 + i * (d < 120 ? 7 : 11)} y1={yTop} x2={110 + i * (d < 120 ? 7 : 11)} y2={yBot} stroke="#475569" strokeWidth="1" />
            ))}

            {/* Winding profiles as blocks around the core stack */}
            <rect x="90" y={yTop + 25} width="20" height={frameHeight - 50} fill="#b45309" opacity="0.85" rx="1" />
            <rect x="110 + (d < 120 ? 50 : 80)" y={yTop + 25} width="20" height={frameHeight - 50} fill="#d97706" opacity="0.85" rx="1" />

            {/* Measurement lines */}
            <line x1="110" y1={yBot + 15} x2={110 + (d < 120 ? 50 : 80)} y2={yBot + 15} stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" />
            <text x={110 + (d < 120 ? 25 : 40)} y={yBot + 25} className="text-[10px] font-mono fill-indigo-600 font-semibold" textAnchor="middle">Stack D: {d}mm</text>
            <text x="160" y="25" className="text-[10px] font-sans font-bold fill-slate-500" textAnchor="middle">SILICON STEEL PLATES STACK</text>
          </svg>
        );
      } else {
        // Cross section/grain direction
        return (
          <svg viewBox="0 0 320 240" className="w-full h-48 text-slate-800" id="svg_transformer_cross">
            <rect width="100%" height="100%" fill="url(#dot_grid_pattern)" />
            {/* Beveled limb cross section */}
            <circle cx="160" cy="120" r="45" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="2 2" />
            {/* Cruciform stepped core section representing real engineering bevel stack! */}
            <rect x="130" y="85" width="60" height="70" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
            <rect x="120" y="95" width="80" height="50" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
            
            <circle cx="160" cy="120" r="3" fill="#ffffff" />
            
            {/* Coil winding outer boundary rings */}
            <circle cx="160" cy="120" r="54" fill="none" stroke="#b45309" strokeWidth="8" opacity="0.75" />
            <circle cx="160" cy="120" r="66" fill="none" stroke="#d97706" strokeWidth="10" opacity="0.7" />

            <text x="160" y="22" className="text-[9px] font-sans font-bold fill-slate-500" textAnchor="middle">CRUCIFORM STEPPED CORE CROSS-SECTION</text>
            <text x="235" y="115" className="text-[8px] font-mono fill-amber-700 font-bold">HV COIL SECT</text>
            <text x="235" y="130" className="text-[8px] font-mono fill-yellow-600 font-bold">LV COIL SECT</text>
          </svg>
        );
      }
    } else {
      // Motors View layout (Stator & Rotor dynamic representation)
      const statorRad = scaleRange(w, 100, 300, 50, 90);
      const rotorRad = statorRad * 0.65;
      const shfRad = dimensions?.shaftW || 15;

      if (activeView === 'front') {
        return (
          <svg viewBox="0 0 320 240" className="w-full h-48 text-slate-800" id="svg_motor_front">
            <rect width="100%" height="100%" fill="url(#dot_grid_pattern)" />
            
            {/* Stator Ring */}
            <circle cx="160" cy="120" r={statorRad} fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
            
            {/* Cooling fins callouts radiating outwards */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
              const rad = deg * Math.PI / 180;
              const x1 = 160 + Math.cos(rad) * statorRad;
              const y1 = 120 + Math.sin(rad) * statorRad;
              const x2 = 160 + Math.cos(rad) * (statorRad + 12);
              const y2 = 120 + Math.sin(rad) * (statorRad + 12);
              return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="2.5" />;
            })}

            {/* Inner Rotor stack */}
            <circle cx="160" cy="120" r={rotorRad} fill="#64748b" stroke="#334155" strokeWidth="2" />
            
            {/* Dynamic Symmetrical airgap slot circles representing stator copper packages */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
              const rad = deg * Math.PI / 180;
              const slotX = 160 + Math.cos(rad) * (statorRad - 12);
              const slotY = 120 + Math.sin(rad) * (statorRad - 12);
              return <circle key={deg} cx={slotX} cy={slotY} r="5" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />;
            })}

            {/* Center Shaft */}
            <circle cx="160" cy="120" r={shfRad} fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
            
            {/* Dimension Indicators Callout */}
            <line x1={160 - statorRad} y1="120" x2={160 + statorRad} y2="120" stroke="#6366f1" strokeWidth="1.2" strokeDasharray="2 2" />
            <text x="160" y="112" className="text-[9px] font-mono fill-indigo-600 font-bold" textAnchor="middle">Stator Dia: {w}mm</text>
          </svg>
        );
      } else if (activeView === 'side') {
        return (
          <svg viewBox="0 0 320 240" className="w-full h-48 text-slate-800" id="svg_motor_side">
            <rect width="100%" height="100%" fill="url(#dot_grid_pattern)" />
            {/* Motor Length profile showing shaft extension */}
            <rect x="100" y="60" width="120" height="120" fill="#1e293b" rx="4" />
            
            {/* Stator Casing horizontal lines representing fin extrusions */}
            {[75, 90, 105, 120, 135, 150, 165].map(y => (
              <line key={y} x1="100" y1={y} x2="220" y2={y} stroke="#334155" strokeWidth="2" />
            ))}

            {/* Shaft extensions protruding from left & right sides */}
            <rect x="60" y="112" width="40" height="16" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
            <rect x="220" y="112" width="40" height="16" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />

            <text x="160" y="50" className="text-[10px] font-sans font-bold fill-slate-500" textAnchor="middle">HOUSING BASE VIEW & DRIVE SHAFT</text>
            
            {/* Stack Width Marker */}
            <line x1="100" y1="192" x2="220" y2="192" stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" />
            <text x="160" y="205" className="text-[10px] font-mono fill-indigo-600 font-bold text-center" textAnchor="middle">Width: {d}mm</text>
          </svg>
        );
      } else {
        // Cross section view slots details
        return (
          <svg viewBox="0 0 320 240" className="w-full h-48 text-slate-800" id="svg_motor_cross">
            <rect width="100%" height="100%" fill="url(#dot_grid_pattern)" />
            {/* Focused slice showing winding slot and airgap detail */}
            <path d="M 120 40 Q 160 80 200 40 L 220 180 Q 160 140 100 180 Z" fill="#475569" stroke="#1e293b" strokeWidth="2" />
            
            {/* Specific stator slot showing coil entry detail */}
            <rect x="145" y="90" width="30" height="40" fill="#b45309" stroke="#d97706" rx="1" />
            <text x="160" y="115" className="text-[9px] font-mono fill-white text-center" textAnchor="middle">COILS</text>

            <rect x="145" y="135" width="30" height="25" fill="#38bdf8" stroke="#0284c7" rx="1" opacity="0.6" />
            <text x="160" y="152" className="text-[8px] font-mono fill-black" textAnchor="middle">INSUL</text>

            <text x="160" y="25" className="text-[8px] font-sans font-bold fill-slate-400" textAnchor="middle">DETAILED STATOR SLOT LAYER GRAPH</text>
          </svg>
        );
      }
    }
  };

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4" id="twod_drawing_root_card">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">2D Schematic Drawings</span>
        <div className="flex space-x-1">
          {(['front', 'side', 'cross_section'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded transition-all ${
                activeView === view
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              id={`btn_view_switch_${view}`}
            >
              {view.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center bg-white border border-slate-200 rounded-md overflow-hidden relative shadow-inner p-1">
        {renderSVGView()}
        <span className="absolute bottom-2 right-2 text-[8px] font-mono text-slate-400 uppercase">Scale 1:{categoryId === 'transformers' ? '12' : '4'}</span>
      </div>
    </div>
  );
}

// Simple helpers
function scaleRange(val: number, oldMin: number, oldMax: number, newMin: number, newMax: number) {
  const scaled = ((val - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
  return Math.min(newMax, Math.max(newMin, scaled));
}
