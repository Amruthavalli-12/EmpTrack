require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); 

const app = express();

// Establishing Database Connection
connectDB(); 

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- ROUTES SECTION ---
// 1. Auth Routes (Handling Login and Registration)
app.use('/api/auth', require('./routes/authRoutes'));

// 2. Admin Routes (All Administrative functions are routed here)
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes); 

// --- ERROR HANDLING (404 - Route Not Found) ---
app.use((req, res) => {
    res.status(404).json({ message: "Route not found! Check your URL spelling." });
});

const PORT = process.env.PORT || 5000;

// --- GLOBAL ERROR HANDLING MIDDLEWARE ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong! ⚠️", error: err.message });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));