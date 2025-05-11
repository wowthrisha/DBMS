import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

let refreshPromise = null;

export const useUserStore = create((set, get) => ({
	user: null,
	loading: false,
	checkingAuth: false,

	signup: async ({ name, email, password, confirmPassword }) => {
		set({ loading: true });
		try {
		if (password !== confirmPassword) {
				throw new Error("Passwords do not match");
		}
			const res = await axios.post("/auth/signup", { name, email, password });
			set({ user: res.data, loading: false });
			toast.success("Account created successfully!");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || error.message || "An error occurred");
		}
	},

	login: async (email, password) => {
		set({ checkingAuth: true });
		try {
			const response = await axios.post("/auth/login", { email, password });
			set({ user: response.data, checkingAuth: false });
			toast.success("Logged in successfully!");
			return response.data;
		} catch (error) {
			set({ checkingAuth: false });
			throw error;
		}
	},

	logout: async () => {
		try {
			await axios.post("/auth/logout");
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			set({ user: null });
		}
	},

	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/auth/profile");
			set({ user: response.data, checkingAuth: false });
		} catch (error) {
			console.error("Auth check error:", error);
			set({ checkingAuth: false, user: null });
		}
	},

	refreshToken: async () => {
		if (get().checkingAuth) return;
		set({ checkingAuth: true });

		// If a refresh is already in progress, return that promise
		if (refreshPromise) {
			return refreshPromise;
		}

		try {
			refreshPromise = axios.post("/auth/refresh-token");
			const response = await refreshPromise;
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			console.error("Token refresh error:", error);
			set({ user: null, checkingAuth: false });
			throw error;
		} finally {
			refreshPromise = null;
		}
	}
}));

// Axios interceptor for token refresh
axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				await useUserStore.getState().refreshToken();
				return axios(originalRequest);
			} catch (refreshError) {
				useUserStore.getState().logout();
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);