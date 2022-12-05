const Book = require('../models/book.model');
const ErrorResponse = require('../utils/errorResponse.util');

class BookLib {
  constructor() {
    this.BookModel = Book;
  }

  isBookInDB = async (bookId) => {
    const user = await this.fetchBook({ _id: bookId });
    if (!user) return false;
    return true;
  };

  createBook = async (bookDetails) => {
    const { BookModel } = this;
    const {
      title, description, subject, authorInformation, dimension, pricing, quantity,
    } = bookDetails;
    let book;
    try {
      book = new BookModel({
        title, description, subject, authorInformation, dimension, pricing, quantity,
      });
      return await book.save();
    } catch (error) {
      throw new ErrorResponse(error.message, 400);
    }
  };

  updateBook = async (id, bookDetails) => {
    const { BookModel } = this;
    try {
      const user = await BookModel.findByIdAndUpdate(id, bookDetails, {
        new: true,
        runValidators: true,
      });
      return user;
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  };

  destroyBook = async (value) => {
    const { BookModel } = this;
    try {
      await BookModel.findOneAndDelete({ ...value });
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  };

  fetchBooks = async (values = {}) => {
    const { BookModel } = this;
    const books = await BookModel.find(values).exec();
    return books;
  };

  fetchBook = async (value) => {
    const { BookModel } = this;
    const user = await BookModel.findOne(value).exec();
    return user;
  };
}

module.exports = BookLib;
