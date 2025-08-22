import { User as UserModel } from '@/lib/models/userSchema';
import { dbConnect } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'super_admin';
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  role?: 'admin' | 'super_admin';
  isActive?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<User> {
    try {
      await dbConnect();
      const user = new UserModel(userData);
      const savedUser = await user.save();
      return savedUser.toJSON();
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Get a user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    try {
      await dbConnect();
      const user = await UserModel.findById(id);
      return user ? user.toJSON() : null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw new Error('Failed to get user');
    }
  }

  /**
   * Get a user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      await dbConnect();
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      return user ? user.toJSON() : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to get user');
    }
  }

  /**
   * Get all users
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      await dbConnect();
      const users = await UserModel.find()
        .sort({ createdAt: -1 })
        .lean();

      return users.map(user => {
        const { _id, __v, ...rest } = user;
        return {
          ...rest,
          id: _id?.toString(),
        } as User;
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Failed to get users');
    }
  }

  /**
   * Update a user
   */
  static async updateUser(id: string, updateData: UpdateUserData): Promise<User | null> {
    try {
      await dbConnect();
      const user = await UserModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      return user ? user.toJSON() : null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete a user
   */
  static async deleteUser(id: string): Promise<boolean> {
    try {
      await dbConnect();
      const result = await UserModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Authenticate user login
   */
  static async authenticateUser(credentials: LoginCredentials): Promise<AuthResult | null> {
    try {
      await dbConnect();
      
      const user = await UserModel.findOne({ 
        email: credentials.email.toLowerCase() 
      });

      if (!user || !user.isActive) {
        return null;
      }

      const isValidPassword = await user.comparePassword(credentials.password);
      if (!isValidPassword) {
        return null;
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id.toString(),
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      return {
        user: user.toJSON(),
        token
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw new Error('Failed to authenticate user');
    }
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as Record<string, unknown>;
      const user = await this.getUserById(decoded.userId as string);
      
      if (!user || !user.isActive) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      await dbConnect();
      
      const user = await UserModel.findById(userId);
      if (!user) {
        return false;
      }

      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        return false;
      }

      user.password = newPassword;
      await user.save();
      
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error('Failed to change password');
    }
  }

  /**
   * Reset user password (admin function)
   */
  static async resetPassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      await dbConnect();
      
      const user = await UserModel.findById(userId);
      if (!user) {
        return false;
      }

      user.password = newPassword;
      await user.save();
      
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new Error('Failed to reset password');
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<{
    total: number;
    active: number;
    admins: number;
    superAdmins: number;
  }> {
    try {
      await dbConnect();
      
      const [total, active, admins, superAdmins] = await Promise.all([
        UserModel.countDocuments(),
        UserModel.countDocuments({ isActive: true }),
        UserModel.countDocuments({ role: 'admin' }),
        UserModel.countDocuments({ role: 'super_admin' })
      ]);

      return {
        total,
        active,
        admins,
        superAdmins
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error('Failed to get user statistics');
    }
  }

  /**
   * Create default admin user if none exists
   */
  static async createDefaultAdmin(): Promise<void> {
    try {
      await dbConnect();
      
      const adminExists = await UserModel.findOne({ role: 'super_admin' });
      if (adminExists) {
        return;
      }

      const defaultAdmin = new UserModel({
        email: 'admin@esrent.ae',
        password: 'admin123',
        name: 'Default Admin',
        role: 'super_admin',
        isActive: true
      });

      await defaultAdmin.save();
      // console.log('Default admin user created'); 
    } catch (error) {
      console.error('Error creating default admin:', error);
      throw new Error('Failed to create default admin');
    }
  }
} 