const BookLib = require('../lib/book.lib');
const asyncHandler = require('../middlewares/async.middleware');
const ErrorResponse = require('../utils/errorResponse.util');

class BookController {
  constructor() {
    this.bookLib = new BookLib();
  }

  /**
   * @desc Create book
   * @route POST /api/v1/book
   * @access Private
   */
  postBook = asyncHandler(async (req, res) => {
    // Add user to req.body
    req.body.authorInformation = req.user;
    const rawData = req.body;

    const book = await this.bookLib.createBook(rawData);
    return res.status(201).json({
      success: true,
      data: book,
    });
  });

  /**
   * @desc Edit book
   * @route PUT /api/v1/book/:id
   * @access Private
   */
  putBook = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { id } = req.params;
    req.body.authorInformation = req.user;
    const rawData = req.body;

    let book = await this.bookLib.fetchBook({ _id: id });
    if (!book) {
      return next(
        new ErrorResponse(`Book with id: ${id} does not exist on the database`, 404),
      );
    }

    book = await this.bookLib.updateBook(id, rawData);
    return res.status(202).json({
      success: true,
      data: book,
    });
  });

  /**
   * @desc Edit book to only increase the number of books in store
   * @route PUT /api/v1/book/:id
   * @access Private
   */
  putInStockBook = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { id } = req.params;
    const { inStock } = req.body;

    let book = await this.bookLib.fetchBook({ _id: id });
    if (!book) {
      return next(
        new ErrorResponse(`Book with id: ${id} does not exist on the database`, 404),
      );
    }
    book = await this.bookLib.updateBook(id, { $set: { 'quantity.inStock': inStock } });
    return res.status(202).json({
      success: true,
      data: book,
    });
  });
}

module.exports = new BookController();
