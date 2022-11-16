const Review = require('../models/review.model');
const ErrorResponse = require('../utils/errorResponse.util');

class ReviewLib {
  constructor() {
    this.ReviewModel = Review;
  }

  createReview = async (reviewDetails) => {
    const { ReviewModel } = this;
    const {
      reviewText, stars, user, book, likes,
    } = reviewDetails;
    let review;
    try {
      review = new ReviewModel({
        reviewText, stars, user, book, likes,
      });
      return await review.save();
    } catch (error) {
      throw new ErrorResponse(error, 400);
    }
  };

  updateReview = async (id, reviewDetails) => {
    const { ReviewModel } = this;
    try {
      const user = await ReviewModel.findByIdAndUpdate(id, reviewDetails, {
        new: true,
        runValidators: true,
      });
      return user;
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

  fetchReview = async (value) => {
    const { ReviewModel } = this;
    const user = await ReviewModel.findOne(value).exec();
    return user;
  };
}

module.exports = ReviewLib;
