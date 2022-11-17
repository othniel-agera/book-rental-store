const { Router } = require('express');
const { authenticate } = require('../middlewares/authentication.middleware');
const {
  postRental, putRental, putRentalLike, getRentals, getRental, getRentalLikes, deleteRental,
} = require('../controllers/rental.controller');
const Validator = require('../utils/validator.util');

const router = Router();

router.route('/').post(authenticate, Validator.postRentalValidator, postRental).get(authenticate, getRentals);
router.route('/:id/likes').put(authenticate, putRentalLike).get(authenticate, getRentalLikes);
router.route('/:id').put(authenticate, Validator.putRentalValidator, putRental).get(authenticate, getRental).delete(authenticate, deleteRental);

module.exports = router;
