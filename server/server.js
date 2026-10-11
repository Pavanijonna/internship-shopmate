const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');


process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Increase limit to 5MB (or higher if needed)
// This is required for file upload if your image is > 100kb
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Middleware
app.use(cors({ origin: '*' }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs',blogRoutes);


app.get('/', (req, res) => {
    res.send('ShopMATE API is running...');
});

// Connect to DB and start server
connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server listening on port ${PORT}`);
    });
});