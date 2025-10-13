import React, { useState, useEffect } from 'react';
import { Device, Location } from '../../types';
import { locationsAPI } from '../../services/api';

interface DeviceFormProps {
  device?: Device | null;
  onSave: (device: Omit<Device, 'id' | 'isActive' | 'last_seen'>) => void;
  onCancel: () => void;
  adminLocationId?: number | null;
}

const DeviceForm: React.FC<DeviceFormProps> = ({ device, onSave, onCancel, adminLocationId }) => {
  const [formData, setFormData] = useState({
    nomor_seri: '',
    ip: '',
    mac_address: '',
    lang: 0,
    long: 0,
    // Set default locationId if adminLocationId is provided and it's a new device
    locationId: device ? undefined : (adminLocationId || undefined) as number | undefined,
  });
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (device) {
      setFormData({
        nomor_seri: device.nomor_seri,
        ip: device.ip,
        mac_address: device.mac_address,
        lang: device.lang,
        long: device.long,
        locationId: device.locationId,
      });
    }
  }, [device]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        if (adminLocationId) {
          // If it's an admin user, only fetch their specific location
          const response = await locationsAPI.getById(adminLocationId);
          setLocations([response.data]);
        } else {
          const response = await locationsAPI.getAll();
          setLocations(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch locations', error);
      }
    };
    fetchLocations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'locationId' ? (value ? parseInt(value) : undefined) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">{device ? 'Edit Device' : 'Add New Device'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nomor_seri" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Serial Number</label>
            <input type="text" name="nomor_seri" id="nomor_seri" value={formData.nomor_seri} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
          </div>
          <div className="mb-4">
            <label htmlFor="ip" className="block text-sm font-medium text-gray-700 dark:text-gray-300">IP Address</label>
            <input type="text" name="ip" id="ip" value={formData.ip} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div className="mb-4">
            <label htmlFor="mac_address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">MAC Address</label>
            <input type="text" name="mac_address" id="mac_address" value={formData.mac_address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div className="mb-4">
            <label htmlFor="lang" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</label>
            <input type="number" name="lang" id="lang" value={formData.lang} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div className="mb-4">
            <label htmlFor="long" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</label>
            <input type="number" name="long" id="long" value={formData.long} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div className="mb-4">
            <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            <select 
              name="locationId" 
              id="locationId" value={formData.locationId || ''} 
              onChange={handleChange} 
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={!!adminLocationId} // Disable dropdown if it's an admin wilayah
            >
              <option value="">No Location</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end mt-6">
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

export default DeviceForm;
