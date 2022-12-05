const { Router } = require('express');
const { authenticate } = require('../middlewares/authentication.middleware');
const {
  postReview, putReview, putReviewLike, getReviews,
  getReview, getBooksHighestReview, getReviewLikes, deleteReview,
} = require('../controllers/review.controller');
const {
  getReviewValidator,
  getBookHighestReviewValidator,
  postReviewValidator,
  putReviewLikesValidator,
  putReviewValidator,
} = require('../utils/validator.util');

const router = Router({ mergeParams: true });

router.route('/').post(authenticate, postReviewValidator, postReview).get(authenticate, getReviewValidator, getReviews);
router.route('/books/highest').get(authenticate, getBookHighestReviewValidator, getBooksHighestReview);
router.route('/:id/likes').put(authenticate, putReviewLikesValidator, putReviewLike).get(authenticate, getReviewLikes);
router.route('/:id').put(authenticate, putReviewValidator, putReview).get(authenticate, getReview).delete(authenticate, deleteReview);

module.exports = router;
