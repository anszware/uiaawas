import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ArrowUpIcon, UsersIcon, MapPinIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../supabaseClient';
import { locationsAPI } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface KpiData {
  totalUsers: { value: string; change: string; changeType: 'increase' | 'decrease' };
  totalLocations: { value: string; change: string; changeType: 'increase' | 'decrease' };
  avgTimeOnApp: { value: string; change: string; changeType: 'increase' | 'decrease' };
  newUsersToday: { value: string; change: string; changeType: 'increase' | 'decrease' };
}

const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [userActivityData, setUserActivityData] = useState<any>(null);
  const [locationDistributionData, setLocationDistributionData] = useState<any>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users and locations in parallel
      const [userResponse, locationResponse] = await Promise.all([
        supabase.auth.admin.listUsers(),
        locationsAPI.getAll()
      ]);

      // Process User Data
      if (userResponse.error) throw new Error(`Failed to fetch users: ${userResponse.error.message}`);
      const { users } = userResponse.data;
      const totalUsers = users.length;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newUsersToday = users.filter(u => new Date(u.created_at) >= today).length;

      // Process Location Data
      const locations = locationResponse.data;
      const totalLocations = locations.length;
      
      // --- KPI Data ---
      setKpiData({
        totalUsers: { value: totalUsers.toLocaleString(), change: '+1.2%', changeType: 'increase' }, // Placeholder change
        totalLocations: { value: totalLocations.toLocaleString(), change: '+2', changeType: 'increase' }, // Placeholder change
        avgTimeOnApp: { value: '12.8 min', change: '-1.5%', changeType: 'decrease' }, // Placeholder
        newUsersToday: { value: newUsersToday.toLocaleString(), change: `+${newUsersToday}`, changeType: 'increase' },
      });

      // --- User Activity Chart Data (Monthly) ---
      const monthlyActivity: { [key: string]: number } = {};
      const monthLabels = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          return d.toLocaleString('default', { month: 'long' });
      }).reverse();

      monthLabels.forEach(m => monthlyActivity[m] = 0);
      users.forEach(user => {
          const month = new Date(user.created_at).toLocaleString('default', { month: 'long' });
          if (month in monthlyActivity) {
              monthlyActivity[month]++;
          }
      });
      setUserActivityData({
          labels: monthLabels,
          datasets: [{
              label: 'New Users',
              data: Object.values(monthlyActivity),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
          }],
      });

      // --- Location Distribution Chart Data ---
      const cityCounts: { [key: string]: number } = {};
      locations.forEach(loc => {
        const city = loc.address.split(',').pop()?.trim() || 'Unknown';
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      });
      const sortedCities = Object.entries(cityCounts).sort(([,a],[,b]) => b-a).slice(0, 5);
      setLocationDistributionData({
        labels: sortedCities.map(([city]) => city),
        datasets: [{
          label: 'Location Distribution',
          data: sortedCities.map(([,count]) => count),
          backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)'],
          borderColor: '#FFF',
          borderWidth: 2,
        }],
      });

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            color: '#A0AEC0', // gray-400
        }
      },
      title: {
        display: true,
        color: '#E2E8F0', // gray-200
      },
    },
    scales: {
        x: {
            ticks: { color: '#A0AEC0' },
            grid: { color: 'rgba(113, 128, 150, 0.2)'}
        },
        y: {
            ticks: { color: '#A0AEC0' },
            grid: { color: 'rgba(113, 128, 150, 0.2)'}
        }
    }
  };

  const doughnutOptions = {
    ...chartOptions,
    scales: {},
    plugins: {
        ...chartOptions.plugins,
        legend: {
            position: 'right' as const,
            labels: {
                color: '#A0AEC0',
            }
        }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="p-8 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-red-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">Failed to Load Data</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
          <button onClick={fetchDashboardData} className="px-4 py-2 mt-6 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="p-4 md:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Analytics Dashboard</h1>

      {/* KPI Cards */}
      {kpiData && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KpiCard title="Total Users" value={kpiData.totalUsers.value} change={kpiData.totalUsers.change} changeType={kpiData.totalUsers.changeType} icon={<UsersIcon className="h-8 w-8" />} />
        <KpiCard title="Total Locations" value={kpiData.totalLocations.value} change={kpiData.totalLocations.change} changeType={kpiData.totalLocations.changeType} icon={<MapPinIcon className="h-8 w-8" />} />
        <KpiCard title="Avg. Time on App" value={kpiData.avgTimeOnApp.value} change={kpiData.avgTimeOnApp.change} changeType={kpiData.avgTimeOnApp.changeType} icon={<ClockIcon className="h-8 w-8" />} />
        <KpiCard title="New Users Today" value={kpiData.newUsersToday.value} change={kpiData.newUsersToday.change} changeType={kpiData.newUsersToday.changeType} icon={<ArrowUpIcon className="h-8 w-8" />} />
      </div>}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {userActivityData && <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Activity</h2>
          <div className="h-80">
            <Bar options={{...chartOptions, plugins: {...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'New Users (Last 7 Months)'}}}} data={userActivityData} />
          </div>
        </div>}
        {locationDistributionData && <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Location Distribution</h2>
          <div className="h-80">
            <Doughnut options={{...doughnutOptions, plugins: {...doughnutOptions.plugins, title: { ...doughnutOptions.plugins.title, text: 'Top 5 Cities'}}}} data={locationDistributionData} />
          </div>
        </div>}
      </div>
    </div>
  );
};

interface KpiCardProps {
    title: string;
    value: string;
    change: string;
    changeType: 'increase' | 'decrease';
    icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, change, changeType, icon }) => {
    const changeColor = changeType === 'increase' ? 'text-green-500' : 'text-red-500';
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className={`text-sm ${changeColor}`}>{change} vs last month</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-500 dark:text-blue-300 p-3 rounded-full">
                {icon}
            </div>
        </div>
    );
}

export default AnalyticsDashboard;