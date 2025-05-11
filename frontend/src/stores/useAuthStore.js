import { create } from 'zustand';
import axios from '../lib/axios';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    isLoading: false,
    error: null,

    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
    },
    
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('/auth/login', { email, password });
            const userData = response.data;
            localStorage.setItem('user', JSON.stringify(userData));
            set({ user: userData, isLoading: false });
            return userData;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await axios.post('/auth/logout');
            localStorage.removeItem('user');
            set({ user: null, error: null });
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear the user state even if the server request fails
            localStorage.removeItem('user');
            set({ user: null, error: null });
        }
    },

    checkAuth: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get('/auth/profile');
            const userData = response.data;
            localStorage.setItem('user', JSON.stringify(userData));
            set({ user: userData, isLoading: false });
        } catch (error) {
            if (error.response?.status === 401) {
                // Try to refresh the token
                try {
                    await axios.post('/auth/refresh-token');
                    // Retry the profile request
                    const retryResponse = await axios.get('/auth/profile');
                    const userData = retryResponse.data;
                    localStorage.setItem('user', JSON.stringify(userData));
                    set({ user: userData, isLoading: false });
                } catch (refreshError) {
                    localStorage.removeItem('user');
                    set({ user: null, isLoading: false });
                }
            } else {
                localStorage.removeItem('user');
                set({ user: null, isLoading: false });
            }
        }
    }
}));

export default useAuthStore; 