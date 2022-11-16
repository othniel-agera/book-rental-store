const Book = require('../models/book.model');
const ErrorResponse = require('../utils/errorResponse.util');

class BookLib {
  constructor() {
    this.BookModel = Book;
  }

  createBook = async (userDetails) => {
    const { BookModel } = this;
    const {
      title, description, subject, authorInformation, dimension, pricing, quantity,
    } = userDetails;
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

  fetchBooks = async () => {
    const { BookModel } = this; await BookModel.find({}).exec();
  };

  fetchBook = async (value) => {
    const { BookModel } = this;
    const user = await BookModel.findOne(value).exec();
    return user;
  };
}

module.exports = BookLib;
