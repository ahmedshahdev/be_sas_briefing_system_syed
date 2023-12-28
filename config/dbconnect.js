const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false)

const connectToMongo = () => {
    try {
        mongoose.connect(process.env.MONGODB_URI, {
        })
        console.log("Connected successfully")
    } catch (err) {
        console.error("Error connecting db with server")
    }
}

module.exports = connectToMongo;