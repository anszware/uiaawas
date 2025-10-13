import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  MapPinIcon,
  CpuChipIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    roles: ['super_admin', 'admin', 'admin_user', 'user']
  },
  {
    name: 'Management User',
    href: '/users',
    icon: UsersIcon,
    roles: ['super_admin', 'admin']
  },
  {
    name: 'Management Lokasi',
    href: '/locations',
    icon: MapPinIcon,
    roles: ['super_admin']
  },
  {
    name: 'Management Device',
    href: '/devices',
    icon: CpuChipIcon,
    roles: ['super_admin', 'admin', 'admin_user']
  },
  // {
  //   name: 'Tambah Lokasi',
  //   href: '/add-location',
  //   icon: MapPinIcon,
  //   roles: ['admin_user']
  // },
  {
    name: 'Data Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    roles: ['super_admin', 'admin']
  }
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  const filteredMenuItems = menuItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity md:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out
        md:relative md:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Menu
          </h2>
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => window.innerWidth < 768 && onClose()}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${active
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-r-2 border-blue-500'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 transition-colors duration-200
                    ${active 
                      ? 'text-blue-500' 
                      : 'text-gray-400 group-hover:text-gray-500'
                    }
                  `} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info at bottom */}
        {/* Show user info only on mobile (md:hidden) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 md:hidden">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {user?.fullName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}