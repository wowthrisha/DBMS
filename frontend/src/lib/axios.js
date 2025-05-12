import axios from "axios";

const instance = axios.create({
	baseURL: "http://localhost:5000/api",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 5000, // 5 second timeout
});

// To prevent race conditions during token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

instance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Don't refresh for static resources or non-401 errors
		if (error.response?.status !== 401 || originalRequest._retry || originalRequest.url.includes("/auth/refresh-token")) {
			// Handle network errors gracefully
			if (!error.response) {
				console.error("Network error:", error.message);
				return Promise.reject(error);
			}
			return Promise.reject(error);
		}

		originalRequest._retry = true;

		if (isRefreshing) {
			// If already refreshing, queue the request
			return new Promise((resolve, reject) => {
				failedQueue.push({ resolve, reject });
			})
				.then(() => instance(originalRequest))
				.catch((err) => Promise.reject(err));
		}

		isRefreshing = true;

		try {
			await instance.post("/auth/refresh-token");
			processQueue(null); // Retry queued requests
			return instance(originalRequest);
		} catch (refreshError) {
			processQueue(refreshError, null);
			console.error("Refresh token failed:", refreshError);
			// Only redirect to login if it's an authentication error
			if (refreshError.response?.status === 401) {
				window.location.href = "/login";
			}
			return Promise.reject(refreshError);
		} finally {
			isRefreshing = false;
		}
	}
);

export default instance;
