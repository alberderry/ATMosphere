import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Buat Context
const AuthContext = createContext(null);

// Definisikan kunci untuk localStorage
const TOKEN_KEY = 'accessToken';
const USER_ID_KEY = 'userId';
const USER_PROFILE_DATA_KEY = 'userProfileData'; 

// Base URL for API calls. Pastikan ini sesuai dengan setup environment Anda.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Fallback jika tidak ada env var

// Buat Provider untuk membungkus komponen yang membutuhkan akses ke AuthContext
export const AuthProvider = ({ children }) => {
    // State untuk menyimpan token otentikasi
    const [token, setToken] = useState(null);
    // State untuk menyimpan ID pengguna
    const [userId, setUserId] = useState(null);
    // State baru untuk menyimpan data profil pengguna
    const [userProfile, setUserProfile] = useState(null);
    // State untuk melacak apakah pengguna terotentikasi
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // State untuk indikator loading saat inisialisasi atau login
    const [isLoading, setIsLoading] = useState(true); // Mulai dengan true karena akan memeriksa localStorage
    // State untuk menyimpan pesan error
    const [error, setError] = useState(null);

    // Efek untuk memuat status otentikasi dari localStorage saat aplikasi pertama kali dimuat
    useEffect(() => {
        const loadAuthData = async () => {
            setIsLoading(true);
            try {
                const storedToken = localStorage.getItem(TOKEN_KEY);
                const storedUserId = localStorage.getItem(USER_ID_KEY);
                const storedUserProfileData = localStorage.getItem(USER_PROFILE_DATA_KEY);

                if (storedToken) {
                    setToken(storedToken);
                    setIsAuthenticated(true); // Asumsikan valid untuk sementara
                    
                    if (storedUserId) {
                        setUserId(storedUserId);
                    }

                    if (storedUserProfileData) {
                        try {
                            const parsedProfile = JSON.parse(storedUserProfileData);
                            setUserProfile(parsedProfile);
                        } catch (e) {
                            console.error("Gagal parse user profile dari localStorage", e);
                            localStorage.removeItem(USER_PROFILE_DATA_KEY); // Hapus data yang rusak
                        }
                    }

                    // Opsional: Validasi token dengan memanggil fetchUserProfile
                    const profileFetched = await fetchUserProfile(storedToken);
                    if (!profileFetched) {
                        console.warn("Token dari localStorage tidak valid atau kedaluwarsa, membersihkan sesi.");
                        logout(); 
                    } else {
                        console.log("AuthContext: Data otentikasi dimuat dari localStorage dan divalidasi.");
                    }
                } else {
                    setIsAuthenticated(false);
                    console.log("AuthContext: Tidak ada token di localStorage, tidak terautentikasi.");
                }
            } catch (err) {
                console.error("AuthContext: Error saat memuat data otentikasi dari localStorage:", err);
                setError("Gagal memuat sesi sebelumnya.");
                logout(); 
            } finally {
                setIsLoading(false);
            }
        };

        loadAuthData();
    }, []); 

    const getAccessToken = useCallback(() => {
        return token;
    }, [token]);

    const getUserId = useCallback(() => {
        return userId;
    }, [userId]);

    const getUserProfile = useCallback(() => {
        return userProfile;
    }, [userProfile]);

    // Fungsi untuk mengambil data profil pengguna dari API
    const fetchUserProfile = async (accessToken) => {
        try {
            const response = await fetch(`${BASE_URL}/users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            const data = await response.json();

            if (response.ok && data.data) {
                setUserProfile(data.data);
                setUserId(data.data.id);
                localStorage.setItem(USER_PROFILE_DATA_KEY, JSON.stringify(data.data)); 
                localStorage.setItem(USER_ID_KEY, data.data.id); 

                console.log("Data profil pengguna berhasil dimuat dan disimpan:", data.data);
                return true;
            } else {
                console.error("Gagal memuat data profil pengguna:", data.message || "Unknown error");
                setError("Gagal memuat data profil pengguna.");
                return false;
            }
        } catch (err) {
            console.error("Kesalahan jaringan saat memuat profil pengguna:", err);
            setError("Terjadi kesalahan jaringan saat memuat profil pengguna.");
            return false;
        }
    };

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, { // Perbaikan: tambahkan "/" sebelum auth/login
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                let newAccessToken = null;

                if (data.access_token) {
                    newAccessToken = data.access_token;
                } else if (data.data && data.data.access_token) {
                    newAccessToken = data.data.access_token;
                }

                if (newAccessToken) {
                    setToken(newAccessToken);
                    setIsAuthenticated(true);
                    localStorage.setItem(TOKEN_KEY, newAccessToken);
                    console.log("Login berhasil! Token disimpan:", newAccessToken);

                    const profileFetched = await fetchUserProfile(newAccessToken);
                    if (!profileFetched) {
                        console.warn("Profil pengguna tidak dapat dimuat setelah login, mungkin ada masalah token.");
                        logout(); 
                        return false; 
                    }
                    return true;
                } else {
                    const errorMessage = "Respons API sukses tetapi tidak memiliki token otentikasi yang valid.";
                    setError(errorMessage);
                    console.error("Login Error: Struktur respons API tidak valid - token tidak ditemukan.", errorMessage);
                    return false;
                }
            } else {
                const errorMessage = data.message || "Email atau password salah.";
                setError(errorMessage);
                console.error("Login Gagal:", errorMessage);
                return false;
            }
        } catch (err) {
            setError("Terjadi kesalahan jaringan atau server.");
            console.error("Kesalahan saat login:", err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_ID_KEY);
        localStorage.removeItem(USER_PROFILE_DATA_KEY);

        setToken(null);
        setUserId(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        setError(null);
        setIsLoading(false);

        console.log("Logout. Token, User ID, dan data profil dihapus dari state dan localStorage.");
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, getAccessToken, getUserId, getUserProfile, isLoading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
