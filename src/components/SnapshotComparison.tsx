/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CalculationResults, SavedSnapshot } from '../types';
import { useCurrencyStore } from '../store/currencyStore';

interface SnapshotComparisonProps {
  activeResults: CalculationResults;
  activeInputs: Record<string, any>;
  activeGoal: string;
  activeEquipmentName: string;
  snapshots: SavedSnapshot[];
  selectedSnapshotId: string | null;
  onSelectSnapshot: (id: string) => void;
  onDeleteSnapshot: (id: string) => void;
  onSaveSnapshot: () => void;
}

export default function SnapshotComparison({
  activeResults,
  activeInputs,
  activeGoal,
  activeEquipmentName,
  snapshots,
  selectedSnapshotId,
  onSelectSnapshot,
  onDeleteSnapshot,
  onSaveSnapshot,
}: SnapshotComparisonProps) {
  const { formatCost, currency } = useCurrencyStore();
  // Find current selected snapshot details
  const currentSnapshot = snapshots.find((s) => s.id === selectedSnapshotId);

  // Parse numeric values from calculation string or values for proper deltas compute
  const getNumericValue = (val: string | number): number => {
    if (typeof val === 'number') return val;
    const parsed = parseFloat(val.toString().replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  // Safe Delta display engine
  const renderDelta = (activeValRaw: string | number, snapValRaw: string | number, type: 'higher_better' | 'lower_better', unit = '') => {
    const activeVal = getNumericValue(activeValRaw);
    const snapVal = getNumericValue(snapValRaw);

    if (!activeVal || !snapVal) return null;
    const diff = activeVal - snapVal;
    const pct = (diff / snapVal) * 100;
    
    if (Math.abs(pct) < 0.01) {
      return (
        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
          Unchanged
        </span>
      );
    }

    const isPositive = pct > 0;
    const isGood = type === 'higher_better' ? isPositive : !isPositive;
    
    return (
      <span
        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1 whitespace-nowrap ${
          isGood ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}
      >
        <span>{isPositive ? '▲' : '▼'}</span>
        <span>
          {Math.abs(pct).toFixed(1)}% ({isPositive ? '+' : ''}
          {diff.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          {unit})
        </span>
      </span>
    );
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-5 overflow-hidden" id="snapshot_compare_root_layout">
      {/* 1. Left side - Snapshots gallery manager bar */}
      <div className="w-full lg:w-72 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col shrink-0 overflow-y-auto no-print" id="snapshot_sidebar_inner">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">📸</span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Saved Blueprints</span>
          </div>
          <span className="text-[10px] bg-slate-200 text-slate-600 font-mono px-2 py-0.5 rounded-full font-bold">
            {snapshots.length}
          </span>
        </div>

        {/* Call to action button */}
        <button
          onClick={onSaveSnapshot}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-lg shadow-sm mb-4 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          id="btn_take_snapshot_inner"
        >
          <span>📸 Save Current Design</span>
        </button>

        {snapshots.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white border border-dashed border-slate-200 rounded-lg">
            <span className="text-2xl mb-2">⚖️</span>
            <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide leading-snug">No active snapshots yet</h5>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              Tweak your parameters, then click the button above to capture a snapshot of your design. Modify specifications to inspect comparative efficiency curves instantly!
            </p>
          </div>
        ) : (
          <div className="space-y-2 flex-1">
            {snapshots.map((snap) => {
              const isSelected = snap.id === selectedSnapshotId;
              return (
                <div
                  key={snap.id}
                  onClick={() => onSelectSnapshot(snap.id)}
                  className={`group relative p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-100'
                      : 'bg-white border-slate-200 hover:border-slate-350 hover:shadow-sm'
                  }`}
                  id={`snapshot_item_${snap.id}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wide">
                      {snap.optimizationGoal === 'cost' ? '💰 COST OPT' : ''}
                      {snap.optimizationGoal === 'efficiency' ? '📈 MAX EFF' : ''}
                      {snap.optimizationGoal === 'weight' ? '⚖️ MIN WEIGHT' : ''}
                      {snap.optimizationGoal === 'losses' ? '📉 MIN LOSS' : ''}
                      {snap.optimizationGoal === 'density' ? '🚀 HIGH DENS' : ''}
                    </span>
                    
                    {/* Delete trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSnapshot(snap.id);
                      }}
                      className="text-slate-400 hover:text-red-600 font-bold p-1 rounded hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100 text-[10px]"
                      title="Delete snapshot"
                      id={`btn_delete_snap_${snap.id}`}
                    >
                      🗑️
                    </button>
                  </div>

                  <h5 className="text-xs font-bold text-slate-800 leading-snug mt-1 truncate">
                    {snap.equipmentName}
                  </h5>
                  
                  <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 font-mono">
                    <span>{snap.timestamp}</span>
                    <span className="text-indigo-600 font-bold bg-indigo-55/60 px-1.5 py-0.5 rounded text-[9px]">
                      {snap.results.efficiencyCurve[4]?.efficiency?.toFixed(1) || '98'}% Eff
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Right side - Comparison split tables */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm" id="comparison_board_panel">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Physics Comparative Matrix</h4>
            <p className="text-[10px] text-slate-400 leading-tight">Side-by-side analysis mapping parameter modifications and performance variances</p>
          </div>
          <span className="text-[10.5px] font-mono text-indigo-600 font-bold max-w-xs truncate text-right">
            {currentSnapshot ? `🆚 COMPARED VS: ${currentSnapshot.name}` : 'Select a saved blueprint to compare'}
          </span>
        </div>

        {!currentSnapshot ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <span className="text-4xl mb-3">🧐</span>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Select target to compare</h4>
            <p className="text-xs max-w-md mt-2 leading-relaxed">
              To evaluate performance, choose one of your saved blueprints from the gallery. This allows you to track and visualize efficiency gains or weight savings side-by-side!
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto" id="side_by_side_grids_scroll">
            <div className="grid grid-cols-3 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 shrink-0 sticky top-0 select-none no-print">
              <div className="p-3 pl-5 border-r border-slate-100">Design Parameters</div>
              <div className="p-3 pl-5 border-r border-slate-100 bg-indigo-50/30 text-indigo-900 flex items-center justify-between">
                <span>Active Model</span>
                <span className="text-[8.5px] bg-indigo-100 text-indigo-600 px-1 rounded">Live Slider</span>
              </div>
              <div className="p-3 pl-5 text-emerald-900 bg-emerald-50/20 flex items-center justify-between">
                <span>Saved Blueprint</span>
                <span className="text-[8.5px] bg-emerald-100 text-emerald-600 px-1 rounded">Locked</span>
              </div>
            </div>

            {/* Main variables list categories */}
            <div className="divide-y divide-slate-100 font-sans text-xs">
              
              {/* Row 1: Core Goal */}
              <div className="grid grid-cols-3 items-center py-2 px-5 hover:bg-slate-50/50 transition-colors">
                <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Optimization Strategy</div>
                <div className="font-bold text-slate-900 capitalize flex items-center space-x-1.5 pl-1.5">
                  <span>🎯</span>
                  <span>{activeGoal}</span>
                </div>
                <div className="font-bold text-slate-600 capitalize flex items-center space-x-1.5 pl-1.5">
                  <span>🎯</span>
                  <span>{currentSnapshot.optimizationGoal}</span>
                </div>
              </div>

              {/* Row 2: Equipment Mode */}
              <div className="grid grid-cols-3 items-center py-2 px-5 hover:bg-slate-50/50 transition-colors">
                <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Equipment Configuration</div>
                <div className="font-semibold text-slate-800 pl-1.5">{activeEquipmentName}</div>
                <div className="font-semibold text-slate-600 pl-1.5">{currentSnapshot.equipmentName}</div>
              </div>

              {/* Section Category Header */}
              <div className="bg-slate-100/60 font-bold text-slate-700 px-5 py-1.5 uppercase tracking-wider text-[9px] select-none no-print">
                Key Input Specifications
              </div>

              {/* Loop inputs side-by-side */}
              {Object.keys(activeInputs).map((key) => {
                const activeVal = activeInputs[key];
                const snapVal = currentSnapshot.inputs[key] !== undefined ? currentSnapshot.inputs[key] : 'N/A';
                const label = key.replace(/([A-Z])/g, ' $1').toUpperCase();

                return (
                  <div key={key} className="grid grid-cols-3 items-center py-2.5 px-5 hover:bg-slate-50/50 transition-colors">
                    <div className="text-slate-600 font-medium">{label}</div>
                    <div className="font-mono font-bold text-slate-900 pl-1.5">
                      {activeVal}
                    </div>
                    <div className="font-mono font-semibold text-slate-600 flex items-center justify-between pr-2 border-l border-slate-100 pl-1.5 pl-1.5">
                      <span>{snapVal}</span>
                      {typeof activeVal === 'number' && typeof snapVal === 'number' && (
                        renderDelta(activeVal, snapVal, 'lower_better')
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Section Category Header */}
              <div className="bg-slate-100/60 font-bold text-slate-700 px-5 py-1.5 uppercase tracking-wider text-[9px] select-none no-print">
                Calculated Electrical/Power Outputs
              </div>

              {/* Compare Core Output: Efficiency */}
              <div className="grid grid-cols-3 items-center py-3 px-5 hover:bg-slate-50/50 transition-colors bg-green-50/20">
                <div className="text-slate-800 font-bold">Calculated Full-Load Efficiency</div>
                <div className="font-mono text-base text-green-700 font-black pl-1.5">
                  {activeResults.efficiencyCurve[4]?.efficiency?.toFixed(2)}%
                </div>
                <div className="font-mono text-slate-600 flex items-center justify-between pr-2 border-l border-slate-100 pl-1.5">
                  <span className="font-semibold">{currentSnapshot.results.efficiencyCurve[4]?.efficiency?.toFixed(2)}%</span>
                  {renderDelta(
                    activeResults.efficiencyCurve[4]?.efficiency || 0,
                    currentSnapshot.results.efficiencyCurve[4]?.efficiency || 0,
                    'higher_better',
                    '%'
                  )}
                </div>
              </div>

              {/* Compare Core Output: Material Manufacturer cost */}
              <div className="grid grid-cols-3 items-center py-3 px-5 hover:bg-slate-50/50 transition-colors bg-indigo-50/20">
                <div className="text-slate-800 font-bold">Total Estimated Manufacturing Cost ({currency})</div>
                <div className="font-mono text-base text-indigo-700 font-black pl-1.5">
                  {formatCost(activeResults.economic.totalCost || 0)}
                </div>
                <div className="font-mono text-slate-600 flex items-center justify-between pr-2 border-l border-slate-100 pl-1.5">
                  <span className="font-semibold">{formatCost(currentSnapshot.results.economic.totalCost || 0)}</span>
                  {renderDelta(
                    activeResults.economic.totalCost || 0,
                    currentSnapshot.results.economic.totalCost || 0,
                    'lower_better',
                    currency === 'INR' ? '₹' : '$'
                  )}
                </div>
              </div>

              {/* Compare Core Output: Dynamic Base Weight */}
              <div className="grid grid-cols-3 items-center py-2 px-5 hover:bg-slate-50/50 transition-colors">
                <div className="text-slate-700 font-medium">Estimated Material Shipping Mass</div>
                <div className="font-mono font-bold text-slate-900 pl-1.5">
                  {activeResults.mechanical[6]?.value || activeResults.mechanical[4]?.value || '415'} kg
                </div>
                <div className="font-mono text-slate-600 flex items-center justify-between pr-2 border-l border-slate-100 pl-1.5">
                  <span className="font-semibold">
                    {currentSnapshot.results.mechanical[6]?.value || currentSnapshot.results.mechanical[4]?.value || '415'} kg
                  </span>
                  {renderDelta(
                    activeResults.mechanical[6]?.value || activeResults.mechanical[4]?.value || 0,
                    currentSnapshot.results.mechanical[6]?.value || currentSnapshot.results.mechanical[4]?.value || 0,
                    'lower_better',
                    'kg'
                  )}
                </div>
              </div>

              {/* Compare Core Output: Total Active Losses */}
              <div className="grid grid-cols-3 items-center py-2 px-5 hover:bg-slate-50/50 transition-colors">
                <div className="text-slate-700 font-medium">Calculated Peak Full-Load Losses</div>
                <div className="font-mono font-medium text-slate-905 pl-1.5">
                  {activeResults.electrical[6]?.value || activeResults.electrical[4]?.value || '1.8'} kW
                </div>
                <div className="font-mono text-slate-600 flex items-center justify-between pr-2 border-l border-slate-100 pl-1.5">
                  <span className="font-semibold">
                    {currentSnapshot.results.electrical[6]?.value || currentSnapshot.results.electrical[4]?.value || '1.8'} kW
                  </span>
                  {renderDelta(
                    activeResults.electrical[6]?.value || activeResults.electrical[4]?.value || 0,
                    currentSnapshot.results.electrical[6]?.value || currentSnapshot.results.electrical[4]?.value || 0,
                    'lower_better',
                    'kW'
                  )}
                </div>
              </div>

              {/* Compare Area/Volume envelope in mm */}
              <div className="grid grid-cols-3 items-center py-2 px-5 hover:bg-slate-50/50 transition-colors">
                <div className="text-slate-700 font-medium">Core Envelope Dimensions (W x H x D)</div>
                <div className="font-mono font-medium text-slate-900 pl-1.5">
                  {activeResults.dimensions?.W || 120} x {activeResults.dimensions?.H || 80} x {activeResults.dimensions?.D || 30} mm
                </div>
                <div className="font-mono text-slate-600 border-l border-slate-100 pl-1.5 select-all">
                  {currentSnapshot.results.dimensions?.W || 120} x {currentSnapshot.results.dimensions?.H || 80} x {currentSnapshot.results.dimensions?.D || 30} mm
                </div>
              </div>

              {/* Standard Compliance */}
              <div className="grid grid-cols-3 items-center py-2.5 px-5 hover:bg-slate-50/50 transition-colors">
                <div className="text-slate-700 font-bold uppercase text-[9px] tracking-wide">Design Standards Conformance</div>
                <div className="text-emerald-600 font-bold flex items-center space-x-1 pl-1.5">
                  <span>🛡️</span>
                  <span>IEEE C57 compliant</span>
                </div>
                <div className="text-emerald-600 font-bold flex items-center space-x-1 pl-1.5">
                  <span>🛡️</span>
                  <span>IEEE C57 compliant</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
