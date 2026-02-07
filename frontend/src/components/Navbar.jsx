import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { trackingAPI } from '../services/api';

export default function Navbar({ user, onLogout }) {
  const [alertCount, setAlertCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlertCount = async () => {
    try {
      const res = await trackingAPI.getAlerts();
      setAlertCount(res.data.length);
    } catch (error) {
      // Ignore errors
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-green-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <span>🐄</span>
            <span>Animal Tracker</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-green-200 flex items-center gap-1">
              🏠 Dashboard
            </Link>
            
            <Link 
              to="/alerts" 
              className="hover:text-green-200 flex items-center gap-1 relative"
            >
              ⚠️ Alerts
              {alertCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {alertCount}
                </span>
              )}
            </Link>
            
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-green-600">
              <span className="text-sm">
                👤 {user?.name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

