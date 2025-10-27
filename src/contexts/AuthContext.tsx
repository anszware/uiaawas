import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI, socket } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Langsung baca token dari localStorage untuk memastikan nilainya tersedia saat inisialisasi
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Verifikasi token dan ambil profil terbaru dari API
          const profileResponse = await authAPI.getProfile();
          const fullUser: User = profileResponse.data.user;
          setUser(fullUser);
          // Connect socket
          if (!socket.connected) {
            socket.connect();
          }
          localStorage.setItem('user', JSON.stringify(fullUser));
        } catch (err) {
          console.error("Failed to fetch user profile with stored token, logging out.", err);
          // Token tidak valid atau terjadi error lain, bersihkan state dan localStorage
          logout(); // Fungsi logout akan membersihkan state, localStorage, dan socket
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listener untuk event koneksi socket
    const onConnect = () => {
      console.log('Socket.IO connected:', socket.id);
      // Setelah terhubung, periksa apakah ada user dan kirim event 'join'
      // Menggunakan callback pada setUser untuk mendapatkan state user terbaru
      setUser(currentUser => {
        if (currentUser) {
          socket.emit('join', currentUser.id);
        }
        return currentUser;
      });
    };
    const onDisconnect = () => console.log('Socket.IO disconnected');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Cleanup function akan dijalankan saat AuthProvider di-unmount
    return () => socket.off('connect', onConnect).off('disconnect', onDisconnect);
  }, []); // Dependency array kosong agar ini hanya berjalan sekali saat aplikasi dimuat.

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);

      // Setelah login berhasil, sambungkan socket. Event 'join' akan di-handle oleh listener 'connect'.
      if (!socket.connected) {
        socket.connect();
      }
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      // Jika login gagal, pastikan loading di-set false
      setIsLoading(false);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };
  // Kita tidak perlu mengubah useEffect karena alur inisialisasi saat refresh halaman sudah benar.
  // Perubahan ini fokus pada alur saat pengguna aktif melakukan login.

  const logout = () => {
    if (socket.connected) {
      socket.disconnect();
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}