const User = require('../models/user.model');

const createUser = async (userDetails) => {
  const {
    email, username, password, firstname, lastname,
  } = userDetails;
  let user;
  try {
    user = new User({
      email, password, firstname, lastname, username,
    });
    return await user.save();
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};

const destroyUser = async (value) => {
  try {
    await User.findOneAndDelete({ ...value });
  } catch (error) {
    console.log(error);
  }
};

const fetchUsers = async () => { await User.find({}).exec(); };

const fetchUser = async (value) => User.findOne({ ...value }).exec();

module.exports = {
  createUser,
  destroyUser,
  fetchUsers,
  fetchUser,
};
