import { createContext, useContext, useState, type ReactNode } from "react";

export const CurrDateContext = createContext<{
  currDate: Date;
  setCurrDate: (date: Date) => void;
} | null>(null);

export const useCurrDate = () => {
  const context = useContext(CurrDateContext);
  if (!context)
    throw new Error("useCurrDate must be used within CurrDateProvider");
  return context;
};

export function CurrDateProvider({ children }: { children: ReactNode }) {
  const [currDate, setCurrDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });

  return (
    <CurrDateContext.Provider value={{ currDate, setCurrDate }}>
      {children}
    </CurrDateContext.Provider>
  );
}
