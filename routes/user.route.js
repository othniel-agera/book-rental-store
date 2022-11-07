const { Router } = require('express');
// import { validateAuth } from '../middleware/validation';
const { signup, login } = require('../controllers/user.controller');

const router = Router();

router.post('/signup', signup);
router.post('/login', login);

module.exports = router;
