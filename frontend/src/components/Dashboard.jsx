import { useState, useEffect } from 'react';
import MapView from './MapView';
import AlertPanel from './AlertPanel';
import BluetoothScanner from './BluetoothScanner';
import api from '../services/api';

export default function Dashboard() {
  const [animals, setAnimals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnimal, setNewAnimal] = useState({ name: '', device_id: '', ear_tag: '', species: 'cattle' });
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    // Check for saved user
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Auto-login with demo user for testing
      const demoUser = { id: 1, email: 'admin@farm.com', name: 'Admin User' };
      localStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
    }
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [animalsRes, alertsRes] = await Promise.all([
        api.get('/animals'),
        api.get('/alerts')
      ]);
      setAnimals(animalsRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnimal = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/animals', newAnimal);
      if (res.data.success) {
        setShowAddModal(false);
        setNewAnimal({ name: '', device_id: '', ear_tag: '', species: 'cattle' });
        fetchData();
        alert('Animal registered successfully!');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add animal';
      alert(msg);
    }
  };

  const simulateMovement = async () => {
    setSimulating(true);
    try {
      const res = await api.post('/simulate/movement');
      if (res.data.success) {
        alert(`Movement simulated! ${res.data.exited} animal(s) exited the farm.`);
        fetchData();
      }
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setSimulating(false);
    }
  };

  const insideCount = animals.filter(a => a.status === 'IN').length;
  const outsideCount = animals.filter(a => a.status === 'OUT').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Livestock Tracker</h1>
              <p className="text-green-100 text-sm mt-1">Real-time GPS tracking</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={simulateMovement}
                disabled={simulating}
                className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                {simulating ? 'Testing...' : 'Test Alerts'}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium"
              >
                + Add Animal
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-5">
            <p className="text-gray-500 text-sm">Total Animals</p>
            <p className="text-3xl font-bold text-gray-800">{animals.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Inside Farm</p>
            <p className="text-3xl font-bold text-green-600">{insideCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Outside Farm</p>
            <p className="text-3xl font-bold text-red-600">{outsideCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Alerts</p>
            <p className="text-3xl font-bold text-yellow-600">{alerts.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Live Map</h2>
            <MapView animals={animals} />
          </div>
          <div className="lg:col-span-1">
            <AlertPanel alerts={alerts} onRefresh={fetchData} />
          </div>
        </div>

        {/* Bluetooth Scanner Section */}
        <div className="mb-6">
          <BluetoothScanner 
            animals={animals} 
            onStatusUpdate={(detectedIds) => {
              // Update animal status based on Bluetooth detection
              console.log('Bluetooth detected:', detectedIds);
            }}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Animals ({animals.length})</h2>
          </div>
          
          {animals.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">No animals registered yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                + Add Your First Animal
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Animal</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Device ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {animals.map(animal => (
                    <tr key={animal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                            {animal.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{animal.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{animal.species}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">{animal.device_id}</code>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          animal.status === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {animal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {animal.lat?.toFixed(4)}, {animal.lng?.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-green-600 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-white">Register New Animal</h2>
            </div>
            <form onSubmit={handleAddAnimal} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Animal Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  value={newAnimal.name}
                  onChange={e => setNewAnimal({ ...newAnimal, name: e.target.value })}
                  placeholder="e.g., Bessie"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Device ID *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono"
                  value={newAnimal.device_id}
                  onChange={e => setNewAnimal({ ...newAnimal, device_id: e.target.value })}
                  placeholder="e.g., BLE-12345"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ear Tag (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  value={newAnimal.ear_tag}
                  onChange={e => setNewAnimal({ ...newAnimal, ear_tag: e.target.value })}
                  placeholder="e.g., ET-001"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                  value={newAnimal.species}
                  onChange={e => setNewAnimal({ ...newAnimal, species: e.target.value })}
                >
                  <option value="cattle">Cattle</option>
                  <option value="goat">Goat</option>
                  <option value="sheep">Sheep</option>
                  <option value="pig">Pig</option>
                  <option value="chicken">Chicken</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

