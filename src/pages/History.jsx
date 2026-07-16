import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { History as HistoryIcon, Clock, CheckCircle } from 'lucide-react';

const History = () => {
  const scanHistory = useAppStore(state => state.scanHistory);

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
          <HistoryIcon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scan History</h1>
          <p className="text-gray-500 text-sm">{scanHistory.length} items scanned</p>
        </div>
      </div>

      {scanHistory.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900">No history yet</h3>
          <p className="text-sm text-gray-500 mt-1">Your saved scans will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scanHistory.map((entry, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                   <CheckCircle className="w-4 h-4 text-green-500" />
                   <span className="font-medium">Row {entry.rowNumber}</span>
                   <span className="text-gray-300">•</span>
                   <span>{entry.sheet}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(entry.device)
                  .filter(([key]) => key !== '_rowNumber')
                  .slice(0, 4)
                  .map(([key, val]) => (
                    <div key={key}>
                      <span className="text-gray-400 text-xs block truncate">{key}</span>
                      <span className="font-medium text-gray-800 block truncate">{val || '-'}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
