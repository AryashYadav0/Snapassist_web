import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // Excel State
  workbook: null,
  sheets: [],
  selectedSheetName: null,
  activeSheetData: [],
  originalFile: null,
  hasUnsavedScans: false, // true when scans are saved in-app but not yet downloaded

  // History State
  scanHistory: [],

  // Actions
  setWorkbookData: (workbook, sheets, file) => set({
    workbook,
    sheets,
    originalFile: file,
    hasUnsavedScans: false,
  }),

  setSelectedSheet: (sheetName, data) => set({
    selectedSheetName: sheetName,
    activeSheetData: data
  }),

  // Save updated workbook in app (no download) after each scan
  saveUpdatedWorkbook: (updatedWorkbook) => set({
    workbook: updatedWorkbook,
    hasUnsavedScans: true,
  }),

  addScanHistory: (scanResult) => set((state) => ({
    scanHistory: [{ ...scanResult, timestamp: new Date().toISOString() }, ...state.scanHistory]
  })),

  clearWorkbook: () => set({
    workbook: null,
    sheets: [],
    selectedSheetName: null,
    activeSheetData: [],
    originalFile: null,
    hasUnsavedScans: false,
  })
}));
