import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../../types';

// Define the data shape for the form
export type LocationFormData = Partial<Pick<Location, 'name' | 'address' | 'lang' | 'long'>>;

interface LocationFormProps {
  location?: Location | null;
  onSave: (location: LocationFormData) => void;
  onCancel: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({ location, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<LocationFormData, 'lang' | 'long'>>({
    name: '',
    address: '',
  });
  const [position, setPosition] = useState<LatLng | null>(null);

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        address: location.address,
      });
      if (location.lang && location.long) {
        setPosition(new LatLng(parseFloat(location.lang), parseFloat(location.long)));
      }
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) {
      alert('Please select a location on the map.');
      return;
    }
    const dataToSave: LocationFormData = {
      ...formData,
      lang: position.lat.toString(),
      long: position.lng.toString(),
    };
    onSave(dataToSave);
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });
    return position === null ? null : (
      <Marker position={position}>
        <Popup>Selected Location</Popup>
      </Marker>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">{location ? 'Edit Location' : 'Add New Location'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
              <textarea name="address" id="address" value={formData.address} onChange={handleChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="lat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</label>
                    <input type="number" id="lat" value={position ? position.lat.toFixed(6) : ''} readOnly className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="lng" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</label>
                    <input type="number" id="lng" value={position ? position.lng.toFixed(6) : ''} readOnly className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm sm:text-sm" />
                </div>
            </div>
          </div>

          {/* Map */}
          <div className="h-96 md:h-auto rounded-lg overflow-hidden">
            <MapContainer center={position || [-6.2088, 106.8456]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapClickHandler />
            </MapContainer>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded mr-2 transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationForm;