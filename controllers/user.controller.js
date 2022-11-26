const utility = require('../utils/utility.util');
const UserLib = require('../lib/user.lib');
const asyncHandler = require('../middlewares/async.middleware');
const ErrorResponse = require('../utils/errorResponse.util');

const {
  filterValues, formatValues, hashPassword, comparePasswords, sendTokenResponse,
} = utility;

class AuthController {
  constructor() {
    this.userLib = new UserLib();
  }

  /**
   * @desc Register user
   * @route POST /api/v1/auth/signup
   * @access Public
   */
  signup = asyncHandler(async (req, res, next) => {
    const rawData = req.body;
    const { password } = rawData;
    const encryptedPassword = await hashPassword(password);
    const filteredValues = filterValues(rawData, ['email', 'username', 'password', 'firstname', 'lastname']);
    const formattedValues = formatValues(filteredValues);
    const data = {
      ...formattedValues,
      password: encryptedPassword,
    };
    const existingEmail = await this.userLib.fetchUser({
      email: data.email,
    });
    if (existingEmail) {
      return next(
        new ErrorResponse('Email already taken', 400),
      );
    }
    const existingUsername = await this.userLib.fetchUser({
      username: data.username,
    });
    if (existingUsername) {
      return next(
        new ErrorResponse('Username already taken', 400),
      );
    }

    const user = await this.userLib.createUser(data, next);
    return sendTokenResponse(user, 201, res);
  });

  /**
   * @desc Login user
   * @route POST /api/v1/auth/login
   * @access Public
   */
  login = asyncHandler(async (req, res, next) => {
    // try {
    const rawData = req.body;
    const { password } = rawData;
    const filteredValues = filterValues(rawData, ['email', 'password']);
    const formattedValues = formatValues(filteredValues);
    const data = {
      ...formattedValues,
      password,
    };
    const user = await this.userLib.fetchUserWithPassword({
      email: data.email,
    });
    if (!user) {
      return next(
        new ErrorResponse('Incorrect email or password', 401),
      );
    }
    const passwordMatch = await comparePasswords(password, user.password);
    if (passwordMatch) {
      return sendTokenResponse(user, 200, res);
    }
    return next(
      new ErrorResponse('Incorrect email or password', 401),
    );
    // } catch (error) {
    //   return res.status(500).send({ error: error.message || error });
    // }
  });

  /**
   * @desc Get current logged in user
   * @route GET /api/v1/auth/me
   * @access Private
   */
  getMe = asyncHandler(async (req, res) => {
    const user = await this.userLib.fetchUser(req.user.id);

    res.status(200).json({ success: true, data: user });
  });

  /**
   * @desc Update user details
   * @route PUT /api/v1/auth/updatedetails
   * @access Private
   */
  updateDetails = asyncHandler(async (req, res) => {
    const rawData = req.body;
    const filteredValues = filterValues(rawData, ['username', 'firstname', 'lastname']);
    const formattedValues = formatValues(filteredValues);

    const user = await this.userLib.updateUser(req.user.id, formattedValues);

    res.status(200).json({ success: true, data: user });
  });
}

module.exports = new AuthController();
