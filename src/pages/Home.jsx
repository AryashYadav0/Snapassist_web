import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { readWorkbook } from '../services/excelService';
import { useAppStore } from '../store/useAppStore';

const Home = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const setWorkbookData = useAppStore((state) => state.setWorkbookData);
  const originalFile = useAppStore((state) => state.originalFile);
  const sheets = useAppStore((state) => state.sheets);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      setError("Please upload a valid .xlsx file");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { workbook, sheets, originalFile } = await readWorkbook(file);
      setWorkbookData(workbook, sheets, originalFile);
      navigate('/sheets');
    } catch (err) {
      console.error(err);
      setError("Failed to parse the workbook. Please ensure it's a valid Excel file.");
    } finally {
      setLoading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="text-center mb-8 pt-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SnapAssist AI</h1>
        <p className="text-gray-500">Automate your inventory scanning</p>
      </div>

      {originalFile ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 truncate max-w-[200px]">{originalFile.name}</h2>
              <p className="text-sm text-gray-500">{sheets.length} sheets loaded</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/sheets')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Continue with this file
          </button>
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Upload Inventory File</h2>
          <p className="text-sm text-gray-500 mt-1">Select an .xlsx workbook to begin</p>
        </div>
        
        <div className="p-6">
          <input 
            type="file" 
            accept=".xlsx" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 hover:border-blue-400 transition-all group cursor-pointer"
          >
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
              <Upload size={28} />
            </div>
            <div className="text-center">
              <span className="font-medium text-gray-900 block">Tap to upload file</span>
              <span className="text-xs text-gray-500 mt-1 block">Supports .xlsx format</span>
            </div>
          </button>
          
          {loading && (
            <p className="text-sm text-blue-600 text-center mt-4 animate-pulse">Loading workbook...</p>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
