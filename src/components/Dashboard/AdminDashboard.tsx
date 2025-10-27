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
import Swal from 'sweetalert2';
import { dashboardAPI, socket } from '../../services/api';
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardAPI.getAdminDashboardData();
        if (!response.data.hasLocation) {
          navigate('/add-location');
        } else {
          setData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    socket.connect();

    const handleNewNotification = (notification: { message: string }) => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: notification.message,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      });
    };

    const handleNewData = (newData: { type: string; value: number }) => {
      console.log('Received new data via socket:', newData);
      setData(prevData => {
        if (!prevData) return null;

        let updatedTemp = prevData.averageTemp;
        let updatedHumidity = prevData.averageHumidity;

        if (newData.type === 'suhu') {
          updatedTemp = newData.value;
        } else if (newData.type === 'kelembaban') {
          updatedHumidity = newData.value;
        }

        if (newData.type !== 'suhu' && newData.type !== 'kelembaban') {
          const newChartData = [...(prevData.qualityChartData || []), {
            recorded_at: new Date().toISOString(),
            jenis_data: newData.type,
            data: newData.value
          }];

          if (newChartData.length > 100) { // Increased limit for more data points
            newChartData.shift();
          }

          return {
            ...prevData,
            averageTemp: updatedTemp,
            averageHumidity: updatedHumidity,
            qualityChartData: newChartData
          };
        }

        return {
          ...prevData,
          averageTemp: updatedTemp,
          averageHumidity: updatedHumidity,
        };
      });
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('new_data', handleNewData);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('new_data', handleNewData);
      socket.disconnect();
    };
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data available.</div>;
  }

  const processChartData = () => {
    if (!data.qualityChartData || data.qualityChartData.length === 0) {
      return { labels: [], datasets: [] };
    }

    const allLabels = [...new Set(data.qualityChartData.map(d => new Date(d.recorded_at).toLocaleString()))].sort();

    const groupedData: { [key: string]: { [jenis: string]: any } } = {};
    data.qualityChartData.forEach(item => {
      const timeLabel = new Date(item.recorded_at).toLocaleString();
      if (!groupedData[timeLabel]) {
        groupedData[timeLabel] = {};
      }
      groupedData[timeLabel][item.jenis_data] = item.data;
    });

    const datasets: { [key: string]: { label: string; data: (any | null)[]; borderColor: string; backgroundColor: string; } } = {};

    data.qualityChartData.forEach(item => {
      if (!datasets[item.jenis_data]) {
        const color = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`;
        datasets[item.jenis_data] = {
          label: item.jenis_data.toUpperCase(),
          data: new Array(allLabels.length).fill(null),
          borderColor: color,
          backgroundColor: color.replace('1)', '0.5)'),
        };
      }
    });

    allLabels.forEach((label, index) => {
      for (const jenis_data in datasets) {
        if (groupedData[label] && groupedData[label][jenis_data] !== undefined) {
          datasets[jenis_data].data[index] = groupedData[label][jenis_data];
        }
      }
    });

    return {
      labels: allLabels,
      datasets: Object.values(datasets),
    };
  };

  const chartData = processChartData();

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
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-96 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Product Locations</h3>
          <div className="flex-grow rounded-lg overflow-hidden">
            <MapContainer center={[data.locationLang || 0, data.locationLong || 0]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {Array.isArray(data.productLocations) && data.productLocations.length > 0 && data.productLocations
                .filter(loc => !isNaN(loc.lat) && !isNaN(loc.lng))
                .map((loc, index) => (
                  <Marker key={index} position={[loc.lat, loc.lng]}>
                    <Popup>
                      <b>{loc.locationName}</b><br />{loc.deviceName}
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Air Quality Data</h3>
          <Line data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;