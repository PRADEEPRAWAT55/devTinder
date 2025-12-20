const databaseConfig = 'mongodb+srv://pradeep2000rawat:xD5x87gn4Ri57bEi@cluster0.cxbqyoo.mongodb.net/devTinder'

const mongoose = require('mongoose');

async function connectDB() {
    await mongoose.connect(databaseConfig);
}

module.exports = connectDB;