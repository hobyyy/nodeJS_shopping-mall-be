const mongoose = require('mongoose');
const User = require('./User');
const Product = require('./Product');
const Cart = require('./Cart');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userId: {
    type: mongoose.ObjectId,
    ref: User,
  },
  shipTo: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["preparing", "shipping", "delivered", "refund"], // 허용된 값 목록
    default: "preparing"
  },
  orderNum: { // orderNum 필드 추가
    type: String,
    required: true
  },
  items: [{
    productId: {
      type: mongoose.ObjectId,
      ref: Product
    },
    size: {
      type: String,
      required: true
    },
    qty: {
      type: Number,
      default: 1,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    sale: {
      type: Number,
      default: 0,
    }
  }]
}, 
{ timestamps: true });

orderSchema.methods.toJSON = function() {
  const obj = this._doc;
  delete obj.password;
  delete obj.__v;
  // delete obj.updatedAt;
  // delete obj.createdAt;
  return obj;
};

orderSchema.post('save', async function() {
  // 쇼핑백 비우기
  const cart = await Cart.findOne({userId:this.userId});
  cart.items = [];
  await cart.save();
})

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = Order;
