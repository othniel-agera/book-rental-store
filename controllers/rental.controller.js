const Rental = require('../models/rental.model');
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
    req.body.authorInformation = req.user;
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

    let rental = await this.rentalLib.fetchRental({ _id: id, user: user.id });
    if (!rental) {
      return next(
        new ErrorResponse(`Rental with id: ${id} does not exist on the database`, 404),
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
   * @desc Get rental likes
   * @route GET /api/v1/rentals/books/:userId
   * @access Private
   */
  getBooksRented = asyncHandler(async (req, res) => {
    // Add user to req.body
    const { userId } = req.params;
    req.body.authorInformation = req.user;

    const rentals = await advancedResults(Rental, { user: userId }, {
      page: 1,
      distinct: 'book',
      populate: 'book',
    });

    const books = await this.bookLib.fetchBooks({ _id: { $in: rentals.data } });

    return res.status(200).json({
      success: true,
      data: books,
    });
  });

  /**
   * @desc Get rental
   * @route GET /api/v1/rentals/:id
   * @access Private
   */
  getRental = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { id } = req.params;
    req.body.authorInformation = req.user;

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
