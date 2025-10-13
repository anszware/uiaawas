import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { UserIcon, EnvelopeIcon, ShieldCheckIcon, PencilIcon } from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return <div className="p-6 text-center text-gray-900 dark:text-white">Memuat data pengguna...</div>;
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password && password !== confirmPassword) {
      Swal.fire('Error', 'Password dan konfirmasi password tidak cocok.', 'error');
      setIsLoading(false);
      return;
    }

    const dataToUpdate: { fullName?: string; password?: string } = {};
    if (fullName !== user.fullName) {
      dataToUpdate.fullName = fullName;
    }
    if (password) {
      dataToUpdate.password = password;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      setIsEditing(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.updateProfile(dataToUpdate);
      updateUser(response.data); // Update user in context
      Swal.fire('Sukses!', 'Profil berhasil diperbarui.', 'success');
      setIsEditing(false);
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Swal.fire('Gagal', error.response?.data?.message || 'Gagal memperbarui profil.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const roleDisplay: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Petugas',
    admin_user: 'Admin Wilayah',
    user: 'Warga',
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.fullName}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{roleDisplay[user.role] || user.role}</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    <PencilIcon className="h-4 w-4 mr-1.5" />
                    Edit Profil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!isEditing ? (
            // View Mode
            <dl className="space-y-6">
              <div className="flex items-start space-x-3">
                <EnvelopeIcon className="h-6 w-6 text-gray-400 mt-1" />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</dd>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <UserIcon className="h-6 w-6 text-gray-400 mt-1" />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nama Lengkap</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.fullName}</dd>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ShieldCheckIcon className="h-6 w-6 text-gray-400 mt-1" />
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Peran</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{roleDisplay[user.role] || user.role}</dd>
                </div>
              </div>
            </dl>
          ) : (
            // Edit Mode
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Informasi Pribadi</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ubah Password</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Kosongkan jika tidak ingin mengubah password.</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password Baru</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 space-x-3">
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setFullName(user.fullName); setPassword(''); setConfirmPassword(''); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-800"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;