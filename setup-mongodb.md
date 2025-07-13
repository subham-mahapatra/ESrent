# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Recommended)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose "Free" tier (M0 Sandbox)

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to you
5. Click "Create"

### Step 3: Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

### Step 6: Update Environment Variables
Create a `.env.local` file in your project root with:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/esrent?retryWrites=true&w=majority
MONGODB_DB=esrent

# Cloudinary Configuration (for testing)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=test_cloud_name
CLOUDINARY_API_KEY=test_api_key
CLOUDINARY_API_SECRET=test_api_secret

# JWT Secret for Admin Authentication
JWT_SECRET=your_super_secret_jwt_key_for_development

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Option 2: Local MongoDB (Alternative)

### Install MongoDB Community Edition
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

### Connection String for Local
```env
MONGODB_URI=mongodb://localhost:27017/esrent
```

## Option 3: Docker MongoDB (Alternative)

### Run MongoDB in Docker
```bash
# Pull and run MongoDB
docker run --name mongodb -d -p 27017:27017 mongo:latest

# Connection string
MONGODB_URI=mongodb://localhost:27017/esrent
```

## Test the Connection

After setting up MongoDB, restart your development server:

```bash
npm run dev
```

Then run the test script:

```bash
node test-api.js
```

## Expected Results

With a proper MongoDB connection, you should see:
- ✅ GET endpoints returning data (even if empty arrays)
- ✅ POST endpoints requiring authentication
- ✅ Database operations completing successfully
- ✅ No timeout errors 