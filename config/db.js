const mongoose = require('mongoose')
require('dotenv').config();
const connectDB=async()=>{
    try {
        const connect =await mongoose.connect(process.env.MONGODB_URL);
    console.log(`database connected : ${connect.connection.host}`)
    } catch (error) {
        console.log(error);
    }
    
}
module.exports = connectDB;