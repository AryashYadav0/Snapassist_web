import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function SheetPicker() {
  const navigate = useNavigate();
  const { workbook, fileName, setActiveSheetName } = useAppContext();
  const [sheets, setSheets] = useState<string[]>([]);

  useEffect(() => {
    if (!workbook) {
      navigate('/');
      return;
    }
    
    const sheetNames: string[] = [];
    workbook.eachSheet((worksheet) => {
      sheetNames.push(worksheet.name);
    });
    setSheets(sheetNames);
  }, [workbook, navigate]);

  const handleSelectSheet = (sheetName: string) => {
    setActiveSheetName(sheetName);
    navigate('/scan');
  };

  if (!workbook) return null;

  return (
    <div style={{ padding: '0 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn-secondary" onClick={() => navigate('/')} style={{ padding: '8px' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Select a Sheet</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>File: {fileName}</p>
        </div>
      </div>

      <div className="card-grid">
        {sheets.map((sheet, index) => (
          <div 
            key={index} 
            className="glass-panel" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => handleSelectSheet(sheet)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <FileSpreadsheet style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>{sheet}</span>
            </div>
            <ChevronRight style={{ color: 'var(--text-muted)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
