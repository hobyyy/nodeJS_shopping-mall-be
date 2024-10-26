const User = require("../models/User");
const bcrypte = require('bcryptjs');

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
    res.status(400).json({status:'fail',error:error.message})
  }
};

module.exports = authController;