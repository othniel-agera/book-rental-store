const { Router } = require('express');
const { authenticate } = require('../middlewares/authentication.middleware');
const {
  postReview, putReview, putReviewLike, getReviews, getReview, getReviewLikes, deleteReview,
} = require('../controllers/review.controller');
const Validator = require('../utils/validator.util');

const router = Router();

router.route('/').post(authenticate, Validator.postReviewValidator, postReview).get(authenticate, getReviews);
router.route('/:id/likes').put(authenticate, putReviewLike).get(authenticate, getReviewLikes);
router.route('/:id').put(authenticate, Validator.putReviewValidator, putReview).get(authenticate, getReview).delete(authenticate, deleteReview);

module.exports = router;
