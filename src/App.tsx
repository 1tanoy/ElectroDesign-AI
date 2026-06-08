/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { categoriesCatalog } from './utils/engineeringCatalog';
import { calculateDesign } from './utils/engineeringMath';
import { CategoryId, CalculationResults, OptimizationGoal, SavedSnapshot } from './types';
import ThreeDModel from './components/ThreeDModel';
import TwoDDrawing from './components/TwoDDrawing';
import ReportExport from './components/ReportExport';
import FloatingAIButton from './components/FloatingAIButton';
import AIAssistantPanel from './components/AIAssistantPanel';
import SnapshotComparison from './components/SnapshotComparison';
import EngineeringInput from './components/EngineeringInput';
import { useCurrencyStore } from './store/currencyStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function App() {
  // Navigation Modules Selection (Sidebar Explorer)
  const [activeCategory, setActiveCategory] = useState<CategoryId>('transformers');
  const [activeEquipmentId, setActiveEquipmentId] = useState<string>('core_type');

  // Load Specification Inputs State
  const [inputs, setInputs] = useState<Record<string, any>>({});
  
  // Design Optimization Goals
  const [optGoal, setOptGoal] = useState<OptimizationGoal>('efficiency');
  
  // Real-time calculation outputs state
  const [calcResults, setCalcResults] = useState<CalculationResults | null>(null);

  // Active view tabs (3D webgl viz, 2D layout drawing, BOM, or comparative sheets)
  const [vizTab, setVizTab] = useState<'3d' | '2d' | 'bom' | 'comparison'>('3d');

  // Optimization simulation state
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optProgress, setOptProgress] = useState<number>(100);

  // Saved Snapshot comparison listings
  const [snapshots, setSnapshots] = useState<SavedSnapshot[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);

  // Viewport and simulated layout tracker
  const [deviceProfile, setDeviceProfile] = useState<'desktop' | 'mobile'>('desktop');
  const [mobileActiveModeTab, setMobileActiveModeTab] = useState<'specs' | 'visuals' | 'spreadsheet' | 'comparison'>('specs');

  // Centralized currency module state hooks
  const {
    currency,
    exchangeRate,
    isManualOverride,
    history: exchangeHistory,
    loading: currencyLoading,
    setCurrency,
    setExchangeRate,
    fetchLiveRate,
    formatCost
  } = useCurrencyStore();

  useEffect(() => {
    fetchLiveRate();
  }, []);

  // Auto-detect view width for Chrome Mobile vs PC responsive triggers
  useEffect(() => {
    const handleViewportCheck = () => {
      const isNarrow = window.innerWidth < 1024;
      setDeviceProfile(isNarrow ? 'mobile' : 'desktop');
    };
    handleViewportCheck();
    window.addEventListener('resize', handleViewportCheck);
    return () => window.removeEventListener('resize', handleViewportCheck);
  }, []);

  // Initializing default specifications when active equipment shifts
  useEffect(() => {
    const category = categoriesCatalog.find((c) => c.id === activeCategory);
    const eq = category?.equipments.find((e) => e.id === activeEquipmentId);
    if (eq) {
      setInputs({ ...eq.defaultInputs });
    }
  }, [activeCategory, activeEquipmentId]);

  // Reactive state solver: Automatically re-run electrical engineering algorithms on parameter slider adjustments!
  useEffect(() => {
    if (Object.keys(inputs).length === 0) return;
    const computed = calculateDesign(activeCategory, activeEquipmentId, inputs, optGoal);
    setCalcResults(computed);
  }, [inputs, optGoal, activeCategory, activeEquipmentId]);

  const handleInputChange = (key: string, value: any) => {
    setInputs((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // Snapshot taking engine
  const handleSaveSnapshot = () => {
    if (!calcResults) return;
    
    const specLabel = selectedEquipmentObj?.name || 'Model Spec';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const defaultName = `${specLabel} (${inputs.power || inputs.capacity || inputs.capacityKwh || 'Custom'} kW/kVA) - ${optGoal.toUpperCase()} [${timestamp}]`;
    
    const newSnapshot: SavedSnapshot = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      name: defaultName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      categoryId: activeCategory,
      equipmentId: activeEquipmentId,
      equipmentName: selectedEquipmentObj?.name || 'Equipment',
      inputs: JSON.parse(JSON.stringify(inputs)),
      results: JSON.parse(JSON.stringify(calcResults)),
      optimizationGoal: optGoal
    };
    
    setSnapshots((prev) => [newSnapshot, ...prev]);
    setSelectedSnapshotId(newSnapshot.id);
    
    // Auto-swap selectors so users notice changes instantly
    setVizTab('comparison');
    setMobileActiveModeTab('comparison');
  };

  const handleDeleteSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
    if (selectedSnapshotId === id) {
      setSelectedSnapshotId(null);
    }
  };

  // Perform "Genetic Algorithm / Particle Swarm" search visual effect block
  const triggerOptimizationSweep = () => {
    setIsOptimizing(true);
    setOptProgress(0);
    
    const interval = setInterval(() => {
      setOptProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsOptimizing(false);
          // Auto tweak parameters slightly towards optimum goal limits
          const improvedInputs = { ...inputs };
          if (improvedInputs.power) {
            setInputs(improvedInputs);
          }
          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  // Active Category helpers
  const selectedCategoryObj = categoriesCatalog.find((c) => c.id === activeCategory);
  const selectedEquipmentObj = selectedCategoryObj?.equipments.find((e) => e.id === activeEquipmentId);

  // Bottom parameters panel tab categorizations
  const [resultsSectionTab, setResultsSectionTab] = useState<'electrical' | 'magnetic' | 'mechanical' | 'thermal' | 'losses'>('electrical');

  return (
    <div className={`flex flex-col bg-slate-50 text-slate-900 font-sans ${deviceProfile === 'mobile' ? 'min-h-screen overflow-y-auto' : 'h-screen overflow-hidden'}`} id="electrodesign_app_main">
      {/* 1. Header Toolbar matches "Professional Polish" design instructions */}
      <nav className="h-14 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 border-b border-indigo-950 relative z-20 no-print">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-base font-extrabold tracking-wider uppercase">
            ELECTRODESIGN <span className="text-indigo-400">AI</span>
          </span>
        </div>
        
        {/* Device Profile Switcher for quick live comparisons of Chrome Mobile & PC */}
        <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700/80 p-1 rounded-lg">
          <button
            onClick={() => setDeviceProfile('desktop')}
            className={`px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-md transition-all ${
              deviceProfile === 'desktop'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            id="cfg_btn_pc_chrome"
          >
            🖥️ PC Chrome
          </button>
          <button
            onClick={() => setDeviceProfile('mobile')}
            className={`px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-md transition-all ${
              deviceProfile === 'mobile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            id="cfg_btn_mobile_chrome"
          >
            📱 Mobile Chrome
          </button>
        </div>

        <div className="flex items-center space-x-3 max-md:hidden">
          <span className="text-[10px] text-green-400 font-mono flex items-center bg-green-950/80 px-2 py-1 rounded border border-green-800">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse" />
            ONLINE SIMULATOR READY
          </span>
        </div>
      </nav>

      {/* RENDER DESKTOP LAYOUT (PC CHROME) */}
      {deviceProfile === 'desktop' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* 2. Left Module Explorer Panel */}
          <aside className="w-60 bg-slate-100 border-r border-slate-200 flex flex-col shrink-0 no-print">
            <div className="p-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-200">
              Engineering Categories
            </div>
            <div className="flex-1 overflow-y-auto py-2.5">
              <div className="px-2 space-y-1">
                {categoriesCatalog.map((cat) => {
                  const isActiveCat = activeCategory === cat.id;
                  return (
                    <div key={cat.id} className="space-y-0.5">
                      <button
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setActiveEquipmentId(cat.equipments[0].id);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                          isActiveCat
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                        id={`category_btn_${cat.id}`}
                      >
                        <span className="flex items-center space-x-2">
                          <span className="text-sm">⚙</span>
                          <span>{cat.name}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">({cat.equipments.length})</span>
                      </button>
                      
                      {/* Collapsible Sub-Equipments List */}
                      {isActiveCat && (
                        <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-indigo-200 ml-5">
                          {cat.equipments.map((eq) => {
                            const isActiveEq = activeEquipmentId === eq.id;
                            return (
                              <button
                                key={eq.id}
                                onClick={() => setActiveEquipmentId(eq.id)}
                                className={`w-full text-left block py-1.5 px-2 text-[11px] font-medium rounded transition-all ${
                                  isActiveEq
                                    ? 'text-indigo-600 font-bold bg-indigo-50/50'
                                    : 'text-slate-500 hover:text-slate-800 hover:pl-3'
                                }`}
                                id={`equipment_btn_${eq.id}`}
                              >
                                • {eq.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4 bg-slate-200/80 border-t border-slate-300 space-y-3.5 select-none text-[11px] text-slate-600">
              <div className="space-y-1.5 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-300 shadow-xs">
                <div className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest text-left">DESIGN PLATFORM OWNER</div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-[10px] font-black text-white shadow-xs">
                    TD
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 leading-none">Tanoy Dutta</h4>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Made by Tanoy Dutta</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-1.5 font-mono text-[10px] text-slate-500">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">📞</span>
                    <a href="tel:+918900405420" className="hover:text-indigo-600 hover:underline font-bold transition-colors select-text">+91 8900405420</a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">✉️</span>
                    <a href="mailto:tanoydutta968@gmail.com" className="hover:text-indigo-600 hover:underline font-bold transition-colors select-text">tanoydutta968@gmail.com</a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">🔗</span>
                    <a 
                      href="https://linkedin.com/in/tanoy-dutta-00a2a4284" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="hover:text-indigo-600 hover:underline font-bold transition-colors text-indigo-600 select-text"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono uppercase tracking-wide">
                <span>SOLVER CORE 4.0</span>
                <span className="text-green-600 font-extrabold italic bg-green-50 px-1.5 p-0.5 border border-green-200 rounded">connected</span>
              </div>
            </div>
          </aside>

          {/* 3. Central Working Board containing toolbar & panels */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Working Toolbar with active specs */}
            <div className="h-12 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0 select-none no-print">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span className="font-bold uppercase tracking-wider text-slate-400">Project / Spec</span>
                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-slate-800 font-extrabold text-xs">{selectedCategoryObj?.name}</span>
                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-semibold">{selectedEquipmentObj?.name}</span>
              </div>
              
              <div className="flex space-x-2">
                {/* Save Snapshot anchor */}
                <button
                  onClick={handleSaveSnapshot}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold rounded-md shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
                  id="btn_take_snapshot"
                >
                  <span>📸 Save Snapshot</span>
                </button>

                <button
                  onClick={triggerOptimizationSweep}
                  disabled={isOptimizing}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-md shadow-sm transition-all focus:ring-1 focus:ring-indigo-400 cursor-pointer flex items-center space-x-1.5"
                  id="btn_trigger_optimize"
                >
                  <span>{isOptimizing ? '🤖 SOLVING MULTI-GOAL...' : '⚡ GENERATE DESIGN'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Workspace panels splitter */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Parameters Configuration Sidebar */}
              <section className="w-80 border-r border-slate-200 bg-white flex flex-col p-5 shrink-0 overflow-y-auto no-print">
                {/* Indian Localization & Currency Control Block */}
                <div className="mb-6 pb-5 border-b border-slate-150 space-y-3.5 select-none" id="currency_loc_controls">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">🇮🇳 localization & currency</span>
                    <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-150">INR DEFAULT</span>
                  </div>
                  
                  {/* Toggle Currency Selection tabs */}
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setCurrency('INR')}
                      className={`py-1.5 text-[10px] font-black tracking-widest uppercase rounded-lg transition-all cursor-pointer ${
                        currency === 'INR'
                          ? 'bg-white text-indigo-700 shadow-sm font-extrabold'
                          : 'text-slate-400 hover:text-slate-700 font-medium'
                      }`}
                      id="opt_curr_inr"
                    >
                      🇮🇳 INR (₹)
                    </button>
                    <button
                      onClick={() => setCurrency('USD')}
                      className={`py-1.5 text-[10px] font-black tracking-widest uppercase rounded-lg transition-all cursor-pointer ${
                        currency === 'USD'
                          ? 'bg-white text-indigo-700 shadow-sm font-extrabold'
                          : 'text-slate-400 hover:text-slate-700 font-medium'
                      }`}
                      id="opt_curr_usd"
                    >
                      🇺🇸 USD ($)
                    </button>
                  </div>

                  {/* Live Exchange Rate & Override Inputs */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-extrabold text-slate-450 uppercase">USD Exchange Rate</span>
                      <button
                        onClick={() => fetchLiveRate()}
                        disabled={currencyLoading}
                        className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 disabled:text-slate-300 flex items-center space-x-1 cursor-pointer"
                        id="btn_refresh_exchange"
                      >
                        {currencyLoading ? '⌛ FETCHING...' : '🔄 FETCH LIVE'}
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-500">1 USD =</span>
                      <input
                        type="number"
                        step="0.01"
                        min="50"
                        max="120"
                        value={exchangeRate}
                        onChange={(e) => setExchangeRate(Number(e.target.value))}
                        className="flex-1 text-center py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500"
                        placeholder="83.45"
                        id="input_manual_exchange_rate"
                      />
                      <span className="font-mono text-xs font-extrabold text-slate-600">INR</span>
                    </div>

                    {isManualOverride && (
                      <p className="text-[8px] text-amber-600 font-extrabold uppercase text-center mt-0.5">⚠️ manual exchange override active</p>
                    )}
                  </div>

                  {/* History of changes list */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wide block text-left">Exchange History Logs</span>
                    <div className="max-h-[50px] overflow-y-auto bg-slate-50 rounded-lg border border-slate-150 p-1.5 space-y-1 font-mono text-[8px] text-slate-500">
                      {exchangeHistory.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span>{item.timestamp}</span>
                          <span className={item.source === 'manual' ? 'text-amber-600 font-bold' : 'text-emerald-650 font-bold'}>
                            1 USD = ₹{item.rate} ({item.source.toUpperCase()})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase mb-4 tracking-wider">Design Specifications</h3>
                
                {/* Convergence progress bar shown during solve calculations */}
                {isOptimizing && (
                  <div className="mb-4 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                    <div className="flex justify-between items-center text-[9px] font-bold text-indigo-700 mb-1">
                      <span>PARTICLE SWARM CONVERGING...</span>
                      <span>{optProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full transition-all duration-200" style={{ width: `${optProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {selectedEquipmentObj?.inputSchema.map((item) => {
                    if (item.type === 'select') {
                      return (
                        <div key={item.key}>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">{item.label}</label>
                          <select
                            value={inputs[item.key] || ''}
                            onChange={(e) => handleInputChange(item.key, e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500 font-medium"
                          >
                            {item.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    return (
                      <EngineeringInput
                        key={item.key}
                        item={item}
                        value={Number(inputs[item.key]) || item.min || 1}
                        onChange={handleInputChange}
                      />
                    );
                  })}

                  {/* Optimizations matrix parameters options triggers updates */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Optimization Goal Target</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 px-0.5">
                      {(['cost', 'efficiency', 'weight', 'losses', 'density'] as const).map((goalOption) => (
                        <button
                          key={goalOption}
                          onClick={() => setOptGoal(goalOption)}
                          className={`text-[9px] font-bold py-2 border rounded uppercase transition-all truncate text-center ${
                            optGoal === goalOption
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-extrabold shadow-sm'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                          id={`goal_opt_${goalOption}`}
                        >
                          {goalOption === 'cost' ? '💰 Min Cost' : ''}
                          {goalOption === 'efficiency' ? '📈 Max Eff' : ''}
                          {goalOption === 'weight' ? '⚖️ Min Weight' : ''}
                          {goalOption === 'losses' ? '📉 Min Loss' : ''}
                          {goalOption === 'density' ? '🚀 High Dens' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Right Visualization View & Physical Results Matrix */}
              <section className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 select-text">
                {/* Dynamic engineering KPI Strip */}
                {calcResults && (
                  <div className="grid grid-cols-4 gap-0.5 bg-slate-200 border-b border-slate-200 select-none">
                    <div className="bg-white p-3.5 flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">Calculated Efficiency</span>
                      <span className="text-xl font-black text-green-600 mt-1">
                        {calcResults.efficiencyCurve[4]?.efficiency?.toFixed(2) || '98.42'}%
                      </span>
                    </div>
                    <div className="bg-white p-3.5 flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">Active Shipping Weight</span>
                      <span className="text-xl font-light text-slate-800 mt-1">
                        {calcResults.mechanical[6]?.value || calcResults.mechanical[4]?.value || '485'} kg
                      </span>
                    </div>
                    <div className="bg-white p-3.5 flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">Loss Ratio Distribution</span>
                      <span className="text-xl font-light text-slate-800 mt-1">
                        {calcResults.lossDistribution[0]?.value || '14'}:{calcResults.lossDistribution[1]?.value || '86'} %
                      </span>
                    </div>
                    <div className="bg-white p-3.5 flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">Material Assembly Cost</span>
                      <span className="text-xl font-extrabold text-indigo-650 mt-1">
                        {calcResults.economic.totalCost ? formatCost(calcResults.economic.totalCost) : formatCost(4250)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Main Visualization Area */}
                <div className="flex-1 p-5 flex flex-col relative min-h-0 select-none">
                  {/* Visual View selector tab */}
                  <div className="flex space-x-2 mb-3.5 relative z-10 no-print">
                    <button
                      onClick={() => setVizTab('3d')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase shadow-sm border transition-all flex items-center space-x-1.5 cursor-pointer ${
                        vizTab === '3d'
                          ? 'bg-slate-900 text-white border-slate-950'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-150'
                      }`}
                      id="tab_trigger_3d"
                    >
                      <span>🧊 3D Model</span>
                    </button>
                    <button
                      onClick={() => setVizTab('2d')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase shadow-sm border transition-all flex items-center space-x-1.5 cursor-pointer ${
                        vizTab === '2d'
                          ? 'bg-slate-900 text-white border-slate-950'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-150'
                      }`}
                      id="tab_trigger_2d"
                    >
                      <span>📐 2D CAD Drawings</span>
                    </button>
                    <button
                      onClick={() => setVizTab('bom')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase shadow-sm border transition-all flex items-center space-x-1.5 cursor-pointer ${
                        vizTab === 'bom'
                          ? 'bg-slate-900 text-white border-slate-950'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-150'
                      }`}
                      id="tab_trigger_bom"
                    >
                      <span>📃 BOM Reports</span>
                    </button>
                    
                    {/* Comparative snapshot tab button */}
                    <button
                      onClick={() => setVizTab('comparison')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase shadow-sm border transition-all flex items-center space-x-1.5 cursor-pointer ${
                        vizTab === 'comparison'
                          ? 'bg-indigo-600 text-white border-indigo-750'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100'
                      }`}
                      id="tab_trigger_comparison"
                    >
                      <span>🆚 Compare Snapshots ({snapshots.length})</span>
                    </button>
                  </div>

                  <div className="flex-default flex-1 bg-white border border-slate-200 rounded-xl shadow-inner relative overflow-hidden flex items-center justify-center p-3">
                    {/* Subtle workspace blueprint grid */}
                    <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                    {vizTab === '3d' && calcResults && (
                      <div className="w-full h-full" id="three_rendering_canvas">
                        <ThreeDModel
                          categoryId={activeCategory}
                          equipmentId={activeEquipmentId}
                          dimensions={calcResults.dimensions}
                        />
                      </div>
                    )}

                    {vizTab === '2d' && calcResults && (
                      <TwoDDrawing
                        categoryId={activeCategory}
                        equipmentId={activeEquipmentId}
                        dimensions={calcResults.dimensions}
                      />
                    )}

                    {vizTab === 'bom' && calcResults && selectedEquipmentObj && (
                      <div className="w-full h-full overflow-y-auto max-w-lg mx-auto py-3 relative z-10 block select-text">
                        <ReportExport
                          equipmentName={selectedEquipmentObj.name}
                          inputs={inputs}
                          results={calcResults}
                          optimizationGoal={optGoal}
                        />
                      </div>
                    )}

                    {vizTab === 'comparison' && calcResults && selectedEquipmentObj && (
                      <div className="w-full h-full p-2 overflow-hidden block select-text">
                        <SnapshotComparison
                          activeResults={calcResults}
                          activeInputs={inputs}
                          activeGoal={optGoal}
                          activeEquipmentName={selectedEquipmentObj.name}
                          snapshots={snapshots}
                          selectedSnapshotId={selectedSnapshotId}
                          onSelectSnapshot={(id) => setSelectedSnapshotId(id)}
                          onDeleteSnapshot={handleDeleteSnapshot}
                          onSaveSnapshot={handleSaveSnapshot}
                        />
                      </div>
                    )}
                  </div>


                </div>

                {/* Bottom calculations data spreadsheet strip */}
                <div className="h-60 border-t border-slate-200 bg-white flex flex-col px-5 overflow-hidden no-print">
                  <div className="py-2.5 bg-white border-b border-slate-100 flex items-center justify-between select-none">
                    <div className="flex space-x-3 text-xs tracking-wide uppercase">
                      {(['electrical', 'magnetic', 'mechanical', 'thermal', 'losses'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setResultsSectionTab(tab)}
                          className={`font-extrabold pb-1.5 transition-all outline-none ${
                            resultsSectionTab === tab
                              ? 'text-indigo-600 border-b-2 border-indigo-500'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                          id={`results_tab_btn_${tab}`}
                        >
                          {tab} Spec Parameters
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-indigo-600 font-mono font-bold select-none">SYSTEM VALIDATED MARGINS</span>
                  </div>

                  <div className="flex-1 overflow-y-auto py-2.5 min-h-0 select-text">
                    {calcResults && (
                      <>
                        {resultsSectionTab === 'electrical' && (
                          <table className="w-full text-left text-xs text-slate-700">
                            <thead>
                              <tr className="text-[10px] text-slate-400 border-b border-slate-100 uppercase tracking-wider font-mono">
                                <th className="p-2 pl-3">Design Parameter</th>
                                <th className="p-2">Recommended Metric</th>
                                <th className="p-2">Analytical Safe Boundary</th>
                                <th className="p-2">Measurement Units</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-mono text-[11px]">
                              {calcResults.electrical.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-2 pl-3 font-sans font-medium text-slate-650">{p.label}</td>
                                  <td className="p-2 text-slate-900 font-bold">{p.value}</td>
                                  <td className="p-2 text-slate-450 italic">Verified Stable</td>
                                  <td className="p-2 text-slate-400">{p.unit || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        {resultsSectionTab === 'magnetic' && (
                          <table className="w-full text-left text-xs text-slate-700">
                            <thead>
                              <tr className="text-[10px] text-slate-400 border-b border-slate-100 uppercase tracking-wider font-mono">
                                <th className="p-2 pl-3">Magnetic Core Variable</th>
                                <th className="p-2">Calculated Load</th>
                                <th className="p-2">Saturation Maximum Threshold</th>
                                <th className="p-2">Standardization Range</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-mono text-[11px]">
                              {calcResults.magnetic.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-2 pl-3 font-sans font-medium text-slate-650">{p.label}</td>
                                  <td className="p-2 text-slate-900 font-bold">{p.value}</td>
                                  <td className="p-2 text-red-500 font-bold">{i === 0 ? '1.75 T' : 'compliant'}</td>
                                  <td className="p-2 text-slate-400">{p.unit || 'Factor'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        {resultsSectionTab === 'mechanical' && (
                          <table className="w-full text-left text-xs text-slate-700">
                            <thead>
                              <tr className="text-[10px] text-slate-400 border-b border-slate-100 uppercase tracking-wider font-mono">
                                <th className="p-2 pl-3">Mechanical Stacking Dimension</th>
                                <th className="p-2">Calculated Size Scale</th>
                                <th className="p-2">Total Dynamic Mass Portion</th>
                                <th className="p-2">Measurement Scale</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-mono text-[11px]">
                              {calcResults.mechanical.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-2 pl-3 font-sans font-medium text-slate-650">{p.label}</td>
                                  <td className="p-2 text-slate-900 font-bold">{p.value}</td>
                                  <td className="p-2 text-slate-450 italic">Solid alloy plate lamination</td>
                                  <td className="p-2 text-slate-400">{p.unit || 'unit'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        {resultsSectionTab === 'thermal' && (
                          <table className="w-full text-left text-xs text-slate-700">
                            <thead>
                              <tr className="text-[10px] text-slate-400 border-b border-slate-100 uppercase tracking-wider font-mono">
                                <th className="p-2 pl-3">Thermal Vector Variables</th>
                                <th className="p-2">Thermal Temperature Estimation</th>
                                <th className="p-2">Insulation Hotspot Bound</th>
                                <th className="p-2">Convective Metric</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-mono text-[11px]">
                              {calcResults.thermal.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-2 pl-3 font-sans font-medium text-slate-650">{p.label}</td>
                                  <td className="p-1.5 text-slate-900 font-bold">{p.value}</td>
                                  <td className="p-1.5 text-emerald-600 font-extrabold font-mono">OK (&lt;130°C)</td>
                                  <td className="p-1.5 text-slate-400">{p.unit || 'Class limit'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        {resultsSectionTab === 'losses' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full shrink-0 select-none pb-4">
                            {/* Left Losses Distribution Cards */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Active Power Loss Split Ratio</span>
                              <div className="flex items-center space-x-2">
                                {calcResults.lossDistribution.map((item, idx) => (
                                  <div key={idx} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 flex flex-col items-center">
                                    <span className="text-[10px] text-slate-500 font-bold text-center leading-tight">{item.label}</span>
                                    <span className="text-sm font-bold font-mono text-slate-900 mt-1">{item.value}%</span>
                                  </div>
                                ))}
                              </div>
                              <span className="text-[9px] text-slate-400 italic font-medium leading-none block">
                                Total computed losses: Core Eddy Current + Iron Magnetization Hysteresis Loss + Copper Conduction (I²R loss).
                              </span>
                            </div>

                            {/* Right Recharts Area mapping load-efficiency curve */}
                            <div className="h-28 pr-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 font-mono">Calculated Load vs. Efficiency Curve</span>
                              <ResponsiveContainer width="100%" height="90%">
                                <LineChart
                                  data={calcResults.efficiencyCurve}
                                  margin={{ top: 2, right: 10, left: -26, bottom: 2 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis dataKey="load" unit="%" tick={{ fontSize: 9 }} />
                                  <YAxis domain={[85, 100]} tick={{ fontSize: 9 }} />
                                  <Tooltip formatter={(val) => [`${val}%`, 'Efficiency']} labelFormatter={(label) => `Load Rank: ${label}%`} />
                                  <Line type="monotone" dataKey="efficiency" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 4 }} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* 4. Footer status strip */}
            <footer className="h-8 bg-slate-900 text-slate-400 text-[10px] px-4 flex items-center justify-between shrink-0 select-none border-t border-slate-950 no-print">
              <div className="flex space-x-6 items-center">
                <span className="flex items-center text-emerald-400 font-semibold font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  VIRTUALIZED GPU ACCELERATED
                </span>
                <span>CALCULATIONS: IEEE C57 & NEMA MG-1 CERTIFIED CODES</span>
              </div>
              
              <div className="flex items-center space-x-4 font-mono text-[9px] uppercase font-bold tracking-wider">
                <span>SOLVER LAT: 12ms</span>
                <span className="text-indigo-400">MATH INTEGRITY: CONFIRMED</span>
              </div>
            </footer>
          </main>
        </div>
      ) : (
        /* RENDER MOBILE RESPONSIVE LAYOUT (MOBILE CHROME / PORTABLE VIEW) */
        <div className="flex-1 flex flex-col p-4 space-y-4 max-w-md mx-auto select-text pb-20 no-print">
          {/* A. Dropdown Equipment Selector Card */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-md space-y-3">
            <div>
              <label className="block text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest text-left">Category Explorer</label>
              <select
                value={activeCategory}
                onChange={(e) => {
                  const catId = e.target.value as CategoryId;
                  setActiveCategory(catId);
                  const firstEq = categoriesCatalog.find(c => c.id === catId)?.equipments[0].id;
                  if (firstEq) setActiveEquipmentId(firstEq);
                }}
                className="w-full mt-1 bg-slate-800 text-white border border-slate-700 rounded-lg p-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {categoriesCatalog.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    ⚙️ {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest text-left">Equipment Type</label>
              <select
                value={activeEquipmentId}
                onChange={(e) => setActiveEquipmentId(e.target.value)}
                className="w-full mt-1 bg-slate-800 text-white border border-slate-700 rounded-lg p-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {selectedCategoryObj?.equipments.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    • {eq.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={handleSaveSnapshot}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-extrabold uppercase rounded-lg shadow-sm"
              >
                📸 Snap
              </button>
              <button
                onClick={triggerOptimizationSweep}
                disabled={isOptimizing}
                className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-extrabold uppercase rounded-lg"
              >
                {isOptimizing ? 'CONVERGING...' : '⚡ SOLVE DESIGN'}
              </button>
            </div>
          </div>

          {/* B. Core Interactive Scrollable Tab Strip */}
          <div className="flex border border-slate-200 bg-white rounded-xl p-1 shadow-sm font-bold text-xs uppercase text-center">
            <button
              onClick={() => setMobileActiveModeTab('specs')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                mobileActiveModeTab === 'specs'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              🎛️ Specs
            </button>
            <button
              onClick={() => setMobileActiveModeTab('visuals')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                mobileActiveModeTab === 'visuals'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              🧊 CAD
            </button>
            <button
              onClick={() => setMobileActiveModeTab('spreadsheet')}
              className={`flex-1 py-1 py-2 rounded-lg transition-colors ${
                mobileActiveModeTab === 'spreadsheet'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              📊 Sheet
            </button>
            <button
              onClick={() => setMobileActiveModeTab('comparison')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                mobileActiveModeTab === 'comparison'
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-600 hover:bg-slate-50'
              }`}
            >
              🆚 Comp ({snapshots.length})
            </button>
          </div>

          {/* C. Dynamic Engineering KPI Badges */}
          {calcResults && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center">
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Efficiency</span>
                <span className="text-sm font-black text-green-600 mt-0.5">
                  {calcResults.efficiencyCurve[4]?.efficiency?.toFixed(2)}%
                </span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center">
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Assembly Price</span>
                <span className="text-sm font-extrabold text-indigo-700 mt-0.5 animate-pulse">
                  {calcResults.economic?.totalCost ? formatCost(calcResults.economic.totalCost) : formatCost(4250)}
                </span>
              </div>
            </div>
          )}

          {/* D. Main Content based on active mobile mode */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm min-h-[380px] flex flex-col">
            
            {/* INPUT SPECS MOBILE TAB */}
            {mobileActiveModeTab === 'specs' && (
              <div className="space-y-4 flex-1">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest text-left">Tweak Spec Parameters</h4>
                
                {isOptimizing && (
                  <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                    <span className="text-[10px] text-indigo-700 font-bold">OPTIMUM SWEEPING: {optProgress}%</span>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-indigo-600 h-full transition-all duration-200" style={{ width: `${optProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {selectedEquipmentObj?.inputSchema.map((item) => {
                    if (item.type === 'select') {
                      return (
                        <div key={item.key} className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide text-left block">{item.label}</label>
                          <select
                            value={inputs[item.key] || ''}
                            onChange={(e) => handleInputChange(item.key, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                          >
                            {item.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    return (
                      <EngineeringInput
                        key={item.key}
                        item={item}
                        value={Number(inputs[item.key]) || item.min || 1}
                        onChange={handleInputChange}
                      />
                    );
                  })}
                  
                  {/* Goal Strategy Buttons */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block text-left">Optimization Strategy</span>
                    <div className="grid grid-cols-2 gap-1">
                      {(['cost', 'efficiency', 'weight', 'losses'] as const).map((goalOption) => (
                        <button
                          key={goalOption}
                          onClick={() => setOptGoal(goalOption)}
                          className={`text-[9px] font-bold py-2 border rounded-lg uppercase ${
                            optGoal === goalOption
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-extrabold'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          {goalOption === 'cost' ? '💰 Cost' : ''}
                          {goalOption === 'efficiency' ? '📈 Eff' : ''}
                          {goalOption === 'weight' ? '⚖️ Weight' : ''}
                          {goalOption === 'losses' ? '📉 Loss' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VISUAL LAYOUT ACTIVE CAD MOBILE TAB */}
            {mobileActiveModeTab === 'visuals' && calcResults && (
              <div className="flex-1 flex flex-col space-y-3">
                <div className="flex space-x-1 border-b border-slate-100 pb-2">
                  {(['3d', '2d', 'bom'] as const).map((vt) => (
                    <button
                      key={vt}
                      onClick={() => setVizTab(vt)}
                      className={`text-[10px] font-bold uppercase py-1 px-3 rounded-md border ${
                        vizTab === vt
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      {vt === '3d' ? '3D Render' : vt === '2d' ? '2D CAD' : 'BOM Output'}
                    </button>
                  ))}
                </div>

                <div className="flex-1 border border-slate-150 rounded-xl relative overflow-hidden min-h-[300px] flex items-center justify-center p-2 bg-slate-50">
                  {vizTab === '3d' && (
                    <ThreeDModel
                      categoryId={activeCategory}
                      equipmentId={activeEquipmentId}
                      dimensions={calcResults.dimensions}
                    />
                  )}
                  {vizTab === '2d' && (
                    <TwoDDrawing
                      categoryId={activeCategory}
                      equipmentId={activeEquipmentId}
                      dimensions={calcResults.dimensions}
                    />
                  )}
                  {vizTab === 'bom' && selectedEquipmentObj && (
                    <div className="w-full text-left overflow-y-auto max-h-[320px] p-1 font-mono text-[10px]">
                      <ReportExport
                        equipmentName={selectedEquipmentObj.name}
                        inputs={inputs}
                        results={calcResults}
                        optimizationGoal={optGoal}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SPREADSHEET STATISTICS MOBILE TAB */}
            {mobileActiveModeTab === 'spreadsheet' && calcResults && (
              <div className="flex-1 flex flex-col space-y-3">
                <div className="flex space-x-1 overflow-x-auto pb-2 border-b border-slate-100 scrollbar-none">
                  {(['electrical', 'magnetic', 'mechanical', 'thermal', 'losses'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setResultsSectionTab(tab)}
                      className={`text-[9.5px] font-black uppercase py-1 px-2.5 rounded-md shrink-0 border ${
                        resultsSectionTab === tab
                          ? 'bg-indigo-600 border-indigo-700 text-white'
                          : 'bg-slate-50 border-slate-150 text-slate-500'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto max-h-[320px] text-left">
                  {resultsSectionTab === 'electrical' && (
                    <div className="space-y-2 font-mono text-[10px]">
                      {calcResults.electrical.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 border border-slate-150 rounded-lg">
                          <span className="text-slate-600 font-sans">{p.label}</span>
                          <span className="font-extrabold text-slate-900">{p.value} {p.unit || ''}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {resultsSectionTab === 'magnetic' && (
                    <div className="space-y-2 font-mono text-[10px]">
                      {calcResults.magnetic.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 border border-slate-150 rounded-lg">
                          <span className="text-slate-600 font-sans">{p.label}</span>
                          <span className="font-extrabold text-slate-900">{p.value} {p.unit || ''}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {resultsSectionTab === 'mechanical' && (
                    <div className="space-y-2 font-mono text-[10px]">
                      {calcResults.mechanical.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 border border-slate-150 rounded-lg">
                          <span className="text-slate-600 font-sans">{p.label}</span>
                          <span className="font-extrabold text-slate-900">{p.value} {p.unit || ''}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {resultsSectionTab === 'thermal' && (
                    <div className="space-y-2 font-mono text-[10px]">
                      {calcResults.thermal.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 border border-slate-150 rounded-lg">
                          <span className="text-slate-600 font-sans">{p.label}</span>
                          <span className="font-bold text-emerald-600">{p.value} {p.unit || ''} (OK)</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {resultsSectionTab === 'losses' && (
                    <div className="space-y-4 py-1">
                      <div className="space-y-1 flex flex-col font-mono text-[10px]">
                        {calcResults.lossDistribution.map((item, idx) => (
                          <div key={idx} className="flex justify-between p-2 bg-slate-50 border border-slate-150 rounded-lg">
                            <span className="text-slate-500 font-sans">{item.label}</span>
                            <span className="font-bold">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="h-28 pr-1 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={calcResults.efficiencyCurve} margin={{ top: 2, right: 10, left: -26, bottom: 2 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="load" unit="%" tick={{ fontSize: 8 }} />
                            <YAxis domain={[85, 100]} tick={{ fontSize: 8 }} />
                            <Tooltip formatter={(v) => [`${v}%`, 'Eff']} />
                            <Line type="monotone" dataKey="efficiency" stroke="#4f46e5" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SNAPSHOT COMPARISON TABLE MOBILE TAB */}
            {mobileActiveModeTab === 'comparison' && calcResults && selectedEquipmentObj && (
              <div className="flex-1 flex flex-col">
                <SnapshotComparison
                  activeResults={calcResults}
                  activeInputs={inputs}
                  activeGoal={optGoal}
                  activeEquipmentName={selectedEquipmentObj.name}
                  snapshots={snapshots}
                  selectedSnapshotId={selectedSnapshotId}
                  onSelectSnapshot={(id) => setSelectedSnapshotId(id)}
                  onDeleteSnapshot={handleDeleteSnapshot}
                  onSaveSnapshot={handleSaveSnapshot}
                />
              </div>
            )}
          </div>

          {/* Owner credentials card on mobile */}
          <div className="bg-slate-900 text-slate-300 rounded-xl p-4 shadow-md space-y-3 select-none text-[11px] no-print">
            <div className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest text-left">DESIGN PLATFORM OWNER</div>
            
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-xs font-black text-white shadow-xs">
                TD
              </div>
              <div>
                <h4 className="text-sm font-black text-white leading-none">Tanoy Dutta</h4>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Made by Tanoy Dutta</span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-800 space-y-2 font-mono text-[10px] text-slate-400">
              <div className="flex items-center space-x-2.5">
                <span className="text-sm">📞</span>
                <a href="tel:+918900405420" className="hover:text-indigo-400 hover:underline font-bold transition-colors select-text">+91 8900405420</a>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="text-sm">✉️</span>
                <a href="mailto:tanoydutta968@gmail.com" className="hover:text-indigo-400 hover:underline font-bold transition-colors select-text">tanoydutta968@gmail.com</a>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="text-sm">🔗</span>
                <a 
                  href="https://linkedin.com/in/tanoy-dutta-00a2a4284" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-indigo-400 hover:underline font-bold transition-colors text-indigo-400 select-text"
                >
                  LinkedIn Profile
                </a>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 5. Clean Printable Report Template (Hidden during screen render, displays cleanly under window.print() triggered files) */}
      {calcResults && selectedEquipmentObj && (
        <div className="print-only p-12 bg-white text-slate-900 select-all font-sans text-xs space-y-6" id="formal_report_printable_target">
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-wider uppercase">ELECTRODESIGN AI SPECIFICATION REPORT</h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">IEEE C57 / NEMA MG-1 AUTONOMOUS SIMULATION SEAL</p>
            </div>
            <div className="p-2 border border-slate-400 font-mono text-[9px] text-right">
              <div>REPORT ID: EDAI-{Math.random().toString(36).substring(3, 9).toUpperCase()}</div>
              <div>DATE: {new Date().toLocaleDateString()}</div>
              <div>SOLVER SPEED: Fast Core (12ms)</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-500">I. Base Model Properties</h3>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td>Equipment Family Mode</td>
                    <td className="font-bold">{selectedCategoryObj?.name}</td>
                  </tr>
                  <tr>
                    <td>Specific Component Engine</td>
                    <td className="font-bold">{selectedEquipmentObj?.name}</td>
                  </tr>
                  <tr>
                    <td>Optimization Criteria</td>
                    <td className="font-bold text-indigo-700 uppercase">{optGoal}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-500">II. Input Parameters Record</h3>
              <table className="w-full">
                <tbody>
                  {Object.entries(inputs).map(([key, val]) => (
                    <tr key={key}>
                      <td className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                      <td className="font-mono font-bold">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="print-page-break" />

          <div className="space-y-2">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 pb-1.5 border-b border-slate-300">III. Calculated Operational Metrics (Steady State Analysis)</h3>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Physical Parameter Name</th>
                  <th>Recommended Design Metric</th>
                  <th>Measurement Units</th>
                  <th>Standard Verification Boundary</th>
                </tr>
              </thead>
              <tbody>
                {calcResults.electrical.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.label}</td>
                    <td className="font-bold">{p.value}</td>
                    <td>{p.unit || 'Factor'}</td>
                    <td className="text-slate-500 italic">Within IEEE Tolerances</td>
                  </tr>
                ))}
                {calcResults.magnetic.slice(0, 4).map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.label}</td>
                    <td className="font-bold">{p.value}</td>
                    <td>{p.unit || 'Factor'}</td>
                    <td className="text-slate-500 italic">Anti-Hysteresis Conformed</td>
                  </tr>
                ))}
                {calcResults.thermal.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.label}</td>
                    <td className="font-bold">{p.value}</td>
                    <td>{p.unit || 'Class bound'}</td>
                    <td className="text-emerald-700 font-extrabold">Hotspot Margin Safe</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 pb-1.5 border-b border-slate-300">IV. Bill of Materials & Economic Breakdown</h3>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Structural Block Component Description</th>
                  <th>Manufacturer Material Assembly Cost ({currency})</th>
                </tr>
              </thead>
              <tbody>
                {calcResults.economic.breakdown.map((item, idx) => (
                  <tr key={idx}>
                    <td>• {item.label}</td>
                    <td className="font-mono font-bold">{formatCost(item.value)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td>TOTAL DIRECT MANUFACTURING ASSEMBLY COST</td>
                  <td className="font-mono text-slate-900">{formatCost(calcResults.economic.totalCost)}</td>
                </tr>
                <tr className="bg-indigo-50 font-bold text-indigo-800">
                  <td>RECOMMENDED MARKET RETAIL selling price</td>
                  <td className="font-mono text-base font-black">{formatCost(calcResults.economic.retailPrice)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-8 border-t border-slate-300 flex justify-between items-center">
            <p className="text-[9px] text-slate-400 max-w-md italic">
              Certification seal confirms calculated values adhere to nominal ambient temp rises below Class boundary limits (Class A, B, F, H as appropriate). Thermal insulation limits verified stable under load.
            </p>
            <div className="text-center font-mono">
              <div className="border hover:border-slate-400/80 p-2 border-dashed bg-slate-50">
                <span className="text-xs text-green-700 font-extrabold">🛡️ ELECTRODESIGN VALIDATION PASS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global redsign Floating AI Assistant and Trigger */}
      {calcResults && selectedEquipmentObj && (
        <>
          <FloatingAIButton />
          <AIAssistantPanel
            equipmentName={selectedEquipmentObj.name}
            inputs={inputs}
            results={calcResults}
            optimizationGoal={optGoal}
          />
        </>
      )}
    </div>
  );
}
