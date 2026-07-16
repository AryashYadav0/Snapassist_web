import { Routes, Route, Link } from 'react-router-dom';
import { Camera } from 'lucide-react';
import Home from './pages/Home';
import SheetPicker from './pages/SheetPicker';
import Scan from './pages/Scan';
import History from './pages/History';

function App() {
  return (
    <div className="layout-container">
      <header className="header">
        <Link to="/" className="logo-container">
          <Camera className="logo-icon" size={32} />
          <span className="logo-text">SnapAsset AI</span>
        </Link>
        <nav style={{ display: 'flex', gap: '16px' }}>
          <Link to="/history" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            History
          </Link>
        </nav>
      </header>

      <main className="main-content animate-fade-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sheets" element={<SheetPicker />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
