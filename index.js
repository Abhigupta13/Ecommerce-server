const express = require('express');
const app = express();
 const productsRouter = require('./routes/Products');
const categoriesRouter = require('./routes/Categories');
const brandsRouter = require('./routes/Brands');
const authRouter = require('./routes/Auth');
const usersRouter = require('./routes/Users');
const cartRouter = require('./routes/Cart');
const ordersRouter = require('./routes/Order');
const cors = require('cors');
const connectDB  = require('./config/db');
const {PORT} = require('./config/serverConfig');

//middlewares

app.use(cors({
    exposedHeaders:['X-Total-Count']
}))
app.use(express.json()); // to parse req.body
app.use('/products', productsRouter.router);
app.use('/categories', categoriesRouter.router)
app.use('/brands', brandsRouter.router)
app.use('/users', usersRouter.router)
app.use('/auth', authRouter.router)
app.use('/cart', cartRouter.router)
app.use('/orders', ordersRouter.router)



app.get('/',(req, res)=>{
    res.json({status:'success'})
})

// https://www.youtube.com/watch?v=LH-S5v-D3hA
app.listen(PORT, async()=>{
    connectDB();
    console.log('Server started on PORT',PORT)
})