const { Router } = require('express');
const { authenticate } = require('../middlewares/authentication.middleware');
const {
  checkOut, checkIn, putRental, getRentals, getRental, getBooksRented, deleteRental,
} = require('../controllers/rental.controller');
const { getRentalValidator, checkOutValidator, putRentalValidator } = require('../utils/validator.util');

const router = Router();

router.route('/').get(authenticate, getRentalValidator, getRentals);
router.route('/checkout').post(authenticate, checkOutValidator, checkOut);
router.route('/books/:userId').get(authenticate, getBooksRented);
router.route('/:id').put(authenticate, putRentalValidator, putRental).get(authenticate, getRental).delete(authenticate, deleteRental);
router.route('/:id/checkin').put(authenticate, checkIn);

module.exports = router;
