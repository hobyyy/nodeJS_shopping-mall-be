const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  level: {
    type: String,
    default: "customer",
    enum: ["customer","admin"], // 2types : customer, admin
    required: true
  }
},{timestamps:true})

userSchema.methods.toJSON = function() {
  const obj = this._doc;
  delete obj.password;
  delete obj.__v;
  delete obj.updateAt;
  delete obj.createAt;
  return obj;
}

const User = mongoose.model("User", userSchema);
module.exports = User;