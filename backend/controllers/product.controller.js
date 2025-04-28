import Product from "../models/product.model.js";
import client from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ products });
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await client.get('featured_products');
        if (featuredProducts) {
            return res.json({ products: JSON.parse(featuredProducts) });
        }

        // Fetch from MongoDB if not in Redis
        featuredProducts = await Product.find({ isFeatured: true }).lean();
        if (featuredProducts.length === 0) {
            return res.json({ products: [] });
        }

        // Save to Redis
        await client.set('featured_products', JSON.stringify(featuredProducts));
        res.json({ products: featuredProducts });
    } catch (error) {
        res.status(500).json({ message: "Error fetching featured products", error: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category, countInStock } = req.body;
        let cloudinaryResponse = null;

        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image);
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url,
            category,
            countInStock,
        });

        res.status(201).json({ product });
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error: error.message });
    }
};
export const deleteProduct = async (req, res) => {
    try {
        const product=await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({message:"Product not found"});
        }
        if(product.image){
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);

            } catch (error) {
                console.log("Error deleting image from Cloudinary:", error.message);
            }
    } await product.findByIdAndDelete(req.params.id);
    res.json({message:"Product deleted successfully"});
    }
    
    catch (error) {
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
}
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
        if(product){
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache();
            res.json({ product: updatedProduct });
        }
        else{
            res.status(404).json({message:"Product not found"});
        }
        
    } catch (error) {
        res.status(500).json({ message: "Error toggling featured status", error: error.message });
    }
}                             
async function updateFeaturedProductsCache() {
    try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await client.set('featured_products', JSON.stringify(featuredProducts));
}
catch (error) {
    console.error("Error updating featured products cache:", error.message);
}
}