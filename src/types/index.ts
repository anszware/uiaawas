export interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'admin_user' | 'user';
  gender?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: number;
  userId: number;
  name: string;
  address: string;
  lang: string;
  long: string;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: number;
  nomor_seri: string;
  ip?: string;
  mac_address?: string;
  lang?: number;
  long?: number;
  locationId?: number;
  Location?: Location;
  isActive: boolean;
  last_seen: string;
}

// Shared Notification type from API
export interface ApiNotification {
  id: number;
  locationId: number;
  message: string;
  status: 'read' | 'unread';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSuperAdmin {
  totalActiveProducts: number;
  totalLocations: number;
  activeProductLocations: Array<{
    deviceId: number;
    deviceName: string;
    lat: string;
    lng: string;
    locationName: string;
  }>;
}

// Type for Admin User Dashboard API Response
export interface ProductLocation {
  deviceName: string;
  lat: string;
  lng: string;
  locationName: string;
}

export interface AdminDashboardData {
  hasLocation: boolean;
  locationLang: number;
  locationLong: number;
  totalActiveProducts?: number;
  totalInactiveProducts?: number;
  productLocations?: ProductLocation[];
  averageTemp?: number;
  averageHumidity?: number;
  carbonChartData?: number[];
  notifications?: ApiNotification[];
}

// Type for Regular User Dashboard API Response
export interface NearestDevice {
  deviceName: string;
  distanceKm: number;
  averageTemp: number;
  averageHumidity: number;
  carbonChartData: number[];
}

export interface UserDashboardData {
  nearestDevice: NearestDevice;
  notifications: ApiNotification[];
}
