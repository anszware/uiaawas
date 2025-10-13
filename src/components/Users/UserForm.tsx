import React, { useState, useEffect } from 'react';
import { User } from '../../types';

// This type defines the data shape for the form, which can be a subset of the full User model.
export type UserFormData = Partial<Pick<User, 'fullName' | 'username' | 'email' | 'role' | 'password'>>;

interface UserFormProps {
  user?: User | null;
  onSave: (user: UserFormData) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState<UserFormData>({
    fullName: '',
    username: '',
    email: '',
    role: 'user', // Default role for new users
    password: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        password: '', // Password field is cleared for editing for security
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    // When updating, if the password field is empty, don't send it in the payload.
    if (user && !dataToSave.password) {
      delete dataToSave.password;
    }
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">{user ? 'Edit User' : 'Add New User'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{user ? 'New Password (optional)' : 'Password'}</label>
            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required={!user} />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="user">Warga</option>
              <option value="admin_user">Admin Wilayah</option>
              <option value="admin">Petugas</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="flex items-center justify-end pt-4">
            <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded mr-2 transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;