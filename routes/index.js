const express = require('express');
const router = express.Router();
const userAPI = require('./user.api');
const authAPI = require('./auth.api');
const productAPI = require('./product.api');
const cartAPI = require('./cart.api');
const orderAPI = require('./order.api');

router.use('/user', userAPI);
router.use('/auth', authAPI);
router.use('/product', productAPI);
router.use('/cart', cartAPI);
router.use('/order', orderAPI);

module.exports = router;