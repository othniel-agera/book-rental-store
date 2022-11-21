const Rental = require('../models/rental.model');
const Book = require('../models/book.model');
const RentalLib = require('../lib/rental.lib');
const BookLib = require('../lib/book.lib');
const asyncHandler = require('../middlewares/async.middleware');
const ErrorResponse = require('../utils/errorResponse.util');
const advancedResults = require('../utils/advancedResults.util');

class RentalController {
  constructor() {
    this.rentalLib = new RentalLib();
    this.bookLib = new BookLib();
  }

  /**
   * @desc Create rental
   * @route POST /api/v1/rentals
   * @access Private
   */
  checkOut = asyncHandler(async (req, res) => {
    // Add user to req.body
    req.body.user = req.user;
    const rawData = req.body;
    await this.rentalLib.checkResourceInDB({ user: rawData.user, book: rawData.book });
    const rental = await this.rentalLib.createRental(rawData);
    return res.status(201).json({
      success: true,
      data: rental,
    });
  });

  /**
   * @desc Edit rental
   * @route PUT /api/v1/rentals/:id
   * @access Private
   */
  putRental = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { id } = req.params;
    req.body.authorInformation = req.user;
    const rawData = req.body;

    let rental = await this.rentalLib.fetchRental({ _id: id });
    if (!rental) {
      return next(
        new ErrorResponse(`Rental with id: ${id} does not exist on the database`, 404),
      );
    }

    rental = await this.rentalLib.updateRental(id, rawData);
    return res.status(202).json({
      success: true,
      data: rental,
    });
  });

  /**
   * @desc Edit rental to add a like
   * @route PUT /api/v1/rentals/:id/checkin
   * @access Private
   */
  checkIn = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { user, params } = req;
    const { id } = params;
    let rental = await this.rentalLib.fetchRental({ _id: id });
    if (!rental) {
      return next(
        new ErrorResponse(`Rental with id: ${id} does not exist on the database`, 404),
      );
    }
    if (rental.user.toString() !== user.id) {
      return next(
        new ErrorResponse(`User: ${user.id} does not have authorization to checkout this rental`, 401),
      );
    }

    rental = await this.rentalLib.updateRental(id, { isReturned: true });
    return res.status(202).json({
      success: true,
      data: rental,
    });
  });

  /**
   * @desc Get rentals
   * @route GET /api/v1/rentals
   * @access Private
   */
  getRentals = asyncHandler(async (req, res) => {
    const { query, params } = req;
    const {
      page, limit, select, sort, ...filter
    } = query;
    let localFilter = { ...filter };
    if (params.bookId) {
      localFilter = { ...filter, book: params.bookId };
    }
    const result = await advancedResults(Rental, localFilter, {
      page,
      limit,
      select,
      sort,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * @desc Get rental likes
   * @route GET /api/v1/rentals/books/:userId
   * @access Private
   */
  getBooksRented = asyncHandler(async (req, res) => {
    const { query, params } = req;
    const {
      page, limit,
    } = query;
    const { userId } = params;

    const rentals = await advancedResults(Rental, { user: userId }, {
      distinct: 'book',
      populate: 'book',
    });

    const results = await advancedResults(Book, { _id: { in: rentals.data } }, {
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      ...results,
    });
  });

  /**
   * @desc Get most rented books
   * @route GET /api/v1/rentals/books/most
   * @access Private
   */
  getMostRented = asyncHandler(async (req, res) => {
    const { query } = req;
    const { page, limit } = query;

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
    const gslUnwindLimitSkip = [
      ...groupSortLookup,
      { $unwind: '$book' },
      { $skip: startIndex },
      { $limit: limit },
    ];

    const result = await Rental.aggregate([
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
    const total = result[0].totalCount[0].count;

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
        totalCount: result[0].totalCount[0].count,
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
   * @desc Get rental
   * @route GET /api/v1/rentals/:id
   * @access Private
   */
  getRental = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const rental = await this.rentalLib.fetchRental({ _id: id });
    if (!rental) {
      return next(
        new ErrorResponse(`Rental with id: ${id} does not exist on the database`, 404),
      );
    }
    return res.status(200).json({
      success: true,
      data: rental,
    });
  });

  /**
   * @desc Delete rental
   * @route DELETE /api/v1/rentals/:id
   * @access Private
   */
  deleteRental = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { id } = req.params;
    req.body.authorInformation = req.user;
    const rawData = req.body;

    let rental = await this.rentalLib.fetchRental({ _id: id });
    if (!rental) {
      return next(
        new ErrorResponse(`Rental with id: ${id} does not exist on the database`, 404),
      );
    }

    rental = await this.rentalLib.destroyRental(id, rawData);
    return res.status(202).json({
      success: true,
    });
  });
}

module.exports = new RentalController();
