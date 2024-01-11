const mongoose = require('mongoose')

const connectDB=async()=>{
    try {
        const connect =await mongoose.connect('mongodb://127.0.0.1:27017/ecommerce'
        // , {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        // }
        );
    console.log(`database connected : ${connect.connection.host}`)
    } catch (error) {
        console.log(error);
    }
    
}
module.exports = connectDB;