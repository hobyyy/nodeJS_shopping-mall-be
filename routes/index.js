const express = require('express');
const router = express.Router();
const userAPI = require('./user.api');
const authAPI = require('./auth.api');
const productAPI = require('./product.api');

router.use('/user', userAPI);
router.use('/auth', authAPI);
router.use('/product', productAPI);

module.exports = router;