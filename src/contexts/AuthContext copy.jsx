// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Buat Context
const AuthContext = createContext(null);

// Definisikan kunci untuk menyimpan token di localStorage
const TOKEN_KEY = 'accessToken';

// Base URL for API calls. Pastikan ini sesuai dengan setup environment Anda.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Fallback jika tidak ada env var

// Buat Provider untuk membungkus komponen yang membutuhkan akses ke AuthContext
export const AuthProvider = ({ children }) => {
  // State untuk menyimpan token otentikasi
  const [token, setToken] = useState(null);
  // State untuk melacak apakah pengguna terotentikasi
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State untuk indikator loading saat login
  const [isLoading, setIsLoading] = useState(false);
  // State untuk menyimpan pesan error
  const [error, setError] = useState(null);

  // Efek untuk memeriksa token di localStorage saat komponen pertama kali dimuat
  useEffect(() => {
    ("AuthContext diinisialisasi.");
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      ("Token ditemukan di localStorage, pengguna terotentikasi.");
    } else {
      setIsAuthenticated(false);
      ("Tidak ada token di localStorage, pengguna tidak terotentikasi.");
    }
  }, []);

  // Fungsi untuk mendapatkan token saat ini
  const getAccessToken = useCallback(() => {
    return token;
  }, [token]);

  // Fungsi login yang sebenarnya
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null); // Bersihkan error sebelumnya
    try {
      const response = await fetch(`${BASE_URL}auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.data && data.data.access_token) {
          const newAccessToken = data.data.access_token;
          localStorage.setItem(TOKEN_KEY, newAccessToken); // Simpan token di localStorage
          setToken(newAccessToken);
          setIsAuthenticated(true);
          ("Login berhasil! Token:", newAccessToken);
          return true; // Login berhasil
        } else {
          // Jika respons OK tapi tidak ada access_token
          const errorMessage = data.message || "Login berhasil tapi token tidak ditemukan.";
          setError(errorMessage);
          console.error("Login Error:", errorMessage);
          return false;
        }
      } else {
        // Jika respons tidak OK (misal: 401 Unauthorized)
        const errorMessage = data.message || "Email atau password salah.";
        setError(errorMessage);
        console.error("Login Gagal:", errorMessage);
        return false; // Login gagal
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan atau server.");
      console.error("Kesalahan saat login:", err);
      return false; // Login gagal karena error
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi logout
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY); // Hapus token dari localStorage
    setToken(null);
    setIsAuthenticated(false);
    ("Logout. Token dihapus.");
  };

  // Sediakan nilai context kepada children
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, getAccessToken, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook kustom untuk memudahkan penggunaan AuthContext
export const useAuth = () => useContext(AuthContext);

