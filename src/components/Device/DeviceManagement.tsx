import React, { useState, useEffect, useCallback } from 'react';
import { devicesAPI, locationsAPI, socket } from '../../services/api';
import { Device } from '../../types';
import DeviceForm from './DeviceForm';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';

const DeviceManagement: React.FC = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [adminLocationId, setAdminLocationId] = useState<number | null>(null);

  const fetchDevices = useCallback(async (retryCount = 0) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      let response;
      if (user.role === 'admin_user') {
        const userLocation = await locationsAPI.getLocMember(user.id);
        const idLocation = parseInt(userLocation.data[0].locationId);
        setAdminLocationId(idLocation);
        if (socket.connected) {
          socket.emit('join_location', idLocation);
        }

        if (userLocation && userLocation.data && userLocation.data.length > 0) {
          response = await devicesAPI.getLoc(idLocation);
        } else {
          setDevices([]);
          return;
        }
      } else {
        response = await devicesAPI.getAll();
      }
      setDevices(response?.data || []);
    } catch (err) {
      const errorMessage = 'Failed to fetch devices';
      setError(errorMessage);
      console.error(err);
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleOpenModal = (device: Device | null = null) => {
    setEditingDevice(device);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingDevice(null);
    setIsModalOpen(false);
  };

  const handleSaveDevice = async (deviceData: Omit<Device, 'id' | 'isActive' | 'last_seen'>) => {
    const isEditing = !!editingDevice;
    try {
      if (editingDevice) {
        await devicesAPI.update(editingDevice.id, deviceData);
      } else {
        await devicesAPI.create(deviceData);
      }
      await fetchDevices();
      handleCloseModal();
      Swal.fire({
        icon: 'success',
        title: `Device ${isEditing ? 'Updated' : 'Added'}`,
        text: `Device has been successfully ${isEditing ? 'updated' : 'added'}.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error('Failed to save device', error);
      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text: error.response?.data?.message || 'Failed to save device.',
      });
    }
  };

  const handleDeleteDevice = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await devicesAPI.delete(id);
        await fetchDevices();
        Swal.fire('Deleted!', 'The device has been deleted.', 'success');
      } catch (error: any) {
        console.error('Failed to delete device', error);
        Swal.fire('Error', error.response?.data?.message || 'Failed to delete device.', 'error');
      }
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Device Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Add New Device
        </button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal responsive-table">
          <thead>
            <tr className="dark:bg-gray-700">
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Serial Number
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                MAC Address
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Location
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id} className="dark:bg-gray-800 dark:border-gray-700">
                <td data-label="Serial Number" className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                  <p className="text-gray-900 dark:text-white whitespace-no-wrap">{device.nomor_seri}</p>
                </td>
                <td data-label="IP Address" className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                  <p className="text-gray-900 dark:text-white whitespace-no-wrap">{device.ip || 'N/A'}</p>
                </td>
                <td data-label="MAC Address" className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                  <p className="text-gray-900 dark:text-white whitespace-no-wrap">{device.mac_address || 'N/A'}</p>
                </td>
                <td data-label="Location" className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                  <p className="text-gray-900 dark:text-white whitespace-no-wrap">{device.Location?.name || 'N/A'}</p>
                </td>
                <td data-label="Actions" className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                  <div className="flex justify-end">
                    <button onClick={() => handleOpenModal(device)} className={`text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4 ${user.role === 'admin_user' ? 'hidden' : ''}`}>Edit</button>
                    <button onClick={() => handleDeleteDevice(device.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <DeviceForm 
          device={editingDevice}
          onSave={handleSaveDevice}
          adminLocationId={adminLocationId}
          onCancel={handleCloseModal}
        />
      )}
    </div>
  );
};

export default DeviceManagement;
