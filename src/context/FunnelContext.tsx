'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface FunnelState {
  iraAmount: string;
  focusAreas: string[];
  firstName: string;
  lastName: string;
  hasHadAdvisor: string;
  concerns: string[];
  household: string[];
  householdIncome: string;
  email: string;
  bookingDate: string;
  bookingTime: string;
  bookingTimestamp?: number;
  phone: string;
  otherConcern: string;
  passedEligibility: boolean;
  isBooked: boolean;
}

export const DEFAULT_FUNNEL_STATE: FunnelState = {
  iraAmount: 'below_100k',
  focusAreas: ['investments', 'retirement'],
  firstName: '',
  lastName: '',
  hasHadAdvisor: 'yes',
  concerns: ['wrong_mix'],
  household: ['Partner'],
  householdIncome: 'From500kTo1m',
  email: '',
  bookingDate: 'today',
  bookingTime: '4:00 PM',
  bookingTimestamp: undefined,
  phone: '',
  otherConcern: '',
  passedEligibility: false,
  isBooked: false,
};

interface FunnelContextType {
  state: FunnelState;
  updateState: (fields: Partial<FunnelState>) => void;
  isHydrated: boolean;
  resetFunnel: () => void;
}

const FunnelContext = createContext<FunnelContextType>({
  state: DEFAULT_FUNNEL_STATE,
  updateState: () => {},
  isHydrated: false,
  resetFunnel: () => {},
});

const STORAGE_KEY = 'range_ira_funnel_v1';

export function FunnelProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FunnelState>(DEFAULT_FUNNEL_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setState(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not restore funnel state from localStorage', e);
    }
    setIsHydrated(true);
  }, []);

  const updateState = (fields: Partial<FunnelState>) => {
    setState((prev) => {
      const next = { ...prev, ...fields };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save funnel state to localStorage', e);
      }
      return next;
    });
  };

  const resetFunnel = () => {
    setState(DEFAULT_FUNNEL_STATE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <FunnelContext.Provider value={{ state, updateState, isHydrated, resetFunnel }}>
      {children}
    </FunnelContext.Provider>
  );
}

export function useFunnel() {
  return useContext(FunnelContext);
}
