import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Home() {
  const navigate = useNavigate();
  const { setWorkbook, setFileName } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      
      const buffer = await file.arrayBuffer();
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);
      
      setWorkbook(wb);
      setFileName(file.name);
      
      navigate('/sheets');
    } catch (err: any) {
      setError(err.message || 'Failed to load workbook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: '600px', margin: '4rem auto' }}>
      <FileSpreadsheet size={64} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
      <h1 style={{ marginBottom: '1rem' }}>Open Workbook</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Select your IT Asset Excel file to begin scanning and auditing your inventory.
      </p>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="file-input-wrapper">
        <button className="btn-primary" style={{ width: '100%', padding: '16px 32px' }}>
          <Upload size={20} />
          {loading ? 'Loading...' : 'Select .xlsx File'}
        </button>
        <input 
          type="file" 
          accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
          onChange={handleFileUpload}
          disabled={loading}
        />
      </div>
      
      <div style={{ marginTop: '3rem', textAlign: 'left' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Recent Files</h3>
        <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
          {/* Placeholder for recent files */}
          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>IT_Asset_PAV_Rajeev.xlsx</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
