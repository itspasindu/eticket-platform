const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        const mongoUrl = process.env.MONGO_URL?.trim();

        if (!mongoUrl) {
            console.warn('MongoDB connection skipped: MONGO_URL is not set');
            return null;
        }

        const conn = await mongoose.connect(mongoUrl);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch(error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
};

module.exports = connectDB