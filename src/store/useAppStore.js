import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // Excel State
  workbook: null,
  sheets: [],
  selectedSheetName: null,
  activeSheetData: [],
  originalFile: null,
  
  // History State
  scanHistory: [],

  // Actions
  setWorkbookData: (workbook, sheets, file) => set({ 
    workbook, 
    sheets, 
    originalFile: file 
  }),
  
  setSelectedSheet: (sheetName, data) => set({ 
    selectedSheetName: sheetName,
    activeSheetData: data
  }),

  addScanHistory: (scanResult) => set((state) => ({
    scanHistory: [{ ...scanResult, timestamp: new Date().toISOString() }, ...state.scanHistory]
  })),

  clearWorkbook: () => set({
    workbook: null,
    sheets: [],
    selectedSheetName: null,
    activeSheetData: [],
    originalFile: null
  })
}));
