import { MongoClient } from 'mongodb';

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/esrent';

async function testCategoryIntegration() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const categoriesCollection = db.collection('categories');
    const carsCollection = db.collection('cars');
    
    // Get all categories
    const categories = await categoriesCollection.find({}).toArray();
    console.log(`Found ${categories.length} categories`);
    
    // Get all cars
    const cars = await carsCollection.find({}).toArray();
    console.log(`Found ${cars.length} cars`);
    
    // Test category counting
    for (const category of categories) {
      let carCount = 0;
      
      switch (category.type) {
        case 'carType':
          carCount = await carsCollection.countDocuments({
            $or: [
              { categoryId: category._id },
              { category: { $regex: category.name, $options: 'i' } }
            ],
            isAvailable: true 
          });
          break;
        case 'fuelType':
          carCount = await carsCollection.countDocuments({ 
            fuel: { $regex: category.name, $options: 'i' },
            isAvailable: true 
          });
          break;
        case 'tag':
          carCount = await carsCollection.countDocuments({ 
            tags: { $regex: category.name, $options: 'i' },
            isAvailable: true 
          });
          break;
      }
      
      console.log(`- ${category.name} (${category.type}): ${carCount} cars`);
    }
    
    // Show cars with categoryId
    const carsWithCategoryId = await carsCollection.find({ categoryId: { $exists: true } }).toArray();
    console.log(`\nCars with categoryId: ${carsWithCategoryId.length}`);
    carsWithCategoryId.forEach(car => {
      console.log(`- ${car.name}: categoryId = ${car.categoryId}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testCategoryIntegration(); 