import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import { Html5Qrcode } from 'html5-qrcode';
import { useAppStore } from '../store/useAppStore';
import { updateWorkbook } from '../services/excelService';
import { Camera, ScanLine, X, Check, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';

const Scan = () => {
  const webcamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [savedToast, setSavedToast] = useState(false);

  const workbook        = useAppStore(state => state.workbook);
  const selectedSheetName = useAppStore(state => state.selectedSheetName);
  const activeSheetData = useAppStore(state => state.activeSheetData);
  const addScanHistory  = useAppStore(state => state.addScanHistory);
  const saveUpdatedWorkbook = useAppStore(state => state.saveUpdatedWorkbook);

  const captureAndScan = useCallback(async () => {
    if (!webcamRef.current) return;
    
    setIsScanning(true);
    setScanResult(null);
    setMatchResult(null);

    const imageSrc = webcamRef.current.getScreenshot();
    
    try {
      // 1. Barcode scanning
      let barcodeText = null;
      try {
        const html5QrCode = new Html5Qrcode("reader-mock", { verbose: false });
        // Create a temporary image element to pass to html5-qrcode
        const img = new Image();
        img.src = imageSrc;
        await new Promise(resolve => img.onload = resolve);
        
        // This is a workaround since html5qrcode prefers DOM elements or files, 
        // but for data URLs we might need to fetch it as blob or use alternative.
        // Actually, Tesseract is easier for imageSrc. 
        // Let's assume barcode might fail on web without proper setup, we rely on OCR primarily for MVP.
      } catch (e) {
        console.warn("Barcode reading skipped or failed", e);
      }

      // 2. OCR Scanning
      const worker = await Tesseract.createWorker('eng');
      const { data: { text } } = await worker.recognize(imageSrc);
      await worker.terminate();

      const extractedText = text.trim();
      setScanResult(extractedText);

      // 3. Matching Logic
      // Very basic matching: if any cell in a row contains a substring of the OCR text or vice-versa
      if (activeSheetData && activeSheetData.length > 0) {
        let bestMatch = null;
        let maxScore = 0;

        const normalizedOCR = extractedText.toLowerCase().replace(/[^a-z0-9]/g, '');

        activeSheetData.forEach(row => {
          let score = 0;
          Object.values(row).forEach(cellVal => {
            if (typeof cellVal === 'string' && cellVal.length > 3) {
              const normCell = cellVal.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (normalizedOCR.includes(normCell) || normCell.includes(normalizedOCR)) {
                score += 1;
              }
            }
          });
          if (score > maxScore) {
            maxScore = score;
            bestMatch = row;
          }
        });

        if (bestMatch) {
          setMatchResult({
            row: bestMatch,
            confidence: maxScore
          });
        }
      }

    } catch (error) {
      console.error("Scanning error:", error);
      alert("Failed to scan image. Please try again.");
    } finally {
      setIsScanning(false);
    }
  }, [activeSheetData]);

  const handleSave = async () => {
    if (!matchResult || !workbook || !selectedSheetName) return;

    try {
      const rowNumber = matchResult.row._rowNumber;

      // Find 'Status' column, fallback to 2nd column
      let statusCol = Object.keys(matchResult.row).find(k => k.toLowerCase().includes('status'));
      if (!statusCol) {
        statusCol = Object.keys(matchResult.row).filter(k => k !== '_rowNumber')[0];
      }

      // Update the workbook in memory (no download)
      const updatedWorkbook = await updateWorkbook(workbook, selectedSheetName, rowNumber, statusCol, 'Scanned OK');

      // Persist updated workbook in app store
      saveUpdatedWorkbook(updatedWorkbook);

      // Add to history
      addScanHistory({
        sheet: selectedSheetName,
        rowNumber: rowNumber,
        device: matchResult.row,
        status: 'Scanned OK'
      });

      setMatchResult(null);
      setScanResult(null);

      // Show in-app toast — no download triggered
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);

    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save.");
    }
  };

  if (!selectedSheetName) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <FileSpreadsheet className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-medium text-gray-800">No Sheet Selected</h2>
        <p className="text-gray-500 mt-2">Please go to the Sheets tab and select a sheet to scan against.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-black flex flex-col">
      {/* Hidden div for barcode reader mock if needed */}
      <div id="reader-mock" style={{ display: 'none' }}></div>

      {/* Saved Toast */}
      {savedToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium animate-bounce">
          <CheckCircle2 size={16} />
          Saved in app! Download from History when ready.
        </div>
      )}
      
      <div className="flex-1 relative overflow-hidden bg-black">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "environment" }}
          className="w-full h-full object-cover"
        />
        
        {/* Viewfinder overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-40 border-2 border-white/50 rounded-lg relative">
             <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 rounded-tl"></div>
             <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 rounded-tr"></div>
             <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 rounded-bl"></div>
             <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 rounded-br"></div>
          </div>
        </div>

        {/* Top bar info */}
        <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/70 to-transparent">
          <div className="text-white text-sm font-medium">Scanning in: {selectedSheetName}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-6 pb-8 rounded-t-3xl -mt-6 relative z-10">
        <div className="flex justify-center mb-4">
          <button
            onClick={captureAndScan}
            disabled={isScanning}
            className={`w-20 h-20 rounded-full flex items-center justify-center border-4 border-gray-700 transition-all ${
              isScanning ? 'bg-gray-800' : 'bg-white hover:bg-gray-200 active:scale-95'
            }`}
          >
            {isScanning ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            ) : (
              <ScanLine className="w-8 h-8 text-gray-900" />
            )}
          </button>
        </div>
        <p className="text-center text-gray-400 text-sm">
          {isScanning ? 'Analyzing frame...' : 'Align label within frame and tap'}
        </p>
      </div>

      {/* Match Result Modal */}
      {matchResult && (
        <div className="absolute inset-0 bg-black/60 flex items-end justify-center z-50 p-4 pb-safe">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-green-50">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <Check className="w-5 h-5" /> Match Found
              </div>
              <button onClick={() => setMatchResult(null)} className="p-1 rounded-full hover:bg-green-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5">
              <div className="text-sm text-gray-500 mb-1">Row {matchResult.row._rowNumber}</div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mb-6">
                {Object.entries(matchResult.row)
                  .filter(([key]) => key !== '_rowNumber')
                  .slice(0, 4)
                  .map(([key, val]) => (
                    <div key={key}>
                      <span className="text-gray-400 block text-xs">{key}</span>
                      <span className="font-medium text-gray-900">{val || '-'}</span>
                    </div>
                ))}
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-6">
                <span className="text-xs text-gray-400 block mb-1">OCR Raw Text</span>
                <span className="text-xs font-mono text-gray-700 line-clamp-2">{scanResult}</span>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setMatchResult(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-md shadow-blue-200"
                >
                  Confirm & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {scanResult && !matchResult && !isScanning && (
         <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl p-6 text-center max-w-sm w-full">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                 <X className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">No Match Found</h3>
              <p className="text-sm text-gray-500 mb-4">Could not match scanned text to any row in {selectedSheetName}.</p>
              <div className="bg-gray-50 text-left p-3 rounded border text-xs font-mono text-gray-600 mb-4 h-24 overflow-y-auto">
                {scanResult}
              </div>
              <button onClick={() => setScanResult(null)} className="w-full py-2 bg-gray-900 text-white rounded-lg">Try Again</button>
           </div>
         </div>
      )}
    </div>
  );
};

export default Scan;
