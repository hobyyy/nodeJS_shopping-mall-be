const orderController = {};
const Order = require('../models/Order');
const productController = require('./product.controller');
const {randomStringGenerator} = require('../utils/randomStringGenerator');

orderController.createOrder = async(req,res) => {
  try {
    // fe에서 데이터 보낸거 받아오기
    // userId, shipTo, contact, totalPrice, orderList
    const {userId} = req;
    const {shipTo, contact, totalPrice, orderList} = req.body;

    // 재고 확인 & 업데이트
    const insufficientStockItems = await productController.checkItemListStock(orderList); // 재고가 불충분한 item list 받기
    // console.log('insufficientStockItems',insufficientStockItems);
    // 재고가 충분하지 않은 item이 있으면 => error
    if(insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total,item) => total += item.message, 
        '' // string형으로 반환
      );
      throw new Error(errorMessage)
    }

    // 모든 item이 재고가 충분했으면 order를 만들기
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo: JSON.stringify(shipTo), // shipTo 객체를 JSON 문자열로 변환
      contact: JSON.stringify(contact), // contact 객체를 JSON 문자열로 변환
      items: orderList,
      orderNum: randomStringGenerator() // random한 번호를 뽑아서 orderNum 지정
    })
    await newOrder.save();
    res.status(200).json({status: 'success', orderNum: newOrder.orderNum});
  } catch (error) {
    res.status(400).json({status: 'fail', error: error.message});
  }
};

module.exports = orderController;