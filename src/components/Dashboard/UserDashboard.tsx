import React, { useEffect, useState } from 'react';
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
import { dashboardAPI } from '../../services/api';
import { UserDashboardData } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const UserDashboard: React.FC = () => {
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWithLocation = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      dashboardAPI.getUserDashboardData(latitude, longitude)
        .then(response => {
          setData(response.data);
        })
        .catch(err => {
          console.error('Failed to fetch user dashboard data', err);
          setError('Failed to load dashboard data.');
        })
        .finally(() => {
          setLoading(false);
        });
    };

    const handleLocationError = (err: GeolocationPositionError) => {
      console.error('Geolocation error', err);
      setError('Geolocation is required to display the dashboard. Please enable location services.');
      setLoading(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(fetchWithLocation, handleLocationError);
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-900 dark:text-white">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return <div className="p-6 text-gray-900 dark:text-white">No data available.</div>;
  }

  const chartData = {
    labels: Array.from({ length: data.nearestDevice.carbonChartData?.length || 0 }, (_, i) => `Point ${i + 1}`),
    datasets: [
      {
        label: 'Average Carbon',
        data: data.nearestDevice.carbonChartData || [],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Dashboard</h1>
      <p className="text-gray-700 dark:text-gray-300">Showing data for nearest device: <strong className="text-gray-900 dark:text-white">{data.nearestDevice.deviceName}</strong> ({data.nearestDevice.distanceKm.toFixed(2)} km away)</p>

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Average Temperature</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.nearestDevice.averageTemp.toFixed(2)}°C</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Average Humidity</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.nearestDevice.averageHumidity.toFixed(2)}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Average Carbon (Nearest Device)</h3>
        <Line data={chartData} />
      </div>

      {/* Notifications Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Warnings & Notifications</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Location/Product</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Message</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Time</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.notifications.map((notif) => (
                <tr key={notif.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{/* Location info needed */}</td>
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

export default UserDashboard;