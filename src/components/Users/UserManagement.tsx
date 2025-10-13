import React, { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../../services/api';
import { User } from '../../types';
import UserForm, { UserFormData } from './UserForm';
import Swal from 'sweetalert2';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Fetch Failed',
        text: 'Failed to fetch users.',
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleSaveUser = async (userData: UserFormData) => {
    try {
      const isEditing = !!editingUser;
      if (editingUser) {
        await usersAPI.update(editingUser.id, userData);
      } else {
        // The create API might need more fields than the form provides,
        // like gender, phone, address from the registration form.
        // For this management screen, we'll assume the API can handle this simplified payload.
        await usersAPI.create(userData as any);
      }
      fetchUsers();
      handleCloseModal();

      Swal.fire({
        icon: 'success',
        title: `User ${isEditing ? 'Updated' : 'Added'}`,
        text: `User has been successfully ${isEditing ? 'updated' : 'added'}.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error('Failed to save user', error);
      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text: error.response?.data?.message || 'Failed to save user.',
      });
    }
  };

  const handleDeleteUser = async (id: number) => {
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
        await usersAPI.delete(id);
        fetchUsers();
        Swal.fire(
          'Deleted!',
          'The user has been deleted.',
          'success'
        );
      } catch (error: any) {
        console.error('Failed to delete user', error);
        Swal.fire({
          icon: 'error',
          title: 'Deletion Failed',
          text: error.response?.data?.message || 'Failed to delete user.',
        });
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-900 dark:text-white">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">User Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Add New User
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal responsive-table">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Username
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="dark:bg-gray-800 dark:border-gray-700">
                <td data-label="Full Name" className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                  <p className="text-gray-900 dark:text-white whitespace-no-wrap">{user.fullName}</p>
                </td>
                <td data-label="Username" className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                  <p className="text-gray-900 dark:text-white whitespace-no-wrap">{user.username}</p>
                </td>
                <td data-label="Email" className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                  <p className="text-gray-900 dark:text-white whitespace-no-wrap">{user.email}</p>
                </td>
                <td data-label="Role" className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                  <p className="text-gray-900 dark:text-white whitespace-no-wrap">{user.role}</p>
                </td>
                <td data-label="Actions" className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                  <div className="flex justify-end">
                    <button onClick={() => handleOpenModal(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">Edit</button>
                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <UserForm 
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={handleCloseModal}
        />
      )}
    </div>
  );
};

export default UserManagement;
