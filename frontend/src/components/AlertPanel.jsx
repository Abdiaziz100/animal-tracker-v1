import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AlertPanel({ alerts = [], onRefresh }) {
  const [expanded, setExpanded] = useState(true);
  const [lastAlertCount, setLastAlertCount] = useState(0);

  useEffect(() => {
    if (alerts.length > 0 && alerts.length > lastAlertCount) {
      playAlertSound();
    }
    setLastAlertCount(alerts.length);
  }, [alerts.length]);

  const playAlertSound = () => {
    try {
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const markAsRead = async (alertId) => {
    try {
      await api.post(`/alerts/${alertId}/read`);
      onRefresh();
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const getAlertColor = (alertType) => {
    switch (alertType) {
      case 'EXIT': return 'border-red-500 bg-red-50';
      case 'LOW_BATTERY': return 'border-yellow-500 bg-yellow-50';
      case 'LOW_SIGNAL': return 'border-orange-500 bg-orange-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'EXIT': return '🚨';
      case 'LOW_BATTERY': return '🔋';
      case 'LOW_SIGNAL': return '📡';
      default: return '⚠️';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div 
        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <h3 className="font-semibold">Active Alerts</h3>
          {alerts.length > 0 && (
            <span className="bg-red-800 text-white text-xs px-2 py-1 rounded-full">
              {alerts.length}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
          className="bg-white text-red-600 px-3 py-1 rounded text-sm hover:bg-red-50"
        >
          Refresh
        </button>
      </div>

      {expanded && (
        <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="p-6 text-center">
              <span className="text-4xl block mb-2">✅</span>
              <p className="text-green-600 font-medium">All animals are safe!</p>
              <p className="text-gray-500 text-sm">No active alerts</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`p-4 border-l-4 ${getAlertColor(alert.alert_type)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getAlertIcon(alert.alert_type)}</span>
                    <div>
                      <p className="font-medium text-gray-800">{alert.animal_name}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => markAsRead(alert.id)}
                    className="text-gray-400 hover:text-gray-600 text-lg"
                    title="Mark as read"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {expanded && alerts.length > 0 && (
        <div className="p-4 bg-gray-50 border-t">
          <p className="text-sm text-gray-600 mb-2">Quick Actions:</p>
          <button
            onClick={onRefresh}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            View on Map
          </button>
        </div>
      )}
    </div>
  );
}

