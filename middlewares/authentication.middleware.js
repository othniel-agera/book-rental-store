const { verify } = require('jsonwebtoken');
const asyncHandler = require('./async.middleware');
const ErrorResponse = require('../utils/errorResponse.util');
const User = require('../models/user.model');

class Authentication {
  authenticate = asyncHandler(async (req, res, next) => {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      [, token] = token.split(' ');
    }
    // Make sure token exists
    if (!token) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
    try {
      const decodedToken = verify(token, process.env.SESSION_SECRET);

      req.user = await User.findById(decodedToken.user_id);
      return next();
    } catch (error) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
  });
}
module.exports = new Authentication();
