/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Minus, X, Maximize2, Minimize2, Bot } from 'lucide-react';
import { useAIAssistantStore } from '../store/aiAssistantStore';

interface ChatHeaderProps {
  onMinimize: () => void;
  onClose: () => void;
}

export default function ChatHeader({ onMinimize, onClose }: ChatHeaderProps) {
  const { isFullscreen, setIsFullscreen } = useAIAssistantStore();

  return (
    <div
      className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between text-white select-none shrink-0 cursor-grab active:cursor-grabbing rounded-t-xl"
      id="chat_drag_header"
    >
      {/* Title with Pulse Status */}
      <div className="flex items-center space-x-2">
        <div className="bg-indigo-600/35 p-1 rounded">
          <Bot className="w-4.5 h-4.5 text-indigo-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-extrabold uppercase tracking-wider">AI Design Assistant</span>
          <span className="text-[8.5px] text-green-400 font-mono flex items-center leading-none mt-0.5">
            <span className="w-1 h-1 bg-green-400 rounded-full mr-1 animate-pulse" />
            ENGINEERING COPILOT
          </span>
        </div>
      </div>

      {/* Header action controls */}
      <div className="flex items-center space-x-1.5 no-drag">
        {/* Minimize Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          title="Minimize to button"
          id="btn_chat_minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Toggle Fullscreen / Expand Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen(!isFullscreen);
          }}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          title={isFullscreen ? 'Contract window size' : 'Expand window size'}
          id="btn_chat_fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
          title="Close assistant"
          id="btn_chat_close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
