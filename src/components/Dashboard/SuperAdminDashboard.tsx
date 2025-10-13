import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { dashboardAPI } from '../../services/api';
import { DashboardSuperAdmin } from '../../types';
import { 
  BuildingOffice2Icon, 
  MapPinIcon,
  CpuChipIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function SuperAdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardSuperAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // For demo purposes, using mock data since API might not be available
      const mockData: DashboardSuperAdmin = {
        totalActiveProducts: 150,
        totalLocations: 35,
        activeProductLocations: [
          {
            deviceId: 1,
            deviceName: 'SN-001-JKT',
            lat: '-6.2088',
            lng: '106.8456',
            locationName: 'Gudang Jakarta Pusat'
          },
          {
            deviceId: 5,
            deviceName: 'SN-005-BDG',
            lat: '-6.9175',
            lng: '107.6191',
            locationName: 'Pabrik Bandung'
          },
          {
            deviceId: 8,
            deviceName: 'SN-008-SBY',
            lat: '-7.2575',
            lng: '112.7521',
            locationName: 'Kantor Surabaya'
          }
        ]
      };
      
      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Gagal memuat data dashboard
        </p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Produk Aktif',
      value: dashboardData.totalActiveProducts,
      icon: CpuChipIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      name: 'Total Lokasi Terdaftar',
      value: dashboardData.totalLocations,
      icon: MapPinIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      name: 'Perangkat Aktif',
      value: dashboardData.activeProductLocations.length,
      icon: SignalIcon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Super Admin
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className={`${stat.bgColor} p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Peta Lokasi Produk Aktif
        </h2>
        <div className="h-96 rounded-lg overflow-hidden flex-grow">
          <div className="h-full w-full">
            <MapContainer
              center={[-6.2088, 106.8456]}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {dashboardData.activeProductLocations.map((location) => (
                <Marker
                  key={location.deviceId}
                  position={[parseFloat(location.lat), parseFloat(location.lng)]}
                >
                  <Popup>
                    <div className="text-sm">
                      <h3 className="font-semibold">{location.deviceName}</h3>
                      <p className="text-gray-600">{location.locationName}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Device List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Daftar Perangkat Aktif
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nama Perangkat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Koordinat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {dashboardData.activeProductLocations.map((device) => (
                <tr key={device.deviceId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {device.deviceName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {device.locationName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {device.lat}, {device.lng}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}