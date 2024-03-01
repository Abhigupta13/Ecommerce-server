const express = require('express');
const { logout,createUser, loginUser, checkAuth,resetPasswordRequest,resetPassword } = require('../controller/AuthController');
const passport = require('passport');

const router = express.Router();
//  /auth is already added in base path
router.post('/signup', createUser)
.post('/login', passport.authenticate('local'), loginUser)
.get('/check',passport.authenticate('jwt'), checkAuth)
.get('/logout',logout)
.post('/reset-password-request', resetPasswordRequest)
.post('/reset-password', resetPassword)
exports.router = router;











// // https://www.youtube.com/watch?v=LH-S5v-D3hA
// app.listen(PORT, async()=>{
//     connectDB();
//     console.log('Server started on PORT',PORT)
// })
// const connectDB  = require('./config/db');
// const {PORT} = require('./config/serverConfig');