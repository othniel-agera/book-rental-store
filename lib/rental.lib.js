const Rental = require('../models/rental.model');
const ErrorResponse = require('../utils/errorResponse.util');
const BookLib = require('./book.lib');
const UserLib = require('./user.lib');

class RentalLib {
  constructor() {
    this.RentalModel = Rental;
    this.bookLib = new BookLib();
    this.userLib = new UserLib();
  }

  checkResourceInDB = async ({ user, book }) => {
    if (user) {
      const isUserInDB = await this.userLib.isUserInDB(user);
      if (!isUserInDB) throw new ErrorResponse(`User with id: ${user} is not in database`, 422);
    }
    if (book) {
      const isBookInDB = await this.bookLib.isBookInDB(book);
      if (!isBookInDB) throw new ErrorResponse(`Book with id: ${book} is not in database`, 422);
    }
    return null;
  };

  createRental = async (reviewDetails) => {
    const { RentalModel } = this;
    const {
      book, user, dueDate, quantity,
    } = reviewDetails;
    let review;
    try {
      review = new RentalModel({
        quantity, dueDate, user, book,
      });
      return await review.save();
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(error, 400);
    }
  };

  updateRental = async (id, reviewDetails) => {
    const { RentalModel } = this;
    try {
      const user = await RentalModel.findByIdAndUpdate(id, reviewDetails, {
        new: true,
        runValidators: true,
      });
      return user;
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  };

  destroyRental = async (value) => {
    const { RentalModel } = this;
    try {
      await RentalModel.findOneAndDelete({ ...value });
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  };

  fetchRentals = async (values = {}) => {
    const { RentalModel } = this;
    const rentals = await RentalModel.find(values).exec();
    return rentals;
  };

  fetchRental = async (value, option = {}) => {
    const { RentalModel } = this;
    const { populate, select } = option;
    let query = RentalModel.findOne(value);

    if (select) {
      const fields = select.split(',').join(' ');
      query = query.select(fields);
    }
    if (populate) {
      query = query.populate(populate);
    }
    const user = await query.exec();
    return user;
  };
}

module.exports = RentalLib;
