// seedAdmin.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import { hashPassword } from './utils/hashPassword.js';
import connectDB from './config/db.js';

dotenv.config();
await connectDB();

const seedAdmin = async () => {
  try {
    const existing = await Admin.findOne({ email: 'jerry@gmail.com' });
    if (existing) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const hashedPassword = await hashPassword('jerry');
    const admin = new Admin({
      name: 'Jerry',
      email: 'jerry@gmail.com',
      password: hashedPassword
    });

    await admin.save();
    console.log('Admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

seedAdmin();
