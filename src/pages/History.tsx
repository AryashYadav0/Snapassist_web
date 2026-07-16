import { ArrowLeft, Clock, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const navigate = useNavigate();

  // Dummy history data
  const historyData = [
    { id: 1, file: 'IT_Asset_PAV_Rajeev.xlsx', sheet: 'S181', action: 'Matched Router MX64-HW', time: '10:42 AM' },
    { id: 2, file: 'IT_Asset_PAV_Rajeev.xlsx', sheet: 'S181', action: 'Matched Switch MS120', time: '10:45 AM' },
    { id: 3, file: 'IT_Asset_PAV_Rajeev.xlsx', sheet: 'S181', action: 'Saved workbook locally', time: '11:00 AM' },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn-secondary" onClick={() => navigate(-1)} style={{ padding: '8px' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '1.5rem' }}>Audit History</h2>
      </div>

      <div className="glass-panel">
        {historyData.map((item, idx) => (
          <div key={item.id} style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '1rem', 
            padding: '1.5rem 0',
            borderBottom: idx === historyData.length - 1 ? 'none' : '1px solid var(--border)'
          }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '50%' }}>
              <FileSpreadsheet style={{ color: 'var(--primary)' }} size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{item.action}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
                File: {item.file} &bull; Sheet: {item.sheet}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <Clock size={14} />
              {item.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
