const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fileAnalysisDashboard';

// Define schemas to ensure consistency
const ProductSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    stock: Number,
    category: String,
    sku: String,
    images: [String],
  },
  { timestamps: true },
);

const AddressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  { _id: false },
);

const CustomerSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    address: AddressSchema,
  },
  { timestamps: true },
);

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantity: Number,
  price: Number,
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: String,
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    items: [OrderItemSchema],
    subtotal: Number,
    tax: Number,
    shipping: Number,
    totalAmount: Number,
    shippingAddress: AddressSchema,
    billingAddress: AddressSchema,
    paymentMethod: String,
    status: String,
  },
  { timestamps: true },
);

// Setup models
mongoose.model('Product', ProductSchema);
mongoose.model('Customer', CustomerSchema);
mongoose.model('Order', OrderSchema);

// Generate random address
function generateAddress() {
  return {
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode(),
    country: 'United States',
  };
}

// Generate random customer
function generateCustomer() {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number(),
    address: generateAddress(),
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent(),
  };
}

// Generate a random order
function generateOrder(customerId, products, orderIndex) {
  // Select 1-5 random products
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  const selectedProducts = shuffled.slice(0, faker.number.int({ min: 1, max: 5 }));

  const items = selectedProducts.map((product) => {
    const quantity = faker.number.int({ min: 1, max: 5 });
    return {
      product: product._id,
      quantity,
      price: product.price,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Number((subtotal * 0.08).toFixed(2)); // 8% tax
  const shipping = Number((5.99).toFixed(2)); // Flat shipping rate
  const totalAmount = Number((subtotal + tax + shipping).toFixed(2));

  const orderStatus = faker.helpers.arrayElement([
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ]);

  const orderDate = faker.date.recent({ days: 60 }); // Last 60 days

  return {
    orderNumber: `ORD-${100000 + orderIndex}`,
    customer: customerId,
    items,
    subtotal,
    tax,
    shipping,
    totalAmount,
    shippingAddress: generateAddress(),
    billingAddress: generateAddress(),
    paymentMethod: faker.helpers.arrayElement(['Credit Card', 'PayPal', 'Bank Transfer']),
    status: orderStatus,
    createdAt: orderDate,
    updatedAt: orderDate,
  };
}

async function seedDatabase() {
  console.log('Starting the comprehensive database seeding process...');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB via Mongoose');

    // Get model references
    const Product = mongoose.model('Product');
    const Customer = mongoose.model('Customer');
    const Order = mongoose.model('Order');

    // Get existing products
    console.log('Fetching existing products...');
    const existingProducts = await Product.find().lean();

    if (existingProducts.length === 0) {
      console.error('No products found in database. Please run seed-db.js first to add products.');
      mongoose.disconnect();
      return;
    }

    console.log(`Found ${existingProducts.length} products in database.`);

    // Clean up existing data
    console.log('Clearing existing customers and orders...');
    await Customer.deleteMany({});
    await Order.deleteMany({});

    // Generate customers
    console.log('Generating customers...');
    const CUSTOMER_COUNT = 25;
    const customers = Array(CUSTOMER_COUNT)
      .fill()
      .map(() => generateCustomer());

    // Insert customers
    console.log(`Inserting ${customers.length} customers...`);
    const insertedCustomers = await Customer.insertMany(customers);
    console.log(`Successfully inserted ${insertedCustomers.length} customers.`);

    // Generate orders
    console.log('Generating orders...');
    const ORDER_COUNT = 75; // Generate 75 orders across all customers

    const orders = [];
    for (let i = 0; i < ORDER_COUNT; i++) {
      // Randomly assign order to a customer (some customers will have multiple orders)
      const randomCustomer =
        insertedCustomers[Math.floor(Math.random() * insertedCustomers.length)];
      const order = generateOrder(randomCustomer._id, existingProducts, i);
      orders.push(order);
    }

    // Insert orders
    console.log(`Inserting ${orders.length} orders...`);
    const insertedOrders = await Order.insertMany(orders);
    console.log(`Successfully inserted ${insertedOrders.length} orders.`);

    // Update product stock based on orders
    console.log('Updating product stock based on orders...');
    const productQuantitySold = {};

    // Calculate quantity sold for each product
    for (const order of insertedOrders) {
      for (const item of order.items) {
        const productId = item.product.toString();
        if (!productQuantitySold[productId]) {
          productQuantitySold[productId] = 0;
        }
        productQuantitySold[productId] += item.quantity;
      }
    }

    // Update product stock
    for (const productId in productQuantitySold) {
      const quantitySold = productQuantitySold[productId];
      const product = existingProducts.find((p) => p._id.toString() === productId);

      if (product) {
        // Make sure stock doesn't go negative
        const newStock = Math.max(0, product.stock - quantitySold);
        await Product.findByIdAndUpdate(productId, { stock: newStock });
      }
    }

    console.log('All data has been successfully seeded!');

    // Print some statistics
    console.log('\n--- Seeding Summary ---');
    console.log(`Customers: ${insertedCustomers.length}`);
    console.log(`Orders: ${insertedOrders.length}`);
    console.log(`Products: ${existingProducts.length}`);

    const totalRevenue = insertedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    console.log(`Total Revenue: $${totalRevenue.toFixed(2)}`);

    const statusCounts = insertedOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    console.log('Orders by Status:');
    for (const status in statusCounts) {
      console.log(`  ${status}: ${statusCounts[status]}`);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

seedDatabase().catch(console.error);
