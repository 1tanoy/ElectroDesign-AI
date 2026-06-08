/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';

interface QuickQueriesProps {
  onSelectQuery: (query: string) => void;
}

export default function QuickQueries({ onSelectQuery }: QuickQueriesProps) {
  const queries = [
    'Why was this core area selected?',
    'Is saturation risk present?',
    'How can efficiency be improved?',
    'Can material cost be reduced?',
    'Is this design IEEE compliant?',
    'What happens at 60 Hz operation?',
  ];

  return (
    <div className="p-3 border-t border-slate-100 bg-white space-y-1.5 shrink-0 select-none">
      <div className="flex items-center space-x-1 pl-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
        <HelpCircle className="w-3 h-3 text-slate-400" />
        <span>Quick Engineering Queries:</span>
      </div>
      <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto pr-0.5">
        {queries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuery(q)}
            className="text-[10px] text-left text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-indigo-200 p-1.5 rounded-lg transition-colors truncate block font-medium cursor-pointer"
            title={q}
            id={`quick_query_btn_${idx}`}
          >
            💡 {q}
          </button>
        ))}
      </div>
    </div>
  );
}
