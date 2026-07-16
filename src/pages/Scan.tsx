import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Check, X, Search, Upload } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Html5Qrcode } from 'html5-qrcode';
import Tesseract from 'tesseract.js';

export default function Scan() {
  const navigate = useNavigate();
  const { workbook, activeSheetName } = useAppContext();
  const [rows, setRows] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('Ready');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [matchedData, setMatchedData] = useState({ model: '', serial: '', rowIndex: -1 });

  useEffect(() => {
    if (!workbook || !activeSheetName) {
      navigate('/');
      return;
    }

    const worksheet = workbook.getWorksheet(activeSheetName);
    if (worksheet) {
      const extractedRows: any[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header
          extractedRows.push({
            id: rowNumber,
            data: row.values
          });
        }
      });
      setRows(extractedRows.slice(0, 50));
    }
  }, [workbook, activeSheetName, navigate]);

  const processImage = async (file: File) => {
    setIsScanning(true);
    setScanStatus('Scanning barcode...');
    let foundSerial = '';
    let foundModel = '';

    try {
      // 1. Try Barcode Scanning for Serial Number
      const html5QrCode = new Html5Qrcode("hidden-qr-reader");
      try {
        const barcodeText = await html5QrCode.scanFile(file, true);
        foundSerial = barcodeText;
      } catch (err) {
        console.log('No barcode found', err);
      }

      setScanStatus('Extracting text (OCR)...');
      // 2. Try OCR for Model Number (and fallback serial)
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      console.log('OCR Text:', text);
      
      // Basic heuristic to find model and serial in OCR text
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.toUpperCase().includes('MODEL') || line.toUpperCase().includes('MX')) {
          foundModel = line.replace(/model:?/i, '').trim();
        }
        if (!foundSerial && (line.toUpperCase().includes('SN') || line.toUpperCase().includes('SERIAL'))) {
          foundSerial = line.replace(/(s\/n|sn|serial no):?/i, '').trim();
        }
      }

      if (!foundModel) foundModel = 'Unknown Model';
      if (!foundSerial) foundSerial = 'Unknown Serial';

      setMatchedData({
        model: foundModel,
        serial: foundSerial,
        rowIndex: 2 // Dummy row match for now
      });
      setShowConfirm(true);
      setScanStatus('Match found!');
    } catch (error) {
      console.error(error);
      setScanStatus('Failed to scan image.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  if (!workbook) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <button className="btn-secondary" onClick={() => navigate('/sheets')} style={{ padding: '8px' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.2rem' }}>Scanning: {activeSheetName}</h2>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, overflow: 'hidden' }}>
        
        {/* Viewfinder Area */}
        <div className="glass-panel" style={{ flex: 2, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', padding: 0 }}>
          <div style={{ 
            backgroundColor: '#000', 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Viewfinder overlay */}
            <div style={{
              position: 'absolute',
              width: '250px',
              height: '250px',
              border: '2px solid var(--primary)',
              borderRadius: '24px',
              boxShadow: '0 0 0 4000px rgba(0,0,0,0.5)'
            }}></div>
            <div id="hidden-qr-reader" style={{ display: 'none' }}></div>
            
            <div style={{ position: 'absolute', bottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>{scanStatus}</p>
              <button 
                className="btn-primary" 
                style={{ borderRadius: '50px', padding: '12px 24px' }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
              >
                <Upload size={20} />
                Upload Image to Scan
              </button>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleImageUpload} 
              />
            </div>
          </div>

          {/* Confirmation Bottom Sheet */}
          {showConfirm && (
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              background: 'var(--bg-card)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid var(--border)',
              padding: '2rem',
              animation: 'fadeIn 0.3s ease'
            }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Asset Matched!</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Model</label>
                  <input type="text" value={matchedData.model} onChange={(e) => setMatchedData({...matchedData, model: e.target.value})} className="form-input" style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'white', borderRadius: '4px', marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Serial Number</label>
                  <input type="text" value={matchedData.serial} onChange={(e) => setMatchedData({...matchedData, serial: e.target.value})} className="form-input" style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'white', borderRadius: '4px', marginTop: '4px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-primary" style={{ flex: 1, background: 'var(--success)' }} onClick={() => setShowConfirm(false)}>
                  <Check size={20} /> Save
                </button>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>
                  <X size={20} /> Discard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Assist Panel */}
        <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <Search size={20} color="var(--text-muted)" />
            <input type="text" placeholder="Search rows..." style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rows.map((row, idx) => (
              <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Row {row.id}</span>
                  <span style={{ color: 'var(--primary)' }}>Pending</span>
                </div>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {Array.isArray(row.data) ? row.data.filter(Boolean).join(' | ') : 'Empty'}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
