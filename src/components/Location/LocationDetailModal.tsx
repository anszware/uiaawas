import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../../types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface LocationDetailModalProps {
  location: Location;
  onClose: () => void;
}

const LocationDetailModal: React.FC<LocationDetailModalProps> = ({ location, onClose }) => {
  const position = new LatLng(parseFloat(location.lang), parseFloat(location.long));

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Detail Lokasi: {location.name}
            </h3>
            <button 
                onClick={onClose} 
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Details Section */}
            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Alamat</h4>
                    <p className="text-base text-gray-900 dark:text-white">{location.address}</p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Koordinat</h4>
                    <p className="text-base text-gray-900 dark:text-white">Latitude: {location.lang}</p>
                    <p className="text-base text-gray-900 dark:text-white">Longitude: {location.long}</p>
                </div>
            </div>

            {/* Map Section */}
            <div className="h-64 md:h-auto rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={position}>
                        <Popup>{location.name}</Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>

        <div className="flex items-center justify-end pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button 
                type="button" 
                onClick={onClose} 
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded transition-colors"
            >
              Tutup
            </button>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailModal;