const { Router } = require('express');
const { authenticate } = require('../middlewares/authentication.middleware');
const {
  signup, login, getMe, updateDetails,
} = require('../controllers/user.controller');

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/updatedetails', authenticate, updateDetails);

module.exports = router;
