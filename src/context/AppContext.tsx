import { createContext, useContext, useState, ReactNode } from 'react';
import ExcelJS from 'exceljs';

interface AppContextType {
  workbook: ExcelJS.Workbook | null;
  setWorkbook: (wb: ExcelJS.Workbook | null) => void;
  fileName: string;
  setFileName: (name: string) => void;
  activeSheetName: string;
  setActiveSheetName: (name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [workbook, setWorkbook] = useState<ExcelJS.Workbook | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [activeSheetName, setActiveSheetName] = useState<string>('');

  return (
    <AppContext.Provider value={{
      workbook, setWorkbook,
      fileName, setFileName,
      activeSheetName, setActiveSheetName
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
