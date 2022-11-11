const { Router } = require('express');
const { authenticate } = require('../middlewares/authentication.middleware');
const {
  postBook, putBook, putInStockBook,
} = require('../controllers/book.controller');
const Validator = require('../utils/validator.util');

const router = Router();

router.route('/').post(authenticate, Validator.postBookValidator, postBook);
router.route('/:id/add-instock').put(authenticate, Validator.putInStockBookValidator, putInStockBook);
router.route('/:id').put(authenticate, Validator.putBookValidator, putBook);

module.exports = router;
