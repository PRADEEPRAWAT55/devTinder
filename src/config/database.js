
const mongoose = require('mongoose');
const URI = process.env.DB_CONNECTION_SECRET;
async function connectDB() {
    await mongoose.connect(URI);
}

module.exports = connectDB;