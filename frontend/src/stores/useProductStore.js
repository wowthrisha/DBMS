import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set, get) => ({
	products: [],
	featuredProducts: [],
	loading: false,
	error: null,

	setProducts: (products) => set({ products }),
	createProduct: async (productData) => {
		set({ loading: true, error: null });
		try {
			const res = await axios.post("/products", productData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			if (res.data) {
				const currentProducts = get().products || [];
				set({
					products: [...currentProducts, res.data],
					loading: false,
					error: null
				});
				toast.success("Product created successfully!");
				return res.data;
			} else {
				throw new Error("Invalid response format from server");
			}
		} catch (error) {
			console.error("Error creating product:", error);
			toast.error(error.response?.data?.message || "Error creating product");
			set({ loading: false, error: error.message });
			throw error;
		}
	},
	deleteProduct: async (productId) => {
		set({ loading: true, error: null });
		try {
			await axios.delete(`/products/${productId}`);
			set((state) => ({
				products: state.products.filter((product) => product._id !== productId),
				loading: false,
				error: null
			}));
			toast.success("Product deleted successfully");
		} catch (error) {
			console.error("Error deleting product:", error);
			toast.error(error.response?.data?.message || "Error deleting product");
			set({ loading: false, error: error.message });
		}
	},
	toggleFeaturedProduct: async (productId) => {
		set({ loading: true, error: null });
		try {
			const response = await axios.patch(`/products/${productId}/featured`);
			set((state) => ({
				products: state.products.map((product) =>
					product._id === productId ? { ...product, featured: response.data.product.featured } : product
				),
				loading: false,
				error: null
			}));
			await get().fetchFeaturedProducts();
			toast.success(response.data.message || "Product featured status updated");
		} catch (error) {
			console.error("Error toggling featured status:", error);
			toast.error(error.response?.data?.message || "Error updating featured status");
			set({ loading: false, error: error.message });
		}
	},
	fetchAllProducts: async () => {
		set({ loading: true, error: null });
		try {
			const response = await axios.get("/products");
			if (response.data && Array.isArray(response.data)) {
				set({ 
					products: response.data,
					loading: false,
					error: null 
				});
			} else {
				throw new Error("Invalid response format");
			}
		} catch (error) {
			console.error("Error fetching products:", error);
			set({ 
				error: "Failed to fetch products", 
				loading: false 
			});
			toast.error(error.response?.data?.message || "Failed to fetch products");
		}
	},
	fetchProductsByCategory: async (category) => {
		set({ loading: true });
		try {
			const response = await axios.get(`/products/category/${category}`);
			set({ products: response.data.products, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
	},
	fetchFeaturedProducts: async () => {
		set({ loading: true, error: null });
		try {
			const response = await axios.get("/products/featured");
			if (response.data && Array.isArray(response.data)) {
				set({ 
					featuredProducts: response.data,
					loading: false,
					error: null 
				});
			} else {
				throw new Error("Invalid response format");
			}
		} catch (error) {
			console.error("Error fetching featured products:", error);
			set({ 
				error: "Failed to fetch featured products", 
				loading: false 
			});
			toast.error(error.response?.data?.message || "Failed to fetch featured products");
		}
	},
	updateProductQuantity: async (productId, newQuantity) => {
		set({ loading: true, error: null });
		try {
			const response = await axios.patch(`/products/${productId}/quantity`, { countInStock: newQuantity });
			set((state) => ({
				products: state.products.map((product) =>
					product._id === productId ? { ...product, countInStock: newQuantity } : product
				),
				loading: false,
				error: null
			}));
			toast.success("Product quantity updated successfully");
		} catch (error) {
			console.error("Error updating product quantity:", error);
			toast.error(error.response?.data?.message || "Error updating product quantity");
			set({ loading: false, error: error.message });
		}
	},
}));