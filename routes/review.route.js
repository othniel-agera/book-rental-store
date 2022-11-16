const { Router } = require('express');
const { authenticate } = require('../middlewares/authentication.middleware');
const {
  postReview, putReview, getReviews, getReview, deleteReview,
} = require('../controllers/review.controller');
const Validator = require('../utils/validator.util');

const router = Router();

router.route('/').post(authenticate, Validator.postReviewValidator, postReview).get(authenticate, getReviews);

router.route('/:id').put(authenticate, Validator.putReviewValidator, putReview).get(authenticate, getReview).delete(authenticate, deleteReview);

module.exports = router;
