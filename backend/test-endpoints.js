import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let adminToken = '';

const testEndpoints = async () => {
    try {
        console.log('Testing endpoints...\n');

        // 1. Test Authentication
        console.log('1. Testing Authentication Endpoints:');
        
        // Signup
        try {
            const signupResponse = await axios.post(`${API_URL}/auth/signup`, {
                name: 'Test User',
                email: 'test@example.com',
                password: 'test123'
            });
            console.log('✓ Signup successful');
        } catch (error) {
            console.log('✗ Signup failed:', error.response?.data?.message || error.message);
        }

        // Login
        try {
            const loginResponse = await axios.post(`${API_URL}/auth/login`, {
                email: 'test@example.com',
                password: 'test123'
            });
            authToken = loginResponse.data.token;
            console.log('✓ Login successful');
        } catch (error) {
            console.log('✗ Login failed:', error.response?.data?.message || error.message);
        }

        // Admin Login
        try {
            const adminLoginResponse = await axios.post(`${API_URL}/auth/login`, {
                email: 'admin@example.com',
                password: 'admin123'
            });
            adminToken = adminLoginResponse.data.token;
            console.log('✓ Admin login successful');
        } catch (error) {
            console.log('✗ Admin login failed:', error.response?.data?.message || error.message);
        }

        // Get Profile
        try {
            const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✓ Get profile successful');
        } catch (error) {
            console.log('✗ Get profile failed:', error.response?.data?.message || error.message);
        }

        // 2. Test Product Endpoints
        console.log('\n2. Testing Product Endpoints:');
        
        // Get all products
        try {
            const productsResponse = await axios.get(`${API_URL}/products`);
            console.log('✓ Get all products successful');
        } catch (error) {
            console.log('✗ Get all products failed:', error.response?.data?.message || error.message);
        }

        // Get featured products
        try {
            const featuredResponse = await axios.get(`${API_URL}/products/featured`);
            console.log('✓ Get featured products successful');
        } catch (error) {
            console.log('✗ Get featured products failed:', error.response?.data?.message || error.message);
        }

        // Create product (admin)
        try {
            const createProductResponse = await axios.post(`${API_URL}/products`, {
                name: 'Test Product',
                description: 'Test Description',
                price: 99.99,
                category: 'test',
                stock: 10
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('✓ Create product successful');
        } catch (error) {
            console.log('✗ Create product failed:', error.response?.data?.message || error.message);
        }

        // 3. Test Cart Endpoints
        console.log('\n3. Testing Cart Endpoints:');
        
        // Get cart
        try {
            const cartResponse = await axios.get(`${API_URL}/cart`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✓ Get cart successful');
        } catch (error) {
            console.log('✗ Get cart failed:', error.response?.data?.message || error.message);
        }

        // Add to cart
        try {
            const addToCartResponse = await axios.post(`${API_URL}/cart`, {
                productId: 'test-product-id',
                quantity: 1
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✓ Add to cart successful');
        } catch (error) {
            console.log('✗ Add to cart failed:', error.response?.data?.message || error.message);
        }

        // 4. Test Order Endpoints
        console.log('\n4. Testing Order Endpoints:');
        
        // Create order
        try {
            const createOrderResponse = await axios.post(`${API_URL}/orders`, {
                products: [{ product: 'test-product-id', quantity: 1 }],
                totalAmount: 99.99
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✓ Create order successful');
        } catch (error) {
            console.log('✗ Create order failed:', error.response?.data?.message || error.message);
        }

        // Get user orders
        try {
            const userOrdersResponse = await axios.get(`${API_URL}/orders/my-orders`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✓ Get user orders successful');
        } catch (error) {
            console.log('✗ Get user orders failed:', error.response?.data?.message || error.message);
        }

        // 5. Test Analytics Endpoints
        console.log('\n5. Testing Analytics Endpoints:');
        
        // Get analytics
        try {
            const analyticsResponse = await axios.get(`${API_URL}/analytics`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('✓ Get analytics successful');
        } catch (error) {
            console.log('✗ Get analytics failed:', error.response?.data?.message || error.message);
        }

        // Get daily sales
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            const endDate = new Date();
            
            const dailySalesResponse = await axios.get(`${API_URL}/analytics/daily-sales`, {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                },
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('✓ Get daily sales successful');
        } catch (error) {
            console.log('✗ Get daily sales failed:', error.response?.data?.message || error.message);
        }

        console.log('\nAll tests completed!');

    } catch (error) {
        console.error('Test failed:', error);
    }
};

testEndpoints(); 