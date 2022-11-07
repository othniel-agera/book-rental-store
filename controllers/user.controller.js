const utility = require('../lib/utility.lib');
const { fetchUser, createUser, destroyUser } = require('../lib/user.lib');

const {
  filterValues, formatValues, hashPassword, createAuthToken, comparePasswords,
} = utility;

const signup = async (req, res) => {
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
    if (existingEmail) return res.json({ Error: 'Email already taken' });

    const existingUsername = await fetchUser({
      username: data.username,
    });
    if (existingUsername) return res.json({ Error: 'Username already taken' });

    user = await createUser(data);
    const { accessToken, refreshToken } = createAuthToken(user.id);

    return res.status(201).json({
      message: 'User created successfully',
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (user && user.id) await destroyUser(user.id, true);
    return res.status(500).send({ error: error.message || error });
  }
};

const login = async (req, res) => {
  try {
    const rawData = req.body;
    const { password } = rawData;
    const filteredValues = filterValues(rawData, ['email', 'password']);
    const formattedValues = formatValues(filteredValues);
    const data = {
      ...formattedValues,
      password,
    };
    const user = await fetchUser({
      email: data.email,
    });
    if (!user) {
      return res.status(400).send({ message: 'Incorrect email or password' });
    }
    const passwordMatch = await comparePasswords(password, user.password);
    const { accessToken, refreshToken } = createAuthToken(user.id);
    if (passwordMatch) {
      return res.status(200).send({
        message: 'Successfully signed in user',
        accessToken,
        refreshToken,
      });
    }
    return res.status(401).send({ message: 'Incorrect email or password' });
  } catch (error) {
    return res.status(500).send({ error: error.message || error });
  }
};
module.exports = { signup, login };
