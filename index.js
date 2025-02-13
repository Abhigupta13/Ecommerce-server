require('dotenv').config();
const express = require('express');
const connectDB  = require('./config/db');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const productsRouter = require('./routes/Products');
const categoriesRouter = require('./routes/Categories');
const brandsRouter = require('./routes/Brands');
const usersRouter = require('./routes/Users');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const ordersRouter = require('./routes/Order');
const { User } = require('./model/User');
const { Order } = require('./model/Order');
const path = require('path');
const { isAuth, sanitizeUser ,cookieExtractor} = require('./services/common');
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY);



// Webhook

// TODO: we will capture actual order after deploying out server live on public URL

const endpointSecret = process.env.WEBHOOK_ENDPOINT;

// where to run stripe cli (folderwhere stripe.exe downloaded in path type cmd.exe ->stripe.exe->stripe login)

app.post('/webhook', express.raw({type: 'application/json'}), async(request, response) => {
const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = await stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    console.log(err);
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      // console.log({paymentIntentSucceeded})
      const order = await Order.findById(paymentIntentSucceeded.metadata.orderId);
      order.paymentStatus = 'received';
      await order.save()
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});


// JWT options
const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY; // TODO: should not be in code;

//middlewares
// app.use(express.static(path.resolve(__dirname,'build')))
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
  })
);
app.use(passport.authenticate('session'));
app.use(
  cors({
    exposedHeaders: ['X-Total-Count'],
  })
);
app.use(express.json()); // to parse req.body
// app.get('/',async(req,res)=>{
//   res.send("welcome to the quickmart-ecommerce backend")
// })
app.use('/products', productsRouter.router);
// we can also use JWT token for client-only auth
app.use('/categories', categoriesRouter.router);
app.use('/brands', brandsRouter.router);
app.use('/users', isAuth(), usersRouter.router);

app.use('/auth', authRouter.router);
app.use('/productCart', isAuth(), cartRouter.router);
app.use('/orders', isAuth(), ordersRouter.router);

// this line we add to make react router work in case of other routes doesnt match
// app.get('*', (req, res) => res.sendFile(path.resolve('build', 'index.html')));

// Passport Strategies
passport.use(
    'local',
    new LocalStrategy(
      {usernameField:'email'},
      async function (email, password, done) {
      // by default passport uses username
      // console.log({email,password})
      try {
        const user = await User.findOne({ email: email });
        // console.log(email, password, user);
        if (!user) {
          return done(null, false, { message: 'invalid credentials' }); // for safety
        }
        crypto.pbkdf2(
          password,
          user.salt,
          310000,
          32,
          'sha256',
          async function (err, hashedPassword) {
            if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
              return done(null, false, { message: 'invalid credentials' });
            }
            const token = jwt.sign(sanitizeUser(user),process.env.JWT_SECRET_KEY);
            done(null, {id:user.id, role:user.role,token:token}); // this lines sends to serializer
          }
          );
        } catch (err) {
          done(err);
        }
      })
      );
      
      passport.use(
        'jwt',
        new JwtStrategy(opts, async function (jwt_payload, done) {
          // console.log({ jwt_payload });
          try {
            const user = await User.findById(jwt_payload.id);
            if (user) {
              return done(null, sanitizeUser(user)); // this calls serializer
            } else {
              return done(null, false);
            }
          } catch (err) {
            return done(err, false);
          }
        })
        );
        
        
// this creates session variable req.user on being called from callbacks
passport.serializeUser(function (user, cb) {
  // console.log('serialize', user);
  process.nextTick(function () {
    return cb(null, { id: user.id, role: user.role });
  });
});

// this changes session variable req.user when called from authorized request

passport.deserializeUser(function (user, cb) {
  // console.log('de-serialize', user);
  process.nextTick(function () {
    return cb(null, user);
  });
});

// Payments


// This is your test secret API key.


app.post("/create-payment-intent", async (req, res) => {
  const { totalAmount, orderId } = req.body;
  // console.log("payment-intent",totalAmount);

  // Create a PaymentIntent with the order amount and currency
  // console.log(totalAmount)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount*100, // for decimal compensation
    currency: "usd",
    // email:"testemail@gmail.com",
    // name:"akg",
    // phone:"1234567890",
    description:"dummy payment",
    shipping: {
      name: 'Abhishek Gupta',
      address: {
        line1: 'Khelgaon',
        postal_code: '834009',
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
      },
    },
    automatic_payment_methods: {
      enabled: true,
    },
    metadata:{
      orderId
    }
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});




// https://www.youtube.com/watch?v=LH-S5v-D3hA
app.listen(process.env.PORT, async()=>{
    connectDB();
    console.log('server started on PORT',process.env.PORT)
})