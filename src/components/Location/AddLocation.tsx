import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AddLocation: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState<LatLng | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position || !user) {
      alert('Please select a location on the map.');
      return;
    }

    const locationData = {
      name,
      address,
      lang: position.lat.toString(),
      long: position.lng.toString(),
      userId: user.id,
    };

    try {
      await locationsAPI.create(locationData);
      const Swal = (await import('sweetalert2')).default;
      await Swal.fire({
        icon: 'success',
        title: 'Lokasi berhasil ditambahkan!',
        showConfirmButton: false,
        timer: 1500,
      });
      navigate('/dashboard');
    } catch (error) {
      // @ts-ignore
      const Swal = (await import('sweetalert2')).default;
      console.error('Failed to add location', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal menambah lokasi',
        text: 'Terjadi kesalahan saat menambah lokasi. Silakan coba lagi.',
      });
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });
    return position === null ? null : (
      <Marker position={position}>
        <Popup>Lokasi Dipilih</Popup>
      </Marker>
    );
  };

  return (
    <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Tambah Lokasi Baru</h1>
        <p className="mb-4 text-gray-600 dark:text-gray-300">Anda belum memiliki lokasi. Silakan tambahkan satu dengan mengisi form di bawah dan memilih lokasi di peta.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lokasi</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alamat</label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="lat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</label>
              <input
                type="number"
                id="lat"
                value={position ? position.lat : ''}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm sm:text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="lng" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</label>
              <input
                type="number"
                id="lng"
                value={position ? position.lng : ''}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm sm:text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Simpan Lokasi
          </button>
        </form>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-96 lg:h-full">
        <MapContainer center={[-6.2088, 106.8456]} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler />
        </MapContainer>
      </div>
    </div>
  );
};

export default AddLocation;