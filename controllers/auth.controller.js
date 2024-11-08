const User = require("../models/User");
const bcrypte = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const {randomStringGenerator} = require('../utils/randomStringGenerator');
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const authController = {};

authController.loginWithEmail = async(req,res) => {
  try {
    const {email, password} = req.body;
    let user = await User.findOne({email});
    if(user) {
      const isMatch = await bcrypte.compare(password, user.password);
      if(isMatch) { // make token
        const token = await user.generateToken();
        return res.status(200).json({status: 'success', user, token})
      }else throw new Error('invalid your password')
    }else throw new Error('invalid your email')
  }catch(error) {
    res.status(400).json({status:'fail', error:error.message})
  }
};

authController.loginWithGoogle = async(req,res) => {
  try {
    // 4. 백엔드에서 로그인하기
    // 토큰 값을 읽어와서 -> 유저정보를 뽑아내고 email
    //   a. 이미 로그인 한적이 있는 유저 -> 로그인 시키고 토큰 값 주기
    //   b. 처음 로그인 시도를 하는 유저 -> 유저정보 먼저 새로 생성 -> 로그인 시키고 토큰 값 주기

    const {token} = req.body;
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    })  // google에서 만든 토큰이 맞는지 확인
    const {email, name} = ticket.getPayload();
    let user = await User.findOne({email})
    if(!user) {
      const randomPW = randomStringGenerator();
      const salt = await bcrypte.genSalt(10);
      const newPW = await   bcrypte.hash(randomPW, salt);
      user = new User({
        name,
        email,
        password: newPW
      })
      await user.save();
    } 
    const sessiontToken = await user.generateToken();
    return res.status(200).json({status:'success', user, token:sessiontToken})
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

authController.checkAdminPermission = async(req,res,next) => {
  try {
    const {userId} = req;
    const user = await User.findById(userId);
    if(user.level !== 'admin') throw new Error('no admin permission');
    else next();
  }catch(error) { 
    res.status(400).json({status:'fail', error:error.message})
  }
}
module.exports = authController;