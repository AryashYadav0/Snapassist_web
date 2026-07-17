import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { FileSpreadsheet, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { parseSheetData } from '../services/excelService';

const SheetPicker = () => {
  const navigate = useNavigate();
  const workbook = useAppStore((state) => state.workbook);
  const sheets = useAppStore((state) => state.sheets);
  const setSelectedSheet = useAppStore((state) => state.setSelectedSheet);
  const selectedSheetName = useAppStore((state) => state.selectedSheetName);
  const activeSheetData = useAppStore((state) => state.activeSheetData);
  
  const [viewMode, setViewMode] = useState('sheets'); // 'sheets' or 'data'

  if (!workbook) {
    return (
      <div className="p-6 text-center mt-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">No Workbook Loaded</h2>
        <p className="text-gray-500 mt-2 mb-6">Please upload an Excel file from the Home screen first.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const handleSelectSheet = (sheetName) => {
    const worksheet = workbook.getWorksheet(sheetName);
    const data = parseSheetData(worksheet);
    setSelectedSheet(sheetName, data);
    setViewMode('data');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-4 py-3 border-b border-gray-200 sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <h1 className="text-lg font-bold text-gray-800">
          {viewMode === 'sheets' ? 'Select a Sheet' : selectedSheetName}
        </h1>
        {viewMode === 'data' && (
          <button 
            onClick={() => setViewMode('sheets')}
            className="text-sm font-medium text-blue-600 px-3 py-1 bg-blue-50 rounded-md"
          >
            Change Sheet
          </button>
        )}
      </div>

      <div className="p-4 overflow-y-auto">
        {viewMode === 'sheets' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sheets.map((sheet) => (
              <button
                key={sheet.name}
                onClick={() => handleSelectSheet(sheet.name)}
                className={`bg-white p-4 rounded-xl shadow-sm border text-left flex items-center justify-between transition-all ${
                  selectedSheetName === sheet.name 
                    ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedSheetName === sheet.name ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    <LayoutGrid size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{sheet.name}</h3>
                    <p className="text-xs text-gray-500">{sheet.rowCount} rows</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            ))}
          </div>
        ) : (
          <div>
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 flex items-start gap-3">
              <div className="text-blue-600 mt-0.5"><List size={20} /></div>
              <div>
                <p className="text-sm text-blue-900 font-medium">Ready for scanning</p>
                <p className="text-xs text-blue-700 mt-1">
                  Found {activeSheetData.length} records in this sheet. You can now go to the Scan tab to start checking devices.
                </p>
              </div>
            </div>

            {/* Excel-like Table */}
            {activeSheetData.length > 0 && (() => {
              const columns = Object.keys(activeSheetData[0]).filter(k => k !== '_rowNumber');
              return (
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                  <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '60vh' }}>
                    <table className="min-w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-100 sticky top-0 z-10">
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-r border-gray-200 bg-gray-100 w-12 sticky left-0 z-20">
                            #
                          </th>
                          {columns.map((col) => (
                            <th
                              key={col}
                              className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-b border-r border-gray-200 bg-gray-100 whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeSheetData.map((row, idx) => (
                          <tr
                            key={idx}
                            className={`transition-colors hover:bg-blue-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}
                          >
                            <td className={`px-3 py-2 text-xs text-gray-400 font-mono border-r border-gray-100 sticky left-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}>
                              {row._rowNumber}
                            </td>
                            {columns.map((col) => (
                              <td
                                key={col}
                                className="px-4 py-2 text-gray-800 border-r border-gray-100 whitespace-nowrap max-w-[180px] truncate"
                                title={row[col] || ''}
                              >
                                {row[col] !== undefined && row[col] !== null && row[col] !== ''
                                  ? String(row[col])
                                  : <span className="text-gray-300">—</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 text-right">
                    {activeSheetData.length} rows · {columns.length} columns
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
      
      {viewMode === 'data' && (
        <div className="fixed bottom-16 w-full p-4 pointer-events-none">
          <div className="max-w-md mx-auto flex justify-end">
             <button 
                onClick={() => navigate('/scan')}
                className="pointer-events-auto bg-blue-600 text-white shadow-lg px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-blue-700 hover:scale-105 transition-all"
             >
                Start Scanning <ChevronRight size={18} />
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SheetPicker;
