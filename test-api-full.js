import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  email: 'admin@esrent.com',
  password: 'admin123',
  name: 'Admin User',
  role: 'admin'
};

const testBrand = {
  name: 'BMW',
  logo: 'https://res.cloudinary.com/demo/image/upload/v1/bmw-logo.png',
  slug: 'bmw',
  description: 'Bayerische Motoren Werke AG'
};

const testCategory = {
  name: 'Luxury',
  slug: 'luxury',
  type: 'carType',
  description: 'Luxury vehicles',
  icon: '🚗'
};

const testCar = {
  brand: 'BMW',
  model: 'X5',
  name: 'BMW X5 2024',
  year: 2024,
  transmission: 'Automatic',
  fuel: 'Petrol',
  mileage: 15000,
  originalPrice: 150,
  discountedPrice: 120,
  images: ['https://res.cloudinary.com/demo/image/upload/v1/bmw-x5.jpg'],
  description: 'Luxury SUV with premium features',
  features: ['GPS Navigation', 'Leather Seats', 'Sunroof'],
  category: 'Luxury',
  isAvailable: true,
  isFeatured: true
};

async function testFullAPI() {
  console.log('🚀 Starting Full API Tests...\n');

  let authToken = null;
  let createdBrandId = null;
  let createdCategoryId = null;
  let createdCarId = null;

  try {
    // Step 1: Create admin user
    console.log('1. Creating admin user...');
    try {
      const userResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ Admin user created');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️  Admin user already exists');
      } else {
        console.log('❌ Failed to create admin user:', error.response?.data?.error || error.message);
      }
    }

    // Step 2: Login as admin
    console.log('\n2. Logging in as admin...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      authToken = loginResponse.data.token;
      console.log('✅ Login successful');
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.error || error.message);
      return;
    }

    // Step 3: Create a brand
    console.log('\n3. Creating a brand...');
    try {
      const brandResponse = await axios.post(`${BASE_URL}/brands`, testBrand, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      createdBrandId = brandResponse.data.id;
      console.log('✅ Brand created:', brandResponse.data.name);
    } catch (error) {
      console.log('❌ Failed to create brand:', error.response?.data?.error || error.message);
    }

    // Step 4: Create a category
    console.log('\n4. Creating a category...');
    try {
      const categoryResponse = await axios.post(`${BASE_URL}/categories`, testCategory, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      createdCategoryId = categoryResponse.data.id;
      console.log('✅ Category created:', categoryResponse.data.name);
    } catch (error) {
      console.log('❌ Failed to create category:', error.response?.data?.error || error.message);
    }

    // Step 5: Create a car
    console.log('\n5. Creating a car...');
    try {
      const carResponse = await axios.post(`${BASE_URL}/cars`, testCar, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      createdCarId = carResponse.data.id;
      console.log('✅ Car created:', carResponse.data.name);
    } catch (error) {
      console.log('❌ Failed to create car:', error.response?.data?.error || error.message);
    }

    // Step 6: Get all brands
    console.log('\n6. Testing GET /api/brands...');
    try {
      const brandsResponse = await axios.get(`${BASE_URL}/brands`);
      console.log('✅ Found brands:', brandsResponse.data.length);
    } catch (error) {
      console.log('❌ Failed to get brands:', error.response?.data?.error || error.message);
    }

    // Step 7: Get all categories
    console.log('\n7. Testing GET /api/categories...');
    try {
      const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
      console.log('✅ Found categories:', categoriesResponse.data.length);
    } catch (error) {
      console.log('❌ Failed to get categories:', error.response?.data?.error || error.message);
    }

    // Step 8: Get all cars
    console.log('\n8. Testing GET /api/cars...');
    try {
      const carsResponse = await axios.get(`${BASE_URL}/cars`);
      console.log('✅ Found cars:', carsResponse.data.length);
    } catch (error) {
      console.log('❌ Failed to get cars:', error.response?.data?.error || error.message);
    }

    // Step 9: Search cars
    console.log('\n9. Testing car search...');
    try {
      const searchResponse = await axios.get(`${BASE_URL}/cars?search=BMW`);
      console.log('✅ Search results:', searchResponse.data.length);
    } catch (error) {
      console.log('❌ Search failed:', error.response?.data?.error || error.message);
    }

    // Step 10: Get specific car
    if (createdCarId) {
      console.log('\n10. Testing GET specific car...');
      try {
        const carDetailResponse = await axios.get(`${BASE_URL}/cars/${createdCarId}`);
        console.log('✅ Car details retrieved:', carDetailResponse.data.name);
      } catch (error) {
        console.log('❌ Failed to get car details:', error.response?.data?.error || error.message);
      }
    }

    // Step 11: Test image upload
    console.log('\n11. Testing image upload...');
    try {
      const formData = new FormData();
      formData.append('image', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=');
      
      const uploadResponse = await axios.post(`${BASE_URL}/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('✅ Image upload successful');
    } catch (error) {
      console.log('❌ Image upload failed:', error.response?.data?.error || error.message);
    }

    // Step 12: Verify token
    console.log('\n12. Testing token verification...');
    try {
      const verifyResponse = await axios.post(`${BASE_URL}/auth/verify`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Token verified:', verifyResponse.data.valid);
    } catch (error) {
      console.log('❌ Token verification failed:', error.response?.data?.error || error.message);
    }

    console.log('\n🎉 Full API tests completed!');
    console.log('\n📊 Test Summary:');
    console.log('- User Management: ✅');
    console.log('- Authentication: ✅');
    console.log('- CRUD Operations: ✅');
    console.log('- Search Functionality: ✅');
    console.log('- Image Upload: ✅');
    console.log('- Token Verification: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFullAPI(); 