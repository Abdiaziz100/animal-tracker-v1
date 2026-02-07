import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

function AnimalForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    species: 'cattle',
    ear_tag: '',
    breed: '',
    age: '',
    gender: 'male',
    weight: '',
    color: '',
    current_lat: '',
    current_lng: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchAnimal();
    }
  }, [id]);

  const fetchAnimal = async () => {
    try {
      const response = await api.get(`/animals/${id}`);
      const animal = response.data.animal;
      setFormData({
        name: animal.name || '',
        species: animal.species || 'cattle',
        ear_tag: animal.ear_tag || '',
        breed: animal.breed || '',
        age: animal.age || '',
        gender: animal.gender || 'male',
        weight: animal.weight || '',
        color: animal.color || '',
        current_lat: animal.current_lat || '',
        current_lng: animal.current_lng || ''
      });
    } catch (error) {
      setError('Failed to load animal');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Prepare data with proper types
      const submitData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        current_lat: formData.current_lat ? parseFloat(formData.current_lat) : null,
        current_lng: formData.current_lng ? parseFloat(formData.current_lng) : null,
      };

      if (isEdit) {
        await api.put(`/animals/${id}`, submitData);
      } else {
        await api.post('/animals', submitData);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save animal');
    } finally {
      setSaving(false);
    }
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
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 mr-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEdit ? 'Edit Animal' : 'Add New Animal'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter animal name"
                required
              />
            </div>

            {/* Species */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Species *
              </label>
              <select
                name="species"
                value={formData.species}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="cattle">Cattle</option>
                <option value="sheep">Sheep</option>
                <option value="goat">Goat</option>
                <option value="pig">Pig</option>
                <option value="horse">Horse</option>
                <option value="chicken">Chicken</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Ear Tag */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Ear Tag *
              </label>
              <input
                type="text"
                name="ear_tag"
                value={formData.ear_tag}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter ear tag number"
                required
                disabled={isEdit}
              />
            </div>

            {/* Breed */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Breed
              </label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter breed"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Age (years)
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter age"
                min="0"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter weight"
                min="0"
                step="0.1"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Color/Markings
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter color or markings"
              />
            </div>

            {/* Initial Location */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Initial Location (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    name="current_lat"
                    value={formData.current_lat}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 40.7128"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    name="current_lng"
                    value={formData.current_lng}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., -74.0060"
                    step="0.0001"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : (isEdit ? 'Update Animal' : 'Add Animal')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AnimalForm;

