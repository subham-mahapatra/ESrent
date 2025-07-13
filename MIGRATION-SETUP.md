# MongoDB Migration Setup Guide

## 🎯 **Current Status**

✅ **Completed:**
- Removed Firebase dependencies
- Created MongoDB schemas and services
- Implemented API routes with authentication
- Fixed schema index warnings
- Created comprehensive test scripts

⚠️ **Next Step:** Set up MongoDB database

## 🚀 **Quick Setup Instructions**

### 1. **Set Up MongoDB Atlas (Recommended)**

1. **Create MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Click "Try Free" and create an account
   - Choose "Free" tier (M0 Sandbox)

2. **Create a Cluster:**
   - Click "Build a Database"
   - Choose "FREE" tier (M0 Sandbox)
   - Select your preferred cloud provider
   - Choose a region close to you
   - Click "Create"

3. **Set Up Database Access:**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)
   - Set privileges to "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access:**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String:**
   - Go to "Database" in the left sidebar
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### 2. **Update Environment Variables**

Create or update `.env.local` in your project root:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/esrent?retryWrites=true&w=majority
MONGODB_DB=esrent

# Cloudinary Configuration (for testing)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=test_cloud_name
CLOUDINARY_API_KEY=test_api_key
CLOUDINARY_API_SECRET=test_api_secret

# JWT Secret for Admin Authentication
JWT_SECRET=your_super_secret_jwt_key_for_development_only_change_in_production

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. **Test the Setup**

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Run the comprehensive test:**
   ```bash
   node test-api-full.js
   ```

## 📊 **Expected Test Results**

With a proper MongoDB connection, you should see:
- ✅ User registration and login
- ✅ Brand, category, and car creation
- ✅ GET endpoints returning data
- ✅ Search functionality working
- ✅ Image upload (with Cloudinary setup)
- ✅ Token verification

## 🔧 **Alternative Setup Options**

### **Option 2: Local MongoDB**
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Connection string
MONGODB_URI=mongodb://localhost:27017/esrent
```

### **Option 3: Docker MongoDB**
```bash
# Pull and run MongoDB
docker run --name mongodb -d -p 27017:27017 mongo:latest

# Connection string
MONGODB_URI=mongodb://localhost:27017/esrent
```

## 🧪 **Test Scripts Available**

1. **`test-api-simple.js`** - Basic API structure testing
2. **`test-api-full.js`** - Comprehensive functionality testing
3. **`setup-env.js`** - Environment setup helper

## 📁 **Files Created/Modified**

### **New Files:**
- `src/lib/models/brandSchema.ts`
- `src/lib/models/carSchema.ts`
- `src/lib/models/categorySchema.ts`
- `src/lib/models/userSchema.ts`
- `src/lib/services/brandService.ts`
- `src/lib/services/carService.ts`
- `src/lib/services/categoryService.ts`
- `src/lib/services/userService.ts`
- `src/lib/middleware/auth.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/brands/route.ts`
- `src/app/api/brands/[id]/route.ts`
- `src/app/api/cars/route.ts`
- `src/app/api/cars/[id]/route.ts`
- `src/app/api/categories/route.ts`
- `src/app/api/categories/[id]/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/verify/route.ts`
- `src/app/api/upload/route.ts`

### **Modified Files:**
- `package.json` - Added MongoDB dependencies
- `env.example` - Updated with MongoDB configuration

## 🎯 **Next Steps After MongoDB Setup**

1. **Test Full Functionality** - Run comprehensive tests
2. **Frontend Integration** - Update components to use new APIs
3. **Admin Panel Updates** - Modify admin interface for new data structure
4. **Search Implementation** - Update search functionality
5. **Deployment** - Deploy to production with MongoDB Atlas

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **"Module not found: mongoose"**
   - Run: `npm install mongoose`

2. **"Operation buffering timed out"**
   - Check MongoDB connection string
   - Ensure network access is configured
   - Verify database user credentials

3. **"Authentication failed"**
   - Check JWT_SECRET in environment variables
   - Ensure user exists in database

4. **"Access token required"**
   - This is expected for POST endpoints
   - Use login endpoint to get token first

## 📞 **Support**

If you encounter any issues:
1. Check the console logs for detailed error messages
2. Verify your MongoDB connection string
3. Ensure all environment variables are set correctly
4. Test with the simple test script first: `node test-api-simple.js` 