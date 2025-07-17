import { MongoClient } from 'mongodb';

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/esrent';

// Sample categories data
const sampleCategories = [
  // Car Types
  {
    name: 'SUV',
    slug: 'suv',
    type: 'carType',
    description: 'Sport Utility Vehicles',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000',
    featured: true,
    carCount: 0
  },
  {
    name: 'Sedan',
    slug: 'sedan',
    type: 'carType',
    description: 'Four-door passenger cars',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1000',
    featured: true,
    carCount: 0
  },
  {
    name: 'Coupe',
    slug: 'coupe',
    type: 'carType',
    description: 'Two-door sports cars',
    image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1000',
    featured: false,
    carCount: 0
  },
  {
    name: 'Convertible',
    slug: 'convertible',
    type: 'carType',
    description: 'Open-top vehicles',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1000',
    featured: false,
    carCount: 0
  },
  {
    name: 'Hatchback',
    slug: 'hatchback',
    type: 'carType',
    description: 'Compact family cars',
    image: 'https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?q=80&w=1000',
    featured: false,
    carCount: 0
  },
  
  // Fuel Types
  {
    name: 'Petrol',
    slug: 'petrol',
    type: 'fuelType',
    description: 'Gasoline powered vehicles',
    image: 'https://images.unsplash.com/photo-1603768551289-7d6c4e3ca11c?q=80&w=1000',
    featured: true,
    carCount: 0
  },
  {
    name: 'Diesel',
    slug: 'diesel',
    type: 'fuelType',
    description: 'Diesel powered vehicles',
    image: 'https://images.unsplash.com/photo-1544461772-722f2a73a8a2?q=80&w=1000',
    featured: false,
    carCount: 0
  },
  {
    name: 'Electric',
    slug: 'electric',
    type: 'fuelType',
    description: 'Electric vehicles',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba53b0998?q=80&w=1000',
    featured: true,
    carCount: 0
  },
  {
    name: 'Hybrid',
    slug: 'hybrid',
    type: 'fuelType',
    description: 'Hybrid vehicles',
    image: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?q=80&w=1000',
    featured: false,
    carCount: 0
  },
  
  // Features/Tags
  {
    name: 'Luxury',
    slug: 'luxury',
    type: 'tag',
    description: 'Luxury vehicles',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1000',
    featured: true,
    carCount: 0
  },
  {
    name: 'Sports',
    slug: 'sports',
    type: 'tag',
    description: 'Sports and performance vehicles',
    image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1000',
    featured: true,
    carCount: 0
  },
  {
    name: 'Family',
    slug: 'family',
    type: 'tag',
    description: 'Family-friendly vehicles',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000',
    featured: false,
    carCount: 0
  },
  {
    name: 'Economy',
    slug: 'economy',
    type: 'tag',
    description: 'Economical vehicles',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000',
    featured: false,
    carCount: 0
  }
];

async function insertSampleCategories() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const categoriesCollection = db.collection('categories');
    
    // Clear existing categories
    await categoriesCollection.deleteMany({});
    console.log('Cleared existing categories');
    
    // Insert sample categories
    const result = await categoriesCollection.insertMany(sampleCategories);
    console.log(`Inserted ${result.insertedCount} categories`);
    
    // Display inserted categories
    const insertedCategories = await categoriesCollection.find({}).toArray();
    console.log('\nInserted categories:');
    insertedCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.type})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
insertSampleCategories(); 