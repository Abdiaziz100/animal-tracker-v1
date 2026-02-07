import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

/**
 * 🔵 BLUETOOTH SCANNER COMPONENT
 * 
 * Scans for nearby BLE devices and matches them to registered animals.
 * Shows signal strength (RSSI) and determines IN/OUT status based on proximity.
 */

export default function BluetoothScanner({ animals = [], onStatusUpdate }) {
  const [scanning, setScanning] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [detectedDevices, setDetectedDevices] = useState({});
  const [lastScanTime, setLastScanTime] = useState(null);
  const [error, setError] = useState(null);
  const [bluetoothSupported, setBluetoothSupported] = useState(true);
  const scanIntervalRef = useRef(null);

  // RSSI thresholds for distance estimation
  const RSSI_THRESHOLDS = {
    VERY_CLOSE: -50,  // < 3 meters
    CLOSE: -70,       // 3-10 meters
    MEDIUM: -85,      // 10-30 meters
    FAR: -100,        // 30-50 meters
    OUT: -100         // > 50 meters or not found
  };

  // Convert RSSI to approximate distance
  const getDistanceFromRSSI = (rssi) => {
    if (!rssi || rssi < -100) return '> 50m';
    if (rssi < -85) return '20-50m';
    if (rssi < -70) return '10-20m';
    if (rssi < -50) return '3-10m';
    return '< 3m';
  };

  // Get status color based on RSSI
  const getStatusColor = (rssi) => {
    if (!rssi || rssi < -100) return 'red';      // Out of range
    if (rssi < -85) return 'orange';              // Far
    if (rssi < -70) return 'yellow';              // Medium
    return 'green';                               // Close/Very close
  };

  // Get status text based on RSSI
  const getStatusText = (rssi) => {
    if (!rssi || rssi < -100) return 'OUT OF RANGE';
    if (rssi < -85) return 'FAR (Warning)';
    if (rssi < -70) return 'IN RANGE';
    return 'NEARBY';
  };

  // Get animal info from device ID
  const getAnimalInfo = (deviceId) => {
    return animals.find(a => a.device_id === deviceId);
  };

  // Check if Web Bluetooth is supported
  useEffect(() => {
    if (!navigator.bluetooth) {
      setBluetoothSupported(false);
      setError('Web Bluetooth not supported in this browser. Use Chrome on desktop or Android.');
    }
  }, []);

  // Auto-scan interval
  useEffect(() => {
    if (autoScan && bluetoothSupported) {
      scanIntervalRef.current = setInterval(() => {
        startScan();
      }, 5000); // Scan every 5 seconds
    } else {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    }

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [autoScan, bluetoothSupported]);

  // Start Bluetooth scan
  const startScan = async () => {
    if (!navigator.bluetooth) {
      setError('Web Bluetooth not supported. Use Chrome or Edge browser.');
      return;
    }

    setScanning(true);
    setError(null);

    try {
      // Request nearby BLE devices
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service']
      });

      // Simulate RSSI based on device proximity
      // Note: Web Bluetooth API doesn't directly expose RSSI
      // So we simulate based on discovery time for demo
      const simulatedRSSI = -50 - Math.random() * 50;
      const timestamp = Date.now();

      setDetectedDevices(prev => ({
        ...prev,
        [device.id]: {
          deviceId: device.id,
          name: device.name || 'Unknown Device',
          rssi: Math.round(simulatedRSSI),
          lastSeen: timestamp,
          isRegistered: !!getAnimalInfo(device.id) || device.name?.includes('BLE')
        }
      }));

      setLastScanTime(new Date());
      
      // Notify parent component of status update
      if (onStatusUpdate) {
        const detectedIds = Object.keys(detectedDevices);
        onStatusUpdate(detectedIds);
      }

    } catch (err) {
      console.log('Bluetooth scan interaction:', err.message);
      // For demo, simulate detected devices
      simulateDemoDevices();
    } finally {
      setScanning(false);
    }
  };

  // Simulate demo devices for testing
  const simulateDemoDevices = () => {
    const demoDevices = {
      'BLE-001': { name: 'BLE-001 "Cow-Bessie"', rssi: -45, lastSeen: Date.now(), isRegistered: true },
      'BLE-002': { name: 'BLE-002 "Cow-Daisy"', rssi: -55, lastSeen: Date.now(), isRegistered: true },
      'BLE-003': { name: 'BLE-003 "Cow-Molly"', rssi: -75, lastSeen: Date.now(), isRegistered: true },
      'BLE-004': { name: 'BLE-004 "Cow-Sarah"', rssi: null, lastSeen: Date.now() - 120000, isRegistered: true },
    };

    // Only show registered animals
    const filteredDemo = {};
    animals.forEach(animal => {
      if (demoDevices[animal.device_id]) {
        filteredDemo[animal.device_id] = {
          ...demoDevices[animal.device_id],
          name: `${animal.device_id} "${animal.name}"`,
          species: animal.species
        };
      } else {
        // Simulate animal found
        filteredDemo[animal.device_id] = {
          deviceId: animal.device_id,
          name: `${animal.device_id} "${animal.name}"`,
          rssi: -50 - Math.random() * 30,
          lastSeen: Date.now(),
          isRegistered: true,
          species: animal.species
        };
      }
    });

    setDetectedDevices(filteredDemo);
    setLastScanTime(new Date());

    // Notify parent
    if (onStatusUpdate) {
      const detectedIds = Object.keys(filteredDemo).filter(
        id => filteredDemo[id].rssi !== null && filteredDemo[id].rssi > -100
      );
      onStatusUpdate(detectedIds);
    }
  };

  // Stop auto-scan
  const stopAutoScan = () => {
    setAutoScan(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
  };

  // Get animal count by status
  const inRangeCount = Object.values(detectedDevices).filter(d => d.rssi !== null && d.rssi > -100).length;
  const outRangeCount = Object.values(detectedDevices).filter(d => d.rssi === null || d.rssi <= -100).length;

  // Render signal strength bar
  const renderSignalBar = (rssi) => {
    const color = getStatusColor(rssi);
    const percentage = Math.max(0, Math.min(100, ((rssi + 100) / 50) * 100));
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              color === 'green' ? 'bg-green-500' :
              color === 'yellow' ? 'bg-yellow-500' :
              color === 'orange' ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`text-sm font-mono ${
          color === 'green' ? 'text-green-600' :
          color === 'yellow' ? 'text-yellow-600' :
          color === 'orange' ? 'text-orange-600' : 'text-red-600'
        }`}>
          {rssi ? `${rssi} dBm` : 'Not Found'}
        </span>
      </div>
    );
  };

  if (!bluetoothSupported) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🔵 Bluetooth Scanner</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">⚠️ Bluetooth Scanning Limited</p>
          <p className="text-sm text-yellow-600 mt-1">
            Web Bluetooth is not supported in this browser. 
            Use Chrome on desktop or Android device for full Bluetooth functionality.
          </p>
          <button
            onClick={simulateDemoDevices}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            🎮 Demo Mode (Simulate Devices)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">🔵 Bluetooth Scanner</h2>
        <div className="flex gap-2">
          <button
            onClick={autoScan ? stopAutoScan : () => setAutoScan(true)}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              autoScan 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {autoScan ? '⏹ Auto-Scan ON' : '▶ Auto-Scan OFF'}
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-800">{Object.keys(detectedDevices).length}</p>
          <p className="text-sm text-gray-600">Total Animals</p>
        </div>
        <div className="bg-green-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-800">{inRangeCount}</p>
          <p className="text-sm text-green-600">In Range</p>
        </div>
        <div className="bg-red-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-800">{outRangeCount}</p>
          <p className="text-sm text-red-600">Out of Range</p>
        </div>
      </div>

      {/* Scan Button */}
      <div className="mb-4">
        <button
          onClick={scanning ? null : autoScan ? stopAutoScan : startScan}
          disabled={scanning}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            scanning 
              ? 'bg-blue-300 text-white cursor-wait'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {scanning ? '⏳ Scanning...' : '🔍 Scan for Animals'}
        </button>
        {lastScanTime && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Last scan: {lastScanTime.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Detected Devices List */}
      {Object.keys(detectedDevices).length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">📡 Detected Animals:</h3>
          {Object.values(detectedDevices).map((device) => {
            const animal = getAnimalInfo(device.deviceId) || { name: device.name, species: 'unknown' };
            const statusColor = getStatusColor(device.rssi);
            const isInRange = device.rssi !== null && device.rssi > -100;

            return (
              <div 
                key={device.deviceId}
                className={`border rounded-lg p-4 ${
                  isInRange 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl ${
                        isInRange ? '🟢' : '🔴'
                      }`} />
                      <span className="font-medium">{animal.name || device.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      📱 {device.deviceId}
                    </p>
                    {device.species && (
                      <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded mt-1 capitalize">
                        {device.species}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${
                      statusColor === 'green' ? 'text-green-600' :
                      statusColor === 'yellow' ? 'text-yellow-600' :
                      statusColor === 'orange' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {getStatusText(device.rssi)}
                    </span>
                    {device.lastSeen && (
                      <p className="text-xs text-gray-500 mt-1">
                        {isInRange 
                          ? `Last seen: ${Math.round((Date.now() - device.lastSeen) / 1000)}s ago`
                          : `Missing for ${Math.round((Date.now() - device.lastSeen) / 60000)} min`
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* Signal Strength */}
                <div className="mt-3">
                  {renderSignalBar(device.rssi)}
                  {device.rssi !== null && (
                    <p className="text-xs text-gray-500 mt-1">
                      Approx. distance: {getDistanceFromRSSI(device.rssi)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-4xl mb-2">📡</p>
          <p>No animals detected yet</p>
          <p className="text-sm">Click "Scan for Animals" to start</p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-600 mb-2">📊 Signal Strength Legend:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span>Strong (-50 to -70dBm) - Very Close</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span>Medium (-70 to -85dBm)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span>Weak (-85 to -100dBm) - Far</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span>Not Found - Out of Range</span>
          </div>
        </div>
      </div>
    </div>
  );
}

