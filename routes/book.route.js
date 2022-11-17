const { Router } = require('express');
const reviewsRouter = require('./review.route');
const { authenticate } = require('../middlewares/authentication.middleware');
const {
  postBook, putBook, putInStockBook, getBooks, getBook, deleteBook, getMyBooks,
} = require('../controllers/book.controller');
const {
  postBookValidator,
  putInStockBookValidator,
  putBookValidator,
} = require('../utils/validator.util');

const router = Router();

router.use('/:bookId/reviews', reviewsRouter);

router.route('/mine').get(authenticate, getMyBooks);
router.route('/').post(authenticate, postBookValidator, postBook).get(authenticate, getBooks);
router.route('/:id/add-instock').put(authenticate, putInStockBookValidator, putInStockBook);
router.route('/:id').put(authenticate, putBookValidator, putBook).get(authenticate, getBook).delete(authenticate, deleteBook);

module.exports = router;
