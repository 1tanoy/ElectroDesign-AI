/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';

export interface ExchangeChange {
  timestamp: string;
  rate: number;
  source: 'api' | 'manual';
}

interface CurrencyState {
  currency: 'INR' | 'USD';
  exchangeRate: number; // 1 USD = X INR
  isManualOverride: boolean;
  history: ExchangeChange[];
  loading: boolean;
  setCurrency: (currency: 'INR' | 'USD') => void;
  setExchangeRate: (rate: number, isManual?: boolean) => void;
  fetchLiveRate: () => Promise<void>;
  formatCost: (usdValue: number, showSymbol?: boolean) => string;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currency: 'INR',
  exchangeRate: 83.45,
  isManualOverride: false,
  loading: false,
  history: [
    { timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), rate: 83.40, source: 'api' },
    { timestamp: new Date().toLocaleTimeString(), rate: 83.45, source: 'api' }
  ],

  setCurrency: (currency) => set({ currency }),

  setExchangeRate: (rate, isManual = true) => {
    const timestamp = new Date().toLocaleTimeString();
    set((state) => {
      const newHistory = [
        ...state.history,
        { timestamp, rate, source: isManual ? 'manual' as const : 'api' as const }
      ].slice(-10); // Keep last 10 entries
      return {
        exchangeRate: rate,
        isManualOverride: isManual ? true : state.isManualOverride,
        history: newHistory
      };
    });
  },

  fetchLiveRate: async () => {
    if (get().isManualOverride) return;
    set({ loading: true });
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error('Live rate query failed');
      const data = await res.json();
      const inrRate = data.rates?.INR;
      if (inrRate) {
        get().setExchangeRate(Number(inrRate.toFixed(2)), false);
      }
    } catch (err) {
      console.warn('Could not retrieve live exchange rates, falling back to 83.45', err);
    } finally {
      set({ loading: false });
    }
  },

  formatCost: (usdValue: number, showSymbol = true) => {
    const { currency, exchangeRate } = get();
    // Calculate final value based on currency
    const finalVal = currency === 'INR' ? usdValue * exchangeRate : usdValue;
    const localeStr = currency === 'INR' ? 'en-IN' : 'en-US';
    
    const formatted = Math.round(finalVal).toLocaleString(localeStr);
    if (!showSymbol) return formatted;
    
    return currency === 'INR' ? `₹${formatted}` : `$${formatted}`;
  }
}));
