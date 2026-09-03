import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';

export interface CreditAlertInfo {
  kind: 'blocked' | 'warning';
  title: string;
  message: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  utilizationPct: number;
  thresholdPct?: number;
  onCancel?: () => void;
  onProceed?: () => void; // only offered for 'warning' alerts
}

interface CreditAlertContextValue {
  currentAlert: CreditAlertInfo | null;
  showBlocked: (info: Omit<CreditAlertInfo, 'kind'>) => void;
  showWarning: (info: Omit<CreditAlertInfo, 'kind'>) => void;
  dismiss: () => void;
}

const CreditAlertContext = createContext<CreditAlertContextValue | null>(null);

export function CreditAlertProvider({ children }: { children: ReactNode }) {
  const [currentAlert, setCurrentAlert] = useState<CreditAlertInfo | null>(null);

  const dismiss = useCallback(() => setCurrentAlert(null), []);

  const showBlocked = useCallback((info: Omit<CreditAlertInfo, 'kind'>) => {
    setCurrentAlert({ ...info, kind: 'blocked' });
  }, []);

  const showWarning = useCallback((info: Omit<CreditAlertInfo, 'kind'>) => {
    setCurrentAlert({ ...info, kind: 'warning' });
  }, []);

  const value = useMemo(
    () => ({ currentAlert, showBlocked, showWarning, dismiss }),
    [currentAlert, showBlocked, showWarning, dismiss]
  );

  return <CreditAlertContext.Provider value={value}>{children}</CreditAlertContext.Provider>;
}

export function useCreditAlert(): CreditAlertContextValue {
  const ctx = useContext(CreditAlertContext);
  if (!ctx) throw new Error('useCreditAlert must be used within a CreditAlertProvider');
  return ctx;
}
