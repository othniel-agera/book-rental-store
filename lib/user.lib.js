const User = require('../models/user.model');
const ErrorResponse = require('./errorResponse');

class UserLib {
  constructor() {
    this.UserModel = User;
  }

  createUser = async (userDetails) => {
    const { UserModel } = this;
    const {
      email, username, password, firstname, lastname,
    } = userDetails;
    let user;
    try {
      user = new UserModel({
        email, password, firstname, lastname, username,
      });
      return await user.save();
    } catch (error) {
      throw new ErrorResponse(`${error.message}`, 500);
    }
  };

  destroyUser = async (value) => {
    const { UserModel } = this;
    try {
      await UserModel.findOneAndDelete({ ...value });
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  };

  fetchUsers = async () => {
    const { UserModel } = this; await UserModel.find({}).exec();
  };

  fetchUser = async (value) => {
    const { UserModel } = this; await UserModel.findOne({ ...value }).exec();
  };
}

module.exports = UserLib;
