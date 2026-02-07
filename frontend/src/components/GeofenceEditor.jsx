import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function LocationMarker({ position, onSetCenter }) {
  const map = useMapEvents({
    click(e) {
      onSetCenter([e.latlng.lat, e.latlng.lng]);
    },
  });

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
}

function GeofenceEditor() {
  const [center, setCenter] = useState([40.7128, -74.0060]);
  const [geofenceZone, setGeofenceZone] = useState([]);
  const [newPoint, setNewPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchGeofence();
  }, []);

  const fetchGeofence = async () => {
    try {
      const res = await api.get('/tracking/geofence');
      if (res.data.geofence_zone) {
        setGeofenceZone(res.data.geofence_zone);
      }
    } catch (error) {
      console.error('Error fetching geofence:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoint = (e) => {
    const { lat, lng } = e.latlng;
    const newZone = [...geofenceZone, [lat, lng]];
    setGeofenceZone(newZone);
    setNewPoint(null);
  };

  const handleRemoveLastPoint = () => {
    if (geofenceZone.length > 0) {
      setGeofenceZone(geofenceZone.slice(0, -1));
    }
  };

  const handleClearAll = () => {
    setGeofenceZone([]);
  };

  const handleSave = async () => {
    if (geofenceZone.length < 3) {
      setMessage({ type: 'error', text: 'Geofence must have at least 3 points' });
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/tracking/geofence', { zone: geofenceZone });
      setMessage({ type: 'success', text: res.data.message });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save geofence' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setGeofenceZone([
      [40.7128, -74.0060],
      [40.7138, -74.0060],
      [40.7138, -74.0050],
      [40.7128, -74.0050],
    ]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Farm Geofence Editor</h1>
        <a href="/" className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
          Back to Dashboard
        </a>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Instructions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Click on the map to add fence points</li>
              <li>Add at least 3 points to create a closed area</li>
              <li>Points form your farm's safe zone boundary</li>
              <li>Animals inside this zone are marked "IN"</li>
              <li>Animals outside are marked "OUT"</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Current Fence</h3>
            <p className="text-sm text-gray-600 mb-2">{geofenceZone.length} points</p>
            <button
              onClick={handleRemoveLastPoint}
              disabled={geofenceZone.length === 0}
              className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 mb-2"
            >
              Remove Last Point
            </button>
            <button
              onClick={handleClearAll}
              disabled={geofenceZone.length === 0}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 mb-2"
            >
              Clear All Points
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Reset to Default
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={handleSave}
              disabled={saving || geofenceZone.length < 3}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-lg font-semibold"
            >
              {saving ? 'Saving...' : 'Save Geofence'}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Saving will check all animals against new boundary
            </p>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-4">
          <MapContainer
            center={center}
            zoom={14}
            style={{ height: '600px', width: '100%' }}
            onClick={handleAddPoint}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Geofence Polygon */}
            {geofenceZone.length > 0 && (
              <Polygon
                positions={geofenceZone}
                pathOptions={{
                  color: 'green',
                  fillColor: 'green',
                  fillOpacity: 0.3
                }}
              />
            )}
            
            {/* Points markers */}
            {geofenceZone.map((point, index) => (
              <Marker
                key={index}
                position={point}
              />
            ))}
          </MapContainer>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Coordinates:</h4>
            <div className="max-h-40 overflow-y-auto bg-gray-100 rounded-lg p-2">
              {geofenceZone.map((point, index) => (
                <div key={index} className="text-xs font-mono py-1">
                  Point {index + 1}: {point[0].toFixed(6)}, {point[1].toFixed(6)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeofenceEditor;

