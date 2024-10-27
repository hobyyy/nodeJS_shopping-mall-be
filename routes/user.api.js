const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller')

// 회원가입
router.post('/', userController.createUser);

// header에 넣어서 보내주기때문에 get으로 가능
// token이 valid한 토큰인지(middle ware) -> 해당 token을 가지고 user을 찾아서 return
router.get('/me', authController.authenticate, userController.getUser);

module.exports = router;