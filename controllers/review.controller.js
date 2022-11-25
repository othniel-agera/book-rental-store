const { ObjectID } = require('mongodb');
const Review = require('../models/review.model');
const ReviewLib = require('../lib/review.lib');
const asyncHandler = require('../middlewares/async.middleware');
const ErrorResponse = require('../utils/errorResponse.util');
const advancedResults = require('../utils/advancedResults.util');

class ReviewController {
  constructor() {
    this.reviewLib = new ReviewLib();
  }

  /**
   * @desc Create review
   * @route POST /api/v1/reviews
   * @access Private
   */
  postReview = asyncHandler(async (req, res) => {
    // Add user to req.body
    req.body.reviewer = req.user;
    const rawData = req.body;
    await this.reviewLib.checkUserAndBookInDB({ user: rawData.user, book: rawData.book });
    const review = await this.reviewLib.createReview(rawData);
    return res.status(201).json({
      success: true,
      data: review,
    });
  });

  /**
   * @desc Edit review
   * @route PUT /api/v1/reviews/:id
   * @access Private
   */
  putReview = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { params, body, user } = req;
    const { id } = params;
    body.authorInformation = user;
    const rawData = body;
    let review = await this.reviewLib.fetchReview({ _id: id, user: body.authorInformation.id });
    if (!review) {
      return next(
        new ErrorResponse(`Review with id: ${id} does not exist.`, 404),
      );
    }

    review = await this.reviewLib.updateReview(id, rawData);
    return res.status(202).json({
      success: true,
      data: review,
    });
  });

  /**
   * @desc Edit review to add a like
   * @route PUT /api/v1/reviews/:id/likes
   * @access Private
   */
  putReviewLike = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { user, params, body } = req;
    const { id } = params;
    const { action } = body;

    if (!['like', 'unlike'].includes(action)) {
      return next(new ErrorResponse('Invalid action', 400));
    }

    let review = await this.reviewLib.fetchReview({ _id: id });
    if (!review) {
      return next(
        new ErrorResponse(`Review with id: ${id} does not exist.`, 404),
      );
    }
    const actionObj = { like: '$addToSet', unlike: '$pull' };
    const updateData = {
      [actionObj[action]]: { likes: ObjectID(user.id) },
    };
    review = await this.reviewLib.updateReview(id, updateData);
    return res.status(202).json({
      success: true,
      data: review,
    });
  });

  /**
   * @desc Get reviews
   * @route GET /api/v1/reviews
   * @route GET /api/v1/books/:bookId/reviews
   * @access Private
   */
  getReviews = asyncHandler(async (req, res) => {
    const { query, params } = req;
    const {
      page, limit, select, sort, ...filter
    } = query;
    let localFilter = { ...filter };
    if (params.bookId) {
      localFilter = { ...filter, book: params.bookId };
    }
    const result = await advancedResults(Review, localFilter, {
      page: page || parseInt(page, 10),
      limit: limit || parseInt(limit, 10),
      select,
      sort,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * @desc Get books with highest review
   * @route GET /api/v1/reviews/books/highest
   * @access Private
  */
  getBooksHighestReview = asyncHandler(async (req, res) => {
    const { query } = req;
    const {
      page, limit, lower, upper,
    } = query;

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const groupSortLookup = [
      {
        $group: {
          _id: '$book',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book',
        },
      },
    ];
    if (lower && upper) {
      groupSortLookup.unshift({
        $match: {
          createdAt: { $lt: new Date(upper), $gt: new Date(lower) },
        },
      });
    }
    const gslUnwindLimitSkip = [
      ...groupSortLookup,
      { $unwind: '$book' },
      { $skip: startIndex },
      { $limit: limit },
    ];
    const result = await Review.aggregate([
      {
        $facet: {
          totalCount: [
            ...groupSortLookup,
            { $count: 'count' },
          ],
          countOnPage: [
            ...gslUnwindLimitSkip,
            {
              $count: 'count',
            },
          ],
          mostRentedBooks: [
            ...gslUnwindLimitSkip,
          ],
        },
      },
    ]);
    const total = result[0].totalCount.length ? result[0].totalCount[0].count : 0;

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }
    let packaged = {
      totalCount: 0,
      countOnPage: 0,
      data: [],
    };
    if (result && result.length) {
      packaged = {
        totalCount: result[0].totalCount.length ? result[0].totalCount[0].count : 0,
        countOnPage: result[0].countOnPage.length ? result[0].countOnPage[0].count : 0,
        data: result[0].mostRentedBooks,
      };
    }
    res.status(200).json({
      success: true,
      pagination,
      ...packaged,
    });
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

    const review = await this.reviewLib.fetchReview({ _id: id });
    if (!review) {
      return next(
        new ErrorResponse(`Review with id: ${id} does not exist.`, 404),
      );
    }
    return res.status(200).json({
      success: true,
      data: review,
    });
  });

  /**
   * @desc Get review likes
   * @route GET /api/v1/reviews/:id/likes
   * @access Private
   */
  getReviewLikes = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { id } = req.params;
    req.body.authorInformation = req.user;
    const review = await this.reviewLib.fetchReview({ _id: id }, { populate: 'likes', select: 'likes' });
    if (!review) {
      return next(
        new ErrorResponse(`Review with id: ${id} does not exist.`, 404),
      );
    }
    return res.status(200).json({
      success: true,
      data: review.likes,
    });
  });

  /**
   * @desc Delete review
   * @route DELETE /api/v1/reviews/:id
   * @access Private
   */
  deleteReview = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { params, body, user } = req;
    const { id } = params;
    body.authorInformation = user;
    const rawData = body;

    let review = await this.reviewLib.fetchReview({ _id: id, user: body.authorInformation.id });
    if (!review) {
      return next(
        new ErrorResponse(`Review with id: ${id} does not exist.`, 404),
      );
    }

    review = await this.reviewLib.destroyReview(id, rawData);
    return res.status(202).json({
      success: true,
    });
  });
}

module.exports = new ReviewController();
