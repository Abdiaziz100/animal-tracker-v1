import { useState } from 'react';

/**
 * 🔵 BLUETOOTH HARDWARE INTEGRATION
 * 
 * This component handles connection with GPS tracking devices via Bluetooth.
 * The hardware device should send JSON data in this format:
 * {
 *   "device_id": "BLE-12345",
 *   "lat": -1.293,
 *   "lng": 36.824,
 *   "battery": 85,
 *   "signal": 90
 * }
 * 
 * The data is sent to: POST /api/gps
 */

export default function BluetoothDevice() {
  const [connected, setConnected] = useState(false);
  const [device, setDevice] = useState(null);
  const [logs, setLogs] = useState([]);
  const [simulating, setSimulating] = useState(false);

  const addLog = (message) => {
    setLogs(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      message
    }]);
  };

  // Connect to Bluetooth device
  const connectBluetooth = async () => {
    try {
      addLog('🔍 Scanning for Bluetooth devices...');
      
      // Check if Web Bluetooth is supported
      if (!navigator.bluetooth) {
        addLog('❌ Web Bluetooth not supported in this browser');
        addLog('💡 Use Chrome on desktop or Android for Bluetooth');
        return;
      }

      const bluetoothDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      });

      setDevice(bluetoothDevice);
      addLog(`✅ Connected to: ${bluetoothDevice.name || 'Unknown Device'}`);
      addLog(`📱 Device ID: ${bluetoothDevice.id}`);
      
      bluetoothDevice.addEventListener('gattserverdisconnected', () => {
        setConnected(false);
        addLog('❌ Device disconnected');
      });

      setConnected(true);
    } catch (error) {
      addLog(`❌ Connection failed: ${error.message}`);
    }
  };

  // Simulate hardware data (for testing without actual device)
  const simulateHardware = () => {
    setSimulating(true);
    addLog('🎮 Hardware simulation started');
    addLog('📡 Sending GPS data every 2 seconds...');
    
    const interval = setInterval(() => {
      // Simulate random movement
      const lat = -1.2921 + (Math.random() - 0.5) * 0.002;
      const lng = 36.8219 + (Math.random() - 0.5) * 0.002;
      const battery = Math.floor(50 + Math.random() * 50);
      const signal = Math.floor(70 + Math.random() * 30);
      
      const deviceId = 'BLE-SIMULATOR';
      
      // Send to backend
      fetch('http://localhost:5000/api/gps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          lat,
          lng,
          battery,
          signal
        })
      })
      .then(res => res.json())
      .then(data => {
        addLog(`📤 GPS sent: ${lat.toFixed(4)}, ${lng.toFixed(4)} | Status: ${data.animal?.status || 'OK'}`);
      })
      .catch(err => {
        addLog(`❌ Failed to send GPS: ${err.message}`);
      });
    }, 2000);

    return () => clearInterval(interval);
  };

  const stopSimulation = () => {
    setSimulating(false);
    addLog('🛑 Simulation stopped');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">🔵 Hardware Connection</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Panel */}
        <div>
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-4">
              Connect your GPS tracking device via Bluetooth or simulate hardware data.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={connectBluetooth}
                disabled={connected}
                className={`px-4 py-2 rounded-lg font-medium ${
                  connected 
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {connected ? '✅ Connected' : '🔵 Connect Bluetooth'}
              </button>
              
              <button
                onClick={simulating ? stopSimulation : simulateHardware}
                className={`px-4 py-2 rounded-lg font-medium ${
                  simulating
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {simulating ? '🛑 Stop' : '🎮 Simulate Hardware'}
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-medium mb-2">Connection Status:</h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span>{connected ? 'Device Connected' : 'No Device Connected'}</span>
            </div>
            {device && (
              <p className="text-sm text-gray-600 mt-2">Device: {device.name}</p>
            )}
          </div>
        </div>

        {/* Logs Panel */}
        <div>
          <h3 className="font-medium mb-2">Communication Logs:</h3>
          <div className="bg-gray-900 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <span className="text-gray-500">No logs yet...</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">
                  <span className="text-gray-500">[{log.time}]</span>{' '}
                  <span className="text-green-400">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Hardware Data Format */}
      <div className="mt-6 border-t pt-4">
        <h3 className="font-medium mb-2">📋 Expected Data Format:</h3>
        <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
          <p className="text-purple-600">// Hardware sends JSON to POST /api/gps</p>
          <p>{'{'}</p>
          <p className="ml-4">"device_id": "BLE-12345",</p>
          <p className="ml-4">"lat": -1.293,</p>
          <p className="ml-4">"lng": 36.824,</p>
          <p className="ml-4">"battery": 85,</p>
          <p className="ml-4">"signal": 90</p>
          <p>{'}'}</p>
        </div>
      </div>

      {/* Arduino/ESP32 Example */}
      <div className="mt-4 border-t pt-4">
        <h3 className="font-medium mb-2">🛠️ Arduino/ESP32 Example Code:</h3>
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
          <pre>{`#include <WiFi.h>
#include <HTTPClient.h>

String DEVICE_ID = "BLE-12345";
String SERVER_URL = "http://YOUR_IP:5000/api/gps";

void sendGPS(float lat, float lng, int battery) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    
    String json = "{\"device_id\":\"" + DEVICE_ID + 
                  "\",\"lat\":" + String(lat) + 
                  ",\"lng\":" + String(lng) + 
                  ",\"battery\":" + String(battery) + "}";
    
    int response = http.POST(json);
    http.end();
  }
}`}</pre>
        </div>
      </div>
    </div>
  );
}

