/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { useAIAssistantStore } from '../store/aiAssistantStore';
import { motion } from 'motion/react';

export default function FloatingAIButton() {
  const { isOpen, setIsOpen } = useAIAssistantStore();
  const [showTooltip, setShowTooltip] = useState(false);

  // If the panel is open, we can hide the floating button OR still show it. The prompt says:
  // "When the user clicks the floating button: Open an AI Assistant panel."
  // "When the user clicks '_': Collapse back into the floating AI button. Result: Only floating button remains visible."
  // "When the user clicks 'X': Hide assistant panel. Show floating AI button."
  // This implies the floating button is hidden OR stays there. If only the floating button remains visible when panel is closed, then when panel is open we can choose to hide/fade out the button. Let's hide the button when the assistant is open, to keep the screen ultra-tidy, OR we can show/hide it using standard conditionals! Let's hide it if `isOpen` is true so it doesn't overlap behind the panel.
  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 no-print" id="floating_ai_trigger_container">
      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap select-none transition-all duration-200"
          id="ai_tooltip"
        >
          AI Design Assistant
        </div>
      )}

      {/* Pulsing Backglow Ring */}
      <div className="absolute inset-0 bg-indigo-600 rounded-full animate-ping opacity-25 pointer-events-none" />

      {/* Main Interactive Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)] border border-indigo-400 cursor-pointer outline-none select-none transition-shadow relative"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        id="btn_floating_ai"
      >
        <span className="relative">
          <Bot className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></span>
          </span>
        </span>
      </motion.button>
    </div>
  );
}
