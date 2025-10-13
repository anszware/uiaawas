import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'leaflet/dist/leaflet.css';
import { dashboardAPI } from '../../services/api';
import { AdminDashboardData } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [wilayahLang, setWilayahLang] = useState();
  const [wilayahLong, setWilayahLong] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardAPI.getAdminDashboardData();
        // console.log('Admin Dashboard Data:', response);
        if (!response.data.hasLocation) {
          navigate('/add-location');
        } else {
          setData(response.data);
          setWilayahLang(response.data.locationLang || 0);
          setWilayahLong(response.data.locationLong || 0);
        }
      } catch (error) {
        console.error('Failed to fetch admin dashboard data', error);
        // Handle error appropriately
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data available.</div>;
  }

  const chartData = {
    labels: Array.from({ length: data.carbonChartData?.length || 0 }, (_, i) => `Point ${i + 1}`),
    datasets: [
      {
        label: 'Average Carbon',
        data: data.carbonChartData || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Active Products</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalActiveProducts}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Inactive Products</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalInactiveProducts}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Avg. Temperature</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.averageTemp?.toFixed(2)}°C</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Avg. Humidity</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.averageHumidity?.toFixed(2)}%</p>
        </div>
      </div>

      {/* Map and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-96 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Product Locations</h3>
          <div className="flex-grow rounded-lg overflow-hidden">
            <MapContainer center={[wilayahLang, wilayahLong]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {Array.isArray(data.productLocations) && data.productLocations.length > 0 && data.productLocations
                .filter(loc => !isNaN(parseFloat(loc.lat)) && !isNaN(parseFloat(loc.lng)))
                .map((loc, index) => (
                  <Marker key={index} position={[parseFloat(loc.lat), parseFloat(loc.lng)]}>
                    <Popup>
                      <b>{loc.locationName}</b><br />{loc.deviceName}
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Average Carbon</h3>
          <Line data={chartData} />
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Warnings & Notifications</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Location</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Product</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Time</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.notifications?.map((notif) => (
                <tr key={notif.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{/* Location info needed from API */}</td>
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{notif.message}</td>
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{new Date(notif.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 capitalize text-gray-800 dark:text-gray-200">{notif.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;