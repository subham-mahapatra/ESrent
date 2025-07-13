import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function testAPISimple() {
  console.log('🚀 Starting Simple API Tests...\n');

  try {
    // Test 1: Test GET brands endpoint (should work without auth)
    console.log('1. Testing GET /api/brands...');
    try {
      const brandsResponse = await axios.get(`${BASE_URL}/brands`);
      console.log('✅ GET /api/brands - Status:', brandsResponse.status);
    } catch (error) {
      console.log('❌ GET /api/brands failed:', error.response?.status, error.response?.data?.error || error.message);
    }

    // Test 2: Test GET categories endpoint (should work without auth)
    console.log('\n2. Testing GET /api/categories...');
    try {
      const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
      console.log('✅ GET /api/categories - Status:', categoriesResponse.status);
    } catch (error) {
      console.log('❌ GET /api/categories failed:', error.response?.status, error.response?.data?.error || error.message);
    }

    // Test 3: Test GET cars endpoint (should work without auth)
    console.log('\n3. Testing GET /api/cars...');
    try {
      const carsResponse = await axios.get(`${BASE_URL}/cars`);
      console.log('✅ GET /api/cars - Status:', carsResponse.status);
    } catch (error) {
      console.log('❌ GET /api/cars failed:', error.response?.status, error.response?.data?.error || error.message);
    }

    // Test 4: Test POST brands endpoint (should require auth)
    console.log('\n4. Testing POST /api/brands (should require auth)...');
    try {
      const postBrandResponse = await axios.post(`${BASE_URL}/brands`, {
        name: 'Test Brand',
        logo: 'test-logo.png',
        slug: 'test-brand'
      });
      console.log('❌ POST /api/brands should have failed with auth error');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ POST /api/brands correctly requires authentication');
      } else {
        console.log('❌ POST /api/brands failed with unexpected error:', error.response?.status, error.response?.data?.error || error.message);
      }
    }

    // Test 5: Test POST categories endpoint (should require auth)
    console.log('\n5. Testing POST /api/categories (should require auth)...');
    try {
      const postCategoryResponse = await axios.post(`${BASE_URL}/categories`, {
        name: 'Test Category',
        description: 'Test category',
        icon: '🚗'
      });
      console.log('❌ POST /api/categories should have failed with auth error');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ POST /api/categories correctly requires authentication');
      } else {
        console.log('❌ POST /api/categories failed with unexpected error:', error.response?.status, error.response?.data?.error || error.message);
      }
    }

    // Test 6: Test POST cars endpoint (should require auth)
    console.log('\n6. Testing POST /api/cars (should require auth)...');
    try {
      const postCarResponse = await axios.post(`${BASE_URL}/cars`, {
        brand: 'Test Brand',
        model: 'Test Model',
        year: 2024,
        price: 50000
      });
      console.log('❌ POST /api/cars should have failed with auth error');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ POST /api/cars correctly requires authentication');
      } else {
        console.log('❌ POST /api/cars failed with unexpected error:', error.response?.status, error.response?.data?.error || error.message);
      }
    }

    // Test 7: Test auth endpoints
    console.log('\n7. Testing POST /api/auth/login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@test.com',
        password: 'admin123'
      });
      console.log('❌ Login should have failed (no user exists)');
    } catch (error) {
      console.log('✅ Login correctly failed (expected):', error.response?.status, error.response?.data?.error || error.message);
    }

    console.log('\n🎉 Simple API tests completed!');
    console.log('\n📊 Test Summary:');
    console.log('- GET endpoints should work without auth');
    console.log('- POST endpoints should require auth');
    console.log('- Auth endpoints should handle missing users');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAPISimple(); 