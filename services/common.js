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
   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YTI4ZmM3MDg0MWIyOWZjNGU3ODlhMSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzA1MTUyNDU5fQ.mFmydt2TohTqFadjVohtgtWtNke9UFUqYzqFBbsvVXU"
  return token;
};