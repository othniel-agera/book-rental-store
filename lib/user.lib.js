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
/*
const destroyUser = async (user_id, is_force_delete = false) => {
  try {
    const user = await Users.findOne({ where: { id: user_id } });
    if (user) {
      await user.destroy({
        where: {
          id: user_id,
        },
        force: is_force_delete,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const fetchUsers = async () => {};

const fetchUser = async (value) => Users.findOne({ where: { ...value } });
 */
module.exports = {
  createUser,
  /* destroyUser,
  fetchUsers,
  fetchUser, */
};
