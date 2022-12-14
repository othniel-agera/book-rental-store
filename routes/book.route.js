const { Router } = require('express');
const reviewsRouter = require('./review.route');
const rentalsRouter = require('./rental.route');
const { authenticate } = require('../middlewares/authentication.middleware');
const {
  postBook, putBook, putInStockBook, getBooks, getBook, deleteBook, getMyBooks,
} = require('../controllers/book.controller');
const {
  getBookValidator,
  postBookValidator,
  putInStockBookValidator,
  putBookValidator,
} = require('../utils/validator.util');

const router = Router();

router.use('/:bookId/reviews', reviewsRouter);
router.use('/:bookId/rentals', rentalsRouter);

router.route('/mine').get(authenticate, getMyBooks);
router.route('/').post(authenticate, postBookValidator, postBook).get(authenticate, getBookValidator, getBooks);
router.route('/:id/add-instock').put(authenticate, putInStockBookValidator, putInStockBook);
router.route('/:id').put(authenticate, putBookValidator, putBook).get(authenticate, getBook).delete(authenticate, deleteBook);

module.exports = router;
