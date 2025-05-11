import Product from "../models/product.model.js";
import { withRedis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .select("name price image description category featured countInStock")
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error("Error in getAllProducts:", error);
        res.status(500).json({ message: "Error fetching products" });
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        // Try to get from Redis first
        let cachedProducts = null;
        await withRedis(async (redis) => {
            if (redis) {
                cachedProducts = await redis.get('featured_products');
            }
        });

        if (cachedProducts) {
            return res.json(JSON.parse(cachedProducts));
        }

        // If not in Redis or Redis fails, get from MongoDB
        const featuredProducts = await Product.find({ featured: true })
            .select("name price image description category featured countInStock")
            .limit(8)
            .lean();

        // Try to cache the results, but don't fail if caching fails
        await withRedis(async (redis) => {
            if (redis) {
                try {
                    await redis.set('featured_products', JSON.stringify(featuredProducts), 'EX', 3600);
                } catch (cacheError) {
                    console.error("Error caching featured products:", cacheError.message);
                }
            }
        });

        res.json(featuredProducts);
    } catch (error) {
        console.error("Error fetching featured products:", error);
        // If MongoDB query fails, return an empty array instead of 500 error
        res.json([]);
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const image = req.file;

        if (!image) {
            return res.status(400).json({ message: "Image is required" });
        }

        // Check image size (5MB limit)
        if (image.size > 5 * 1024 * 1024) {
            return res.status(400).json({ message: "Image size should be less than 5MB" });
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(image.path, {
            folder: "products",
            resource_type: "auto",
        });

        // Create product
        const product = await Product.create({
            name,
            description,
            price,
            category,
            stock,
            image: result.secure_url,
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Error in createProduct:", error);
        res.status(500).json({ message: "Error creating product" });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Delete image from Cloudinary if it exists
        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
            } catch (error) {
                console.error("Error deleting image from Cloudinary:", error.message);
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error in deleteProduct:", error);
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
};

export const getProductsByCategory = async (req, res) => {
    const{category}=req.params;
    try {
        
        const products=await Product.find({category});
        res.json({products});
    } catch (error) {
        res.status(500).json({ message: "Error fetching products by category", error: error.message });
        
    }
};

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.featured = !product.featured;
        await product.save();

        // Update Redis cache
        await updateFeaturedProductsCache();

        res.json({
            message: `Product ${product.featured ? 'marked as' : 'removed from'} featured`,
            product
        });
    } catch (error) {
        console.error("Error toggling featured status:", error);
        res.status(500).json({ message: "Error updating featured status" });
    }
};

async function updateFeaturedProductsCache() {
    try {
        const featuredProducts = await Product.find({ featured: true })
            .select("name price image description category featured countInStock")
            .limit(8)
            .lean();
        
        await withRedis(async (redis) => {
            if (redis) {
                await redis.set('featured_products', JSON.stringify(featuredProducts), 'EX', 3600);
            }
        });
    } catch (error) {
        console.error("Error updating featured products cache:", error.message);
    }
}

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .select("name price images description category stock");
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.json(product);
    } catch (error) {
        console.error("Error in getProductById:", error);
        res.status(500).json({ message: "Error fetching product" });
    }
};

export const getRecommendations = async (req, res) => {
    try {
        // Get random products for recommendations
        const recommendations = await Product.aggregate([
            { $sample: { size: 4 } }, // Get 4 random products
            { $project: { name: 1, price: 1, image: 1, description: 1, category: 1 } }
        ]);
        
        res.json(recommendations);
    } catch (error) {
        console.error("Error in getRecommendations:", error);
        res.status(500).json({ message: "Error fetching recommendations" });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { countInStock } = req.body;

        if (countInStock < 0) {
            return res.status(400).json({ message: "Quantity cannot be negative" });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { countInStock },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        console.error("Error updating product quantity:", error);
        res.status(500).json({ message: "Error updating product quantity" });
    }
};