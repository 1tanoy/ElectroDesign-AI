/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { ChatMessage } from '../types';

interface AIAssistantState {
  isOpen: boolean;
  loading: boolean;
  isFullscreen: boolean;
  messages: ChatMessage[];
  setIsOpen: (isOpen: boolean) => void;
  setLoading: (loading: boolean) => void;
  setIsFullscreen: (isFullscreen: boolean) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
}

export const useAIAssistantStore = create<AIAssistantState>((set) => ({
  isOpen: false,
  loading: false,
  isFullscreen: false,
  messages: [],
  setIsOpen: (isOpen) => set({ isOpen }),
  setLoading: (loading) => set({ loading }),
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
}));
