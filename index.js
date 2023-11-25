const express = require('express');
const app = express();
 const productsRouter = require('./routes/Products');
const categoriesRouter = require('./routes/Categories');
const brandsRouter = require('./routes/Brands');
const cors = require('cors');
const connectDB  = require('./config/db');
const PORT =process.env.PORT || 8080

//middlewares

app.use(cors({
    exposedHeaders:['X-Total-Count']
}))
app.use(express.json()); // to parse req.body
app.use('/products', productsRouter.router);
app.use('/categories', categoriesRouter.router)
app.use('/brands', brandsRouter.router)



app.get('/',(req, res)=>{
    res.json({status:'success'})
})


app.listen(PORT, async()=>{
    connectDB();
    console.log('Server started on PORT',PORT)
})