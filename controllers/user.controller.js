const utility = require('../lib/utility.lib');
const { fetchUser, createUser, destroyUser } = require('../lib/user.lib');
const User = require('../models/user.model');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../lib/errorResponse');

const {
  filterValues, formatValues, hashPassword, comparePasswords, sendTokenResponse,
} = utility;

class AuthController {
  /**
   * @desc Register user
   * @route POST /api/v1/auth/register
   * @access Public
   */
  register = asyncHandler(async (req, res, next) => {
    let user;
    try {
      const rawData = req.body;
      const { password } = rawData;
      const encryptedPassword = await hashPassword(password);
      const filteredValues = filterValues(rawData, ['email', 'username', 'password', 'firstname', 'lastname']);
      const formattedValues = formatValues(filteredValues);
      const data = {
        ...formattedValues,
        password: encryptedPassword,
      };
      const existingEmail = await fetchUser({
        email: data.email,
      });
      if (existingEmail) {
        return next(
          new ErrorResponse('Email already taken', 400),
        );
      }
      const existingUsername = await fetchUser({
        username: data.username,
      });
      if (existingUsername) {
        return next(
          new ErrorResponse('Username already taken', 400),
        );
      }

      user = await createUser(data);
      return sendTokenResponse(user, 200, res);
    } catch (error) {
      if (user && user.id) await destroyUser({ id: user.id });
      return new ErrorResponse({ error: error.message || error });
    }
  });

  /**
   * @desc Login user
   * @route POST /api/v1/auth/login
   * @access Public
   */
  login = asyncHandler(async (req, res, next) => {
    try {
      const rawData = req.body;
      const { password } = rawData;
      const filteredValues = filterValues(rawData, ['email', 'password']);
      const formattedValues = formatValues(filteredValues);
      const data = {
        ...formattedValues,
        password,
      };
      if (!data.email || !password) {
        return next(
          new ErrorResponse('Please provide an email and password', 400),
        );
      }
      const user = await fetchUser({
        email: data.email,
      });
      if (!user) {
        return next(
          new ErrorResponse('Incorrect email or password', 401),
        );
      }
      const passwordMatch = await comparePasswords(password, user.password);
      if (passwordMatch) {
        sendTokenResponse(user, 200, res);
      }
      return res.status(401).send({ message: 'Incorrect email or password' });
    } catch (error) {
      return res.status(500).send({ error: error.message || error });
    }
  });

  /**
   * @desc Get current logged in user
   * @route GET /api/v1/auth/me
   * @access Private
   */
  getMe = asyncHandler(async (req, res) => {
    const user = await fetchUser(req.user.id);

    res.status(200).json({ success: true, data: user });
  });

  /**
   * @desc Update user details
   * @route PUT /api/v1/auth/updatedetails
   * @access Private
   */
  updateDetails = asyncHandler(async (req, res) => {
    const fieldToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };
    const user = await User.findByIdAndUpdate(req.user.id, fieldToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: user });
  });
}

module.exports = new AuthController();
