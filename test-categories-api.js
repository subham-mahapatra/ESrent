// Test script to check categories API endpoints
async function testCategoriesAPI() {
  console.log('Testing Categories API...\n');

  try {
    // Test regular categories endpoint
    console.log('1. Testing /api/categories...');
    const regularResponse = await fetch('http://localhost:3000/api/categories');
    const regularData = await regularResponse.json();
    console.log('Regular categories response:', regularData);
    console.log('Categories count:', regularData.categories?.length || regularData.data?.length || 0);
    console.log('');

    // Test categories with car counts endpoint
    console.log('2. Testing /api/categories?withCarCounts=true...');
    const withCountsResponse = await fetch('http://localhost:3000/api/categories?withCarCounts=true');
    const withCountsData = await withCountsResponse.json();
    console.log('Categories with car counts response:', withCountsData);
    console.log('Categories count:', withCountsData.categories?.length || 0);
    console.log('');

    // Test categories by type
    console.log('3. Testing /api/categories?type=carType...');
    const carTypeResponse = await fetch('http://localhost:3000/api/categories?type=carType');
    const carTypeData = await carTypeResponse.json();
    console.log('Car type categories:', carTypeData);
    console.log('Car type count:', carTypeData.categories?.length || carTypeData.data?.length || 0);
    console.log('');

    console.log('4. Testing /api/categories?type=fuelType...');
    const fuelTypeResponse = await fetch('http://localhost:3000/api/categories?type=fuelType');
    const fuelTypeData = await fuelTypeResponse.json();
    console.log('Fuel type categories:', fuelTypeData);
    console.log('Fuel type count:', fuelTypeData.categories?.length || fuelTypeData.data?.length || 0);

  } catch (error) {
    console.error('Error testing categories API:', error);
  }
}

// Run the test
testCategoriesAPI(); 