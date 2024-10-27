const User = require("../models/User");
const bcrypte = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authController = {};

authController.loginWithEmail = async(req,res) => {
  try {
    const {email, password} = req.body;
    let user = await User.findOne({email});
    if(user) {
      const isMatch = await bcrypte.compare(password, user.password);
      if(isMatch) { // make token
        const token = await user.generateToken();
        return res.status(200).json({status:'success',user,token})
      }else throw new Error('invalid your password')
    }else throw new Error('invalid your email')
  }catch(error) {
    res.status(400).json({status:'fail', error:error.message})
  }
};

authController.authenticate = async(req,res,next) => {
  try {
    const tokenString = req.headers.authorization
    if(!tokenString) throw new Error('Token not found')
    else {
      const token = tokenString.replace('Bearer ','');
      // console.log('token',token);
      jwt.verify(token, JWT_SECRET_KEY, (error,payload) => {
        if(error) throw new Error('invalid token')
        else req.userId = payload._id;
      });
      next();
    }
  }catch(error) {
    res.status(400).json({status:'fail', error:error.message })
  }
}

module.exports = authController;