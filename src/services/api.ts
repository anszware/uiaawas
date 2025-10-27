import axios from 'axios';
import { io } from 'socket.io-client';
import { User, Location, Device, ApiNotification, DashboardSuperAdmin, AdminDashboardData, UserDashboardData } from '../types';

const API_BASE_URL = 'https://iot.vcompcenter.com/api';
const SOCKET_URL = 'https://iot.vcompcenter.com/';
// const API_BASE_URL = 'http://192.168.137.1:5051/api';
// const SOCKET_URL = 'http://192.168.137.1:5051';

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Sebaiknya koneksi dilakukan secara manual saat dibutuhkan
});

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role?: string;
    gender?: string;
    phone?: string;
    address?: string;
  }) => api.post('/auth/register', userData),

  getProfile: () => api.get<User>('/auth/profile'),

  updateProfile: (data: { fullName?: string; password?: string }) =>
    api.put<User>('/auth/profile', data),
};

export const dashboardAPI = {
  getSuperAdminDashboardData: () => api.get<DashboardSuperAdmin>('/dashboard/superadmin'),
  getAdminDashboardData: () => api.get<AdminDashboardData>('/dashboard/admin'),
  getUserDashboardData: (lat: number, lon: number) => 
    api.get<UserDashboardData>(`/dashboard/user?lat=${lat}&lon=${lon}`),
};

export const usersAPI = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post('/users', userData),
  update: (id: number, userData: Partial<User>) =>
    api.put(`/users/${id}`, userData),
  delete: (id: number) => api.delete(`/users/${id}`),
};

export const locationsAPI = {
  getLocMember: (userId: number) => api.get<Location[]>(`/locations/user/${userId}`),
  getAll: () => api.get<Location[]>('/locations'),
  getById: (id: number) => api.get<Location>(`/locations/${id}`),
  create: (locationData: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post('/locations/user', locationData),
  update: (id: number, locationData: Partial<Location>) =>
    api.put(`/locations/${id}`, locationData),
  delete: (id: number) => api.delete(`/locations/${id}`),
};

export const devicesAPI = {
  getAll: () => api.get<Device[]>('/devices'),
  getLoc: (locationId: number) => api.get<Device[]>(`/devices/location/${locationId}`),
  getById: (id: number) => api.get<Device>(`/devices/${id}`),
  getMap: () => api.get<Device[]>('/devices/map'),
  create: (deviceData: Omit<Device, 'id' | 'isActive' | 'last_seen'>) =>
    api.post('/devices', deviceData),
  update: (id: number, deviceData: Partial<Device>) =>
    api.put(`/devices/${id}`, deviceData),
  delete: (id: number) => api.delete(`/devices/${id}`),
};

export const notificationsAPI = {
  getAll: () => api.get<ApiNotification[]>('/notifications'),
  getUnread: () => api.get<ApiNotification[]>('/notifications/unread'),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id: number) => api.delete(`/notifications/${id}`),
};

export default api;