const express = require('express');
const connectDB  = require('./config/db');
const {PORT} = require('./config/serverConfig');
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
const { isAuth, sanitizeUser ,cookieExtractor} = require('./services/common');

const SECRET_KEY = 'SECRET_KEY';
// JWT options
const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = SECRET_KEY; // TODO: should not be in code;

//middlewares
app.use(express.static('build'))
app.use(cookieParser());
app.use(
  session({
    secret: 'keyboard cat',
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
app.use('/products', isAuth(), productsRouter.router);
// we can also use JWT token for client-only auth
app.use('/categories', isAuth(), categoriesRouter.router);
app.use('/brands', isAuth(), brandsRouter.router);
app.use('/users', isAuth(), usersRouter.router);
app.use('/auth', authRouter.router);
app.use('/cart', isAuth(), cartRouter.router);
app.use('/orders', isAuth(), ordersRouter.router);

// Passport Strategies
passport.use(
    'local',
    new LocalStrategy(
      {usernameField:'email'},
      async function (email, password, done) {
      // by default passport uses username
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
            const token = jwt.sign(sanitizeUser(user), SECRET_KEY);
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
    console.log({ jwt_payload });
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
  console.log('serialize', user);
  process.nextTick(function () {
    return cb(null, { id: user.id, role: user.role });
  });
});

// this changes session variable req.user when called from authorized request

passport.deserializeUser(function (user, cb) {
  console.log('de-serialize', user);
  process.nextTick(function () {
    return cb(null, user);
  });
});


// https://www.youtube.com/watch?v=LH-S5v-D3hA
app.listen(PORT, async()=>{
    connectDB();
    console.log('server started on PORT',PORT)
})