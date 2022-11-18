const express = require('express');

const router = express.Router();
const userRoute = require('./user.route');
const bookRoute = require('./book.route');
const reviewRoute = require('./review.route');

router.use('/auth', userRoute);
router.use('/books', bookRoute);
router.use('/reviews', reviewRoute);

router.get('/', (req, res) => {
  res.status(200).send({
    message: 'Welcome to the Book-Rental-Store API',
  });
});

router.all('*', (req, res) => {
  res.status(404).json({
    message: 'Invalid request, Route does not exist',
  });
});

module.exports = router;
