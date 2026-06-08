/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { InputField } from '../types';

interface EngineeringInputProps {
  key?: React.Key;
  item: InputField;
  value: number;
  onChange: (key: string, value: any) => void;
}

export default function EngineeringInput({ item, value, onChange }: EngineeringInputProps) {
  const min = item.min ?? 1;
  const max = item.max ?? 10000;
  const step = item.step ?? 1;
  const unit = item.unit || '';

  // Local string state to let users type custom suffixes or intermediate values in real-time
  const [localText, setLocalText] = useState<string>(value.toString());
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state if value changes externally (e.g. from optimization sweep or snapshot load)
  useEffect(() => {
    if (!isFocused) {
      setLocalText(value.toString());
    }
  }, [value, isFocused]);

  // Clean and parse typed engineering strings
  const parseValue = (text: string): number | null => {
    const trimmed = text.trim().toLowerCase();
    if (!trimmed) return null;

    // Direct decimal number match
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return Number(trimmed);
    }

    // Capture number part and suffix
    const matches = trimmed.match(/^([\d.]+)\s*([a-zA-Z%°θφ/·²]*)$/);
    if (!matches) return null;

    const numVal = parseFloat(matches[1]);
    if (isNaN(numVal)) return null;

    const typedUnit = matches[2];

    // Intelligent suffix-to-base modifiers for electrical fields
    if (unit === 'V') {
      if (typedUnit === 'kv' || typedUnit === 'kv') {
        return numVal * 1000;
      }
    }
    if (unit === 'Hz') {
      if (typedUnit === 'khz') {
        return numVal * 1000;
      }
    }
    if (unit === 'kHz') {
      if (typedUnit === 'hz') {
        return numVal / 1000;
      }
    }
    if (unit === 'kW' || unit === 'kVA') {
      if (typedUnit === 'mw' || typedUnit === 'mva') {
        return numVal * 1000;
      }
      if (typedUnit === 'w' || typedUnit === 'va') {
        return numVal / 1000;
      }
    }

    return numVal;
  };

  const commitValue = (val: number) => {
    // Clamp to engineering boundaries
    const clamped = Math.min(max, Math.max(min, val));
    onChange(item.key, clamped);
    setLocalText(clamped.toString());
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incomingText = e.target.value;
    setLocalText(incomingText);

    // Try live-syncing the slider if it yields a completely valid parsed float immediately
    const parsed = parseValue(incomingText);
    if (parsed !== null && !isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(item.key, parsed);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseValue(localText);
    if (parsed !== null && !isNaN(parsed)) {
      commitValue(parsed);
    } else {
      // Revert to valid prop state on invalid gibberish typing
      setLocalText(value.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      increment();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      decrement();
    }
  };

  // Symmetrical increments
  const increment = () => {
    commitValue(Number((value + step).toFixed(4)));
  };

  const decrement = () => {
    commitValue(Number((value - step).toFixed(4)));
  };

  // Mouse wheel scroll acceleration increments
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      commitValue(Number((value + step).toFixed(4)));
    } else {
      commitValue(Number((value - step).toFixed(4)));
    }
  };

  return (
    <div 
      className="space-y-1.5 p-3 rounded-xl bg-slate-50/60 border border-slate-200/60 hover:bg-slate-50 transition-colors"
      onWheel={handleWheel}
      id={`eng_input_container_${item.key}`}
    >
      <div className="flex justify-between items-center select-none">
        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-left">
          {item.label}
        </label>
        <span className="text-[9px] font-mono font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
          Allowed: {min} - {max} {unit}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        {/* Decrement step button */}
        <button
          type="button"
          onClick={decrement}
          className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 font-bold transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer text-sm"
          id={`eng_input_dec_${item.key}`}
        >
          -
        </button>

        {/* Customized slider */}
        <div className="flex-1 flex items-center px-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => commitValue(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
            id={`eng_input_range_${item.key}`}
          />
        </div>

        {/* Text Input displaying raw or sufixed with inline parser support */}
        <div className="relative flex items-center shrink-0 w-24">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            title={`Enter a value between ${min} and ${max}. Supports engineering shorthand like 11kV.`}
            value={isFocused ? localText : `${value} ${unit}`.trim()}
            onChange={handleTextChange}
            onFocus={() => {
              setIsFocused(true);
              setLocalText(value.toString());
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full text-center py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all focus:outline-none"
            id={`eng_input_txt_${item.key}`}
          />
        </div>

        {/* Increment step button */}
        <button
          type="button"
          onClick={increment}
          className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 font-bold transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer text-sm"
          id={`eng_input_inc_${item.key}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
