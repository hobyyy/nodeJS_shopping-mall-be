const mongoose = require('mongoose');
const User = require('./User');
const Product = require('./Product');
const Schema = mongoose.Schema;
const cartSchema = Schema({
  userId: {
    type: mongoose.ObjectId,
    ref: User,
  },
  shipTo: {
    type: String,
    required: true
  },
  contact: {  // 연락처
    type: String,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: "active"
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
    }
  }]
},
  {timestamps:true})

cartSchema.methods.toJSON = function() {
  const obj = this._doc;
  delete obj.password;
  delete obj.__v;
  delete obj.updateAt;
  delete obj.createAt;
  return obj;
}

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;