const User = require('../models/user.model');
const ErrorResponse = require('../utils/errorResponse.util');

class UserLib {
  constructor() {
    this.UserModel = User;
  }

  isUserInDB = async (userId) => {
    const user = await this.fetchUser({ _id: userId });
    if (!user) return false;
    return true;
  };

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

  updateUser = async (id, userDetails) => {
    const { UserModel } = this;
    try {
      const user = await UserModel.findByIdAndUpdate(id, userDetails, {
        new: true,
        runValidators: true,
      });
      return user;
    } catch (error) {
      throw new Error(`${error.message}`);
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
    const { UserModel } = this;
    const users = await UserModel.find({}).exec();
    return users;
  };

  fetchUser = async (value) => {
    const { UserModel } = this;
    const user = await UserModel.findOne({ ...value }).exec();
    return user;
  };

  fetchUserWithPassword = async (value) => {
    const { UserModel } = this;
    const user = await UserModel.findOne({ ...value }).select('password').exec();
    return user;
  };
}

module.exports = UserLib;
