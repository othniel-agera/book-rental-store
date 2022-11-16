const ReviewLib = require('../lib/review.lib');
const asyncHandler = require('../middlewares/async.middleware');
const ErrorResponse = require('../utils/errorResponse.util');

class ReviewController {
  constructor() {
    this.bookLib = new ReviewLib();
  }

  /**
   * @desc Create review
   * @route POST /api/v1/reviews
   * @access Private
   */
  postReview = asyncHandler(async (req, res) => {
    // Add user to req.body
    req.body.authorInformation = req.user;
    const rawData = req.body;

    const book = await this.bookLib.createReview(rawData);
    return res.status(201).json({
      success: true,
      data: book,
    });
  });

  /**
   * @desc Edit review
   * @route PUT /api/v1/reviews/:id
   * @access Private
   */
  putReview = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { id } = req.params;
    req.body.authorInformation = req.user;
    const rawData = req.body;

    let book = await this.bookLib.fetchReview({ _id: id });
    if (!book) {
      return next(
        new ErrorResponse(`Review with id: ${id} does not exist on the database`, 404),
      );
    }

    book = await this.bookLib.updateReview(id, rawData);
    return res.status(202).json({
      success: true,
      data: book,
    });
  });

  /**
   * @desc Get reviews
   * @route GET /api/v1/reviews
   * @access Private
   */
  getReviews = asyncHandler(async (req, res) => {
    res.status(200).json(res.advancedResults);
  });

  /**
   * @desc Get review
   * @route GET /api/v1/reviews/:id
   * @access Private
   */
  getReview = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { id } = req.params;
    req.body.authorInformation = req.user;

    const book = await this.bookLib.fetchReview({ _id: id });
    if (!book) {
      return next(
        new ErrorResponse(`Review with id: ${id} does not exist on the database`, 404),
      );
    }
    return res.status(200).json({
      success: true,
      data: book,
    });
  });

  /**
   * @desc Delete review
   * @route DELETE /api/v1/reviews/:id
   * @access Private
   */
  deleteReview = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { id } = req.params;
    req.body.authorInformation = req.user;
    const rawData = req.body;

    let book = await this.bookLib.fetchReview({ _id: id });
    if (!book) {
      return next(
        new ErrorResponse(`Review with id: ${id} does not exist on the database`, 404),
      );
    }

    book = await this.bookLib.destroyReview(id, rawData);
    return res.status(202).json({
      success: true,
    });
  });
}

module.exports = new ReviewController();
