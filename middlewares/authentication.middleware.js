const { verify } = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith('Bearer ')) {
    [, token] = token.split(' ');
  }
  if (token) {
    try {
      const decodedToken = verify(token, process.env.SESSION_SECRET);
      req.user_id = decodedToken.user_id;
      return next();
    } catch (error) {
      return res.status(401).send({ message: 'Unauthorized request, please provide a valid token.' });
    }
  } else {
    return res.status(401).send({ message: 'Unauthorized request, please login' });
  }
};

module.exports = authenticate;
