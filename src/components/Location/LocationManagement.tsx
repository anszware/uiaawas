import React, { useState, useEffect, useCallback } from 'react';
import { locationsAPI } from '../../services/api';
import { Location } from '../../types';
import LocationForm, { LocationFormData } from './LocationForm';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';
import LocationDetailModal from './LocationDetailModal';

const LocationManagement: React.FC = () => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [viewingLocation, setViewingLocation] = useState<Location | null>(null);

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await locationsAPI.getAll();
      setLocations(response.data);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Fetch Failed',
        text: 'Failed to fetch locations.',
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleOpenModal = (location: Location | null = null) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingLocation(null);
    setIsModalOpen(false);
  };

  const handleOpenDetailModal = (location: Location) => {
    setViewingLocation(location);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setViewingLocation(null);
    setIsDetailModalOpen(false);
  };

  const handleSaveLocation = async (locationData: LocationFormData) => {
    if (!user) {
        Swal.fire({ icon: 'error', title: 'Authentication Error', text: 'User not found.' });
        return;
    }
    
    try {
      const isEditing = !!editingLocation;
      const payload = { ...locationData, userId: user.id };

      if (editingLocation) {
        await locationsAPI.update(editingLocation.id, payload);
      } else {
        await locationsAPI.create(payload);
      }
      
      fetchLocations();
      handleCloseModal();

      Swal.fire({
        icon: 'success',
        title: `Location ${isEditing ? 'Updated' : 'Added'}`,
        text: `Location has been successfully ${isEditing ? 'updated' : 'added'}.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error('Failed to save location', error);
      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text: error.response?.data?.message || 'Failed to save location.',
      });
    }
  };

  const handleDeleteLocation = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await locationsAPI.delete(id);
        fetchLocations();
        Swal.fire(
          'Deleted!',
          'The location has been deleted.',
          'success'
        );
      } catch (error: any) {
        console.error('Failed to delete location', error);
        Swal.fire({
          icon: 'error',
          title: 'Deletion Failed',
          text: error.response?.data?.message || 'Failed to delete location.',
        });
      }
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Location Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Add New Location
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal responsive-table">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Address
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Latitude
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Longitude
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location) => (
              <tr key={location.id} className="dark:bg-gray-800 dark:border-gray-700">
                <td data-label="Name" className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                  <p className="text-gray-900 dark:text-white whitespace-no-wrap">{location.name}</p>
                </td>
                <td data-label="Address" className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                  <p className="text-gray-900 dark:text-white whitespace-no-wrap">{location.address}</p>
                </td>
                <td data-label="Latitude" className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                  <p className="text-gray-900 dark:text-white whitespace-no-wrap">{location.lang}</p>
                </td>
                <td data-label="Longitude" className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                  <p className="text-gray-900 dark:text-white whitespace-no-wrap">{location.long}</p>
                </td>
                <td data-label="Actions" className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                  <div className="flex justify-end items-center space-x-4">
                    <button onClick={() => handleOpenDetailModal(location)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Detail</button>
                    <button onClick={() => handleOpenModal(location)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Edit</button>
                    <button onClick={() => handleDeleteLocation(location.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <LocationForm 
          location={editingLocation}
          onSave={handleSaveLocation}
          onCancel={handleCloseModal}
        />
      )}
      {isDetailModalOpen && viewingLocation && (
        <LocationDetailModal
          location={viewingLocation}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
};

export default LocationManagement;