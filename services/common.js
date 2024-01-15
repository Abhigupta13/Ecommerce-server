const passport = require('passport');

exports.isAuth = (req, res, done) => {
  return passport.authenticate('jwt');
};

exports.sanitizeUser = (user) => {
  return { id: user.id, role: user.role };
};

exports.cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  //TODO : this is temporary token for testing without cookie
  token =
   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YTU0ZGNmMmI5M2UwNzNhNDVmNGMzMyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzA1MzMyMTk0fQ.L0ea0Bh28kuNIYbEydK3baOoZPIa7Gyng8A0yhSGEoo";
  return token;
};