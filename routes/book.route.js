const { Router } = require('express');
const { authenticate } = require('../middlewares/authentication.middleware');
const {
  postBook, putBook, putInStockBook, getBooks, getBook, deleteBook, getMyBooks,
} = require('../controllers/book.controller');
const Validator = require('../utils/validator.util');

const router = Router();

router.route('/mine').get(authenticate, getMyBooks);
router.route('/').post(authenticate, Validator.postBookValidator, postBook).get(authenticate, getBooks);
router.route('/:id/add-instock').put(authenticate, Validator.putInStockBookValidator, putInStockBook);
router.route('/:id').put(authenticate, Validator.putBookValidator, putBook).get(authenticate, getBook).delete(authenticate, deleteBook);

module.exports = router;
