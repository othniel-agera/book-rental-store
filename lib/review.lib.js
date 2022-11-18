const Review = require('../models/review.model');
const ErrorResponse = require('../utils/errorResponse.util');
const BookLib = require('./book.lib');
const UserLib = require('./user.lib');

class ReviewLib {
  constructor() {
    this.ReviewModel = Review;
    this.bookLib = new BookLib();
    this.userLib = new UserLib();
  }

  checkUserAndBookInDB = async ({ user, book }) => {
    if (user) {
      const isUserInDB = await this.userLib.isUserInDB(user);
      if (!isUserInDB) throw new ErrorResponse(`Reviewer with id: ${user} is not in database`, 422);
    }
    if (book) {
      const isBookInDB = await this.bookLib.isBookInDB(book);
      if (!isBookInDB) throw new ErrorResponse(`Book with id: ${book} is not in database`, 422);
    }
    return null;
  };

  createReview = async (reviewDetails) => {
    const { ReviewModel } = this;
    const {
      reviewText, stars, reviewer, book, likes,
    } = reviewDetails;
    try {
      const review = new ReviewModel({
        reviewText, stars, reviewer, book, likes,
      });
      return await review.save();
    } catch (error) {
      throw new ErrorResponse(error, 400);
    }
  };

  updateReview = async (id, reviewDetails) => {
    const { ReviewModel } = this;
    try {
      const review = await ReviewModel.findByIdAndUpdate(id, reviewDetails, {
        new: true,
        runValidators: true,
      });
      return review;
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  };

  destroyReview = async (value) => {
    const { ReviewModel } = this;
    try {
      await ReviewModel.findOneAndDelete({ ...value });
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  };

  fetchReviews = async () => {
    const { ReviewModel } = this; await ReviewModel.find({}).exec();
  };

  fetchReview = async (value, option = {}) => {
    const { ReviewModel } = this;
    const { populate, select } = option;
    let query = ReviewModel.findOne(value);

    if (select) {
      const fields = select.split(',').join(' ');
      query = query.select(fields);
    }
    if (populate) {
      console.log(populate);
      query = query.populate('likes');
    }
    const user = await query.exec();
    return user;
  };
}

module.exports = ReviewLib;
