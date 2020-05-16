const { Router } = require('express');
const authController = require('../controllers/auth');

const router = Router();

router.post('/login', authController.login);

router.use(authController.protect);

router.get('/logout', authController.logout);
router.post('/signup', authController.signup);
router.patch('/updatePassword', authController.updatePassword);

module.exports = router;
