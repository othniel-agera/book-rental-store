const { Router } = require('express');
const { authenticate } = require('../middlewares/authentication.middleware');
const {
  signup, login, getMe, updateDetails,
} = require('../controllers/user.controller');
const {
  signupValidator,
  loginValidator,
  updateDetailsValidator,
} = require('../utils/validator.util');

const router = Router();

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.get('/me', authenticate, getMe);
router.put('/updatedetails', authenticate, updateDetailsValidator, updateDetails);

module.exports = router;
