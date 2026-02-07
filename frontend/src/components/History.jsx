import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/tracking/history/all?limit=100');
      setHistory(response.data.history);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'exited':
        return '⚠️';
      case 'entered':
        return '✅';
      case 'added':
        return '➕';
      case 'status_change':
        return '🔄';
      default:
        return '📍';
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'exited':
        return 'bg-red-50 border-red-200';
      case 'entered':
        return 'bg-green-50 border-green-200';
      case 'added':
        return 'bg-blue-50 border-blue-200';
      case 'status_change':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(h => h.event_type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Activity History</h1>
        <Link
          to="/"
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2">
          {['all', 'exited', 'entered', 'added', 'status_change'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                filter === f
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All Events' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-lg shadow-md">
        {filteredHistory.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredHistory.map((event) => (
              <div
                key={event.id}
                className={`p-4 border-l-4 ${getEventColor(event.event_type)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{getEventIcon(event.event_type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">
                        {event.animal_name}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        event.event_type === 'exited'
                          ? 'bg-red-100 text-red-800'
                          : event.event_type === 'entered'
                          ? 'bg-green-100 text-green-800'
                          : event.event_type === 'added'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.event_type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {event.latitude && event.longitude && (
                        <span>
                          📍 {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                        </span>
                      )}
                      <span>
                        🕐 {format(new Date(event.timestamp), 'PPpp')}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/animals/${event.animal_id}`}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    View Animal →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No history events found</p>
            <p className="text-sm mt-2">
              {filter === 'all' 
                ? 'Add some animals and track their movements to see activity here.'
                : `No ${filter.replace('_', ' ')} events found.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-blue-600">
            {history.filter(h => h.event_type === 'added').length}
          </div>
          <div className="text-gray-600 text-sm">Animals Added</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-red-600">
            {history.filter(h => h.event_type === 'exited').length}
          </div>
          <div className="text-gray-600 text-sm">Exits Detected</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-green-600">
            {history.filter(h => h.event_type === 'entered').length}
          </div>
          <div className="text-gray-600 text-sm">Returns Detected</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-gray-600">
            {history.length}
          </div>
          <div className="text-gray-600 text-sm">Total Events</div>
        </div>
      </div>
    </div>
  );
}

export default History;

