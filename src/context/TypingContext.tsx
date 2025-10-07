export interface PerformanceEntry {
  second: number;
  chars: number;
  errors: number;
}

export interface TypingContext {
  difficulty: 'normal' | 'hard';
  time: number;
  language: 'pt-BR' | 'en-US';
  data: PerformanceEntry[];
  totalTyped: number;
  currentErrors: number;
  isRunning: boolean;
}

interface TypingContextValue {
  info: TypingContext;
  updateInfo: (newInfo: Partial<TypingContext>) => void;
}

import { createContext, useContext, useState } from 'react';
const TypingContext = createContext<TypingContextValue | null>(null);

export function TypingProvider({ children }: { children: React.ReactNode }) {
  const [info, setInfo] = useState<TypingContext>({
    difficulty: 'normal' as 'normal' | 'hard',
    time: 15,
    language: 'en-US' as 'pt-BR' | 'en-US',
    data: [] as PerformanceEntry[],
    totalTyped: 0,
    currentErrors: 0,
    isRunning: false,
  });

  function updateInfo(newInfo: Partial<TypingContext>) {
    setInfo((prev) => ({ ...prev, ...newInfo }));
  }

  return (
    <TypingContext.Provider value={{ info, updateInfo }}>
      {children}
    </TypingContext.Provider>
  );
}

export function useTyping() {
  const context = useContext(TypingContext);
  if (!context) {
    throw new Error('useTyping must be used within a TypingProvider');
  }
  return context;
}
