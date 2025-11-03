import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Create a new user
   */
  async create(userData: {
    fullName: string;
    phoneNumber: string;
    email?: string;
    password: string;
  }): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      phoneNumber: userData.phoneNumber,
    });

    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = new this.userModel({
      ...userData,
      password: hashedPassword,
      isVerified: true, // Set to true after OTP verification
    });

    return user.save();
  }

  /**
   * Find user by phone number
   */
  async findByPhoneNumber(phoneNumber: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phoneNumber }).exec();
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  /**
   * Update user password
   */
  async updatePassword(phoneNumber: string, newPassword: string): Promise<User> {
    const user = await this.findByPhoneNumber(phoneNumber);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    return user.save();
  }

  /**
   * Validate user password
   */
  async validatePassword(user: UserDocument, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  /**
   * Get user without password field
   */
  getUserWithoutPassword(user: UserDocument): Partial<User> {
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
}

