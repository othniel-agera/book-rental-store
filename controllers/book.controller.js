const Book = require('../models/book.model');
const BookLib = require('../lib/book.lib');
const asyncHandler = require('../middlewares/async.middleware');
const ErrorResponse = require('../utils/errorResponse.util');
const advancedResults = require('../utils/advancedResults.util');

class BookController {
  constructor() {
    this.bookLib = new BookLib();
  }

  /**
   * @desc Create book
   * @route POST /api/v1/books
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
   * @route PUT /api/v1/books/:id
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
   * @route PUT /api/v1/books/:id
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

  /**
   * @desc Get books
   * @route GET /api/v1/books
   * @access Private
   */
  getBooks = asyncHandler(async (req, res) => {
    const { query } = req;
    const {
      page, limit, select, sort, ...filter
    } = query;
    const result = await advancedResults(Book, filter, {
      page,
      limit,
      select,
      sort,
      populate: 'authorInformation',
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * @desc Get all my books
   * @route GET /api/v1/books
   * @access Private
   */
  getMyBooks = asyncHandler(async (req, res) => {
    const authorInformation = req.user;
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const result = await advancedResults(
      Book,
      { ...req.query, authorInformation: authorInformation.id },
      { page, limit },
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * @desc Get book
   * @route GET /api/v1/books/:id
   * @access Private
   */
  getBook = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { id } = req.params;

    const book = await this.bookLib.fetchBook({ _id: id });
    if (!book) {
      return next(
        new ErrorResponse(`Book with id: ${id} does not exist on the database`, 404),
      );
    }
    return res.status(200).json({
      success: true,
      data: book,
    });
  });

  /**
   * @desc Delete book
   * @route DELETE /api/v1/books/:id
   * @access Private
   */
  deleteBook = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    const { id } = req.params;

    let book = await this.bookLib.fetchBook({ _id: id });
    if (!book) {
      return next(
        new ErrorResponse(`Book with id: ${id} does not exist on the database`, 404),
      );
    }

    book = await this.bookLib.destroyBook(id);
    return res.status(202).json({
      success: true,
    });
  });
}

module.exports = new BookController();
