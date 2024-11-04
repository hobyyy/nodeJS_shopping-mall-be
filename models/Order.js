const mongoose = require('mongoose');
const User = require('./User');
const Product = require('./Product');
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
{ timestamps: true });

orderSchema.methods.toJSON = function() {
  const obj = this._doc;
  delete obj.password;
  delete obj.__v;
  delete obj.updatedAt;
  delete obj.createdAt;
  return obj;
};

// Prevent OverwriteModelError by checking if model already exists
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = Order;
