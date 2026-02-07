import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const insideIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const outsideIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Default center - Nairobi, Kenya
const DEFAULT_CENTER = [-1.2921, 36.8219];
const FARM_RADIUS = 500; // meters

export default function MapView({ animals = [] }) {
  const [geofence, setGeofence] = useState({ lat: -1.2921, lng: 36.8219, radius: 0.5 });

  useEffect(() => {
    fetchGeofence();
  }, []);

  const fetchGeofence = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/geofence');
      const data = await response.json();
      setGeofence(data);
    } catch (error) {
      console.error('Error fetching geofence:', error);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden" style={{ height: '400px' }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Farm boundary circle */}
        <Circle
          center={[geofence.lat, geofence.lng]}
          radius={geofence.radius * 1000}
          pathOptions={{
            color: 'green',
            fillColor: 'green',
            fillOpacity: 0.2
          }}
        />
        
        {/* Farm center marker */}
        <Marker position={[geofence.lat, geofence.lng]}>
          <Popup>Farm Center</Popup>
        </Marker>
        
        {/* Animal markers */}
        {animals.map((animal) => {
          if (!animal.lat || !animal.lng) return null;
          
          const isInside = animal.status === 'IN';
          
          return (
            <Marker
              key={animal.id}
              position={[animal.lat, animal.lng]}
              icon={isInside ? insideIcon : outsideIcon}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold text-lg">{animal.name}</h3>
                  <p className="text-sm">{animal.species}</p>
                  <p className="text-sm font-mono mt-1">{animal.device_id}</p>
                  <p className={`text-sm font-bold mt-2 ${isInside ? 'text-green-600' : 'text-red-600'}`}>
                    {isInside ? '✅ Inside Farm' : '🚨 Outside Farm!'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {animal.lat?.toFixed(4)}, {animal.lng?.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Legend */}
      <div className="mt-3 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <img 
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" 
            alt="Inside" 
            className="w-6 h-6" 
          />
          <span>Inside Farm</span>
        </div>
        <div className="flex items-center gap-2">
          <img 
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" 
            alt="Outside" 
            className="w-6 h-6" 
          />
          <span>Outside Farm (Alert!)</span>
        </div>
      </div>
    </div>
  );
}

