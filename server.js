import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './models/index.js';
import productRoutes from './routes/products.js';
import deliveryOptionRoutes from './routes/deliveryOptions.js';
import cartItemRoutes from './routes/cartItems.js';
import orderRoutes from './routes/orders.js';
import resetRoutes from './routes/reset.js';
import paymentSummaryRoutes from './routes/paymentSummary.js';
import { Product } from './models/Product.js';
import { DeliveryOption } from './models/DeliveryOption.js';
import { CartItem } from './models/CartItem.js';
import { Order } from './models/Order.js';
import { defaultProducts } from './defaultData/defaultProducts.js';
import { defaultDeliveryOptions } from './defaultData/defaultDeliveryOptions.js';
import { defaultCart } from './defaultData/defaultCart.js';
import { defaultOrders } from './defaultData/defaultOrders.js';


const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const allowedOrigins = [
  'http://localhost:3000', // Keep this for local development testing
  // ⭐️ IMPORTANT: REPLACE THIS WITH YOUR ACTUAL FRONTEND DOMAIN ⭐️
  'https://magedgamail.github.io/Front-Try-1',
  // You might also need to include the specific path if using GitHub Pages:
  // 'https://username.github.io' 
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
  credentials: true, // Allow cookies and authentication headers
};

app.use(cors(corsOptions)); // Apply the custom options


app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'E-Commerce API is operational.',
    status: 'Running',
    version: '1.0.0',
    documentation: 'Access API routes at /api/...'
  });
});


app.use('/images', express.static(path.join(__dirname, 'images')));


app.use('/api/products', productRoutes);
app.use('/api/delivery-options', deliveryOptionRoutes);
app.use('/api/cart-items', cartItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reset', resetRoutes);
app.use('/api/payment-summary', paymentSummaryRoutes);


app.use(express.static(path.join(__dirname, 'dist')));



app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


await sequelize.sync();

const productCount = await Product.count();
if (productCount === 0) {
  const timestamp = Date.now();

  const productsWithTimestamps = defaultProducts.map((product, index) => ({
    ...product,
    createdAt: new Date(timestamp + index),
    updatedAt: new Date(timestamp + index)
  }));

  const deliveryOptionsWithTimestamps = defaultDeliveryOptions.map((option, index) => ({
    ...option,
    createdAt: new Date(timestamp + index),
    updatedAt: new Date(timestamp + index)
  }));

  const cartItemsWithTimestamps = defaultCart.map((item, index) => ({
    ...item,
    createdAt: new Date(timestamp + index),
    updatedAt: new Date(timestamp + index)
  }));

  const ordersWithTimestamps = defaultOrders.map((order, index) => ({
    ...order,
    createdAt: new Date(timestamp + index),
    updatedAt: new Date(timestamp + index)
  }));

  await Product.bulkCreate(productsWithTimestamps);
  await DeliveryOption.bulkCreate(deliveryOptionsWithTimestamps);
  await CartItem.bulkCreate(cartItemsWithTimestamps);
  await Order.bulkCreate(ordersWithTimestamps);

  console.log('Default data added to the database.');
}


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
