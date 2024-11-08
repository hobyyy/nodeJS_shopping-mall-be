const orderController = {};
const Order = require('../models/Order');
const productController = require('./product.controller');
const {randomStringGenerator} = require('../utils/randomStringGenerator');
const PAGE_SIZE = 3;  // 한페이지당 몇개 보여줄지

orderController.createOrder = async(req,res) => {
  try {
    // fe에서 데이터 보낸거 받아오기
    // userId, shipTo, contact, totalPrice, orderList
    const {userId} = req;
    const {shipTo, contact, totalPrice, orderList, sale} = req.body;

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
      orderNum: randomStringGenerator(), // random한 번호를 뽑아서 orderNum 지정
      sale
    })
    await newOrder.save();
    // save한 후에 쇼핑백을 비워주기 : Order.js에서 처리

    res.status(200).json({status: 'success', orderNum: newOrder.orderNum});
  } catch (error) {
    res.status(400).json({status: 'fail', error: error.message});
  }
};

orderController.getOrderList = async(req,res) => {
  try {
    const {userId} = req;
    const { page = 1, orderNum } = req.query; // page 기본값을 1로 설정

    // 검색조건 합치기
    let cond = {};
    if(orderNum) {
      cond = {
        orderNum: {$regex: orderNum, $options: 'i'}
      }
    }

    // 주문 목록을 페이지네이션하여 가져옵니다
    const orderList = await Order.find(cond)
      .populate('userId')
      .populate({
        path: "items",
        populate: {
          path: "productId",
          model: "Product",
          select: "image name sale",
        },
      })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)

    // 전체 주문 개수를 계산해 총 페이지 수를 구합니다
    const totalItemNum = await Order.find(cond).countDocuments();
    const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      
    res.status(200).json({status: 'success', data: orderList, totalPageNum});
  } catch (error) {
    res.status(400).json({status: 'fail', error: error.message});    
  }
}

orderController.updateOrder = async(req,res) => {
  try {
    const {id} = req.params;
    const {status} = req.body;
    const order = await Order.findByIdAndUpdate(
      id,
      {status: status},
      {new: true}
    );

    if(!order) throw new Error('can not find order');
    res.status(200).json({status: 'success', data: order});
  } catch (error) {
    console.error('Update Order Error:', error.message); // 오류 메시지를 출력합니다.

    res.status(400).json({status: 'fail', error: error.message});
  }
}

module.exports = orderController;