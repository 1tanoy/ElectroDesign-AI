/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatMessagesProps {
  messages: ChatMessage[];
  loading: boolean;
}

export default function ChatMessages({ messages, loading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const renderBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const renderMessageText = (text: string) => {
    return text.split('\n').map((line, key) => {
      if (line.startsWith('### ')) {
        return (
          <h5 key={key} className="text-[11px] font-bold text-slate-900 mt-2.5 mb-1.5 uppercase font-sans">
            {line.replace('### ', '')}
          </h5>
        );
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const itemText = line.replace(/^\* |^- /, '');
        return (
          <li key={key} className="ml-3 mt-1 text-slate-700 list-disc leading-relaxed">
            {renderBoldText(itemText)}
          </li>
        );
      }
      return (
        <p key={key} className="leading-relaxed mt-1 mb-1 text-slate-800">
          {renderBoldText(line)}
        </p>
      );
    });
  };

  return (
    <div
      className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50 text-[11px] font-sans h-full min-h-0"
      id="chat_messages_scroll_panel"
    >
      {messages.map((msg, i) => {
        const isUser = msg.sender === 'user';
        return (
          <div
            key={i}
            className={`flex flex-col max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm border ${
              isUser
                ? 'bg-indigo-600 text-white ml-auto rounded-tr-none border-indigo-700'
                : 'bg-white text-slate-700 mr-auto rounded-tl-none border-slate-200'
            }`}
          >
            <div className="text-left select-text break-words">
              {isUser ? msg.text : renderMessageText(msg.text)}
            </div>
            <span
              className={`text-[8px] text-right mt-1 font-mono leading-none ${
                isUser ? 'text-indigo-200' : 'text-slate-400'
              }`}
            >
              {msg.timestamp}
            </span>
          </div>
        );
      })}

      {loading && (
        <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-tl-none px-3 py-2.5 mr-auto shadow-sm max-w-[65%] flex items-center space-x-2">
          <span className="text-[10px] italic">GenAI brain solving...</span>
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
