const { ObjectID } = require('mongodb');
const Rental = require('../models/rental.model');
const RentalLib = require('../lib/rental.lib');
const asyncHandler = require('../middlewares/async.middleware');
const ErrorResponse = require('../utils/errorResponse.util');
const advancedResults = require('../utils/advancedResults.util');

class RentalController {
  constructor() {
    this.rentalLib = new RentalLib();
  }

  /**
   * @desc Create rental
   * @route POST /api/v1/rentals
   * @access Private
   */
  postRental = asyncHandler(async (req, res) => {
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
   * @route PUT /api/v1/rentals/:id/likes
   * @access Private
   */
  putRentalLike = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { user, params, body } = req;
    const { id } = params;
    const { action } = body;

    if (!['like', 'unlike'].includes(action)) {
      return next(new ErrorResponse('Invalid action', 400));
    }

    let rental = await this.rentalLib.fetchRental({ _id: id });
    if (!rental) {
      return next(
        new ErrorResponse(`Rental with id: ${id} does not exist on the database`, 404),
      );
    }
    let actionObj;
    if (action === 'like') {
      actionObj = {
        $addToSet: { likes: ObjectID(user.id) },
      };
    }
    if (action === 'unlike') {
      actionObj = {
        $pull: { likes: ObjectID(user.id) },
      };
    }

    rental = await this.rentalLib.updateRental(id, actionObj);
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
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const result = await advancedResults(Rental, req.query, { page, limit });

    res.status(200).json({
      success: true,
      ...result,
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
   * @desc Get rental likes
   * @route GET /api/v1/rentals/:id/likes
   * @access Private
   */
  getRentalLikes = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { id } = req.params;
    req.body.authorInformation = req.user;

    const rental = await this.rentalLib.fetchRental({ _id: id }, { populate: 'likes', select: 'likes' });
    if (!rental) {
      return next(
        new ErrorResponse(`Rental with id: ${id} does not exist on the database`, 404),
      );
    }
    return res.status(200).json({
      success: true,
      data: rental.toObject({ virtuals: true }),
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
