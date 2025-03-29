const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory';

// Connect to the database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Define User Schema and Model
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: {
      type: String,
      enum: ['admin', 'manager', 'user'],
      default: 'user',
    },
    refreshToken: String,
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Create users
const createUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});

    // Create admin user
    const adminPassword = await bcrypt.hash('Test@1305', 10);
    await User.create({
      name: 'John Doe',
      email: 'john@gmail.com',
      password: adminPassword,
      role: 'admin',
    });

    // Create manager user
    const managerPassword = await bcrypt.hash('Test@1305', 10);
    await User.create({
      name: 'Jane Smith',
      email: 'jane@gmail.com',
      password: managerPassword,
      role: 'manager',
    });

    console.log('Users created successfully');
  } catch (error) {
    console.error(`Error creating users: ${error.message}`);
  }
};

// Main function
const seedDatabase = async () => {
  await connectDB();
  await createUsers();
  console.log('Database seeded successfully');
  mongoose.connection.close();
  process.exit(0);
};

// Run the seed function
seedDatabase().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
