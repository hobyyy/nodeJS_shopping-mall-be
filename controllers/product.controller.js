const Product = require('../models/Product')
const productController = {};

productController.createProduct = async(req,res) => {
  try {
    const {sku,name,size,image,category,description,price,stock,status} = req.body;
    const product = new Product({sku,name,size,image,category,description,price,stock,status});

    await product.save();
    res.status(200).json({status:'success', product});
  }catch(error) {
    res.status(400).json({status:'fail', error:error.message});
  }
};

productController.getProducts = async(req,res) => {
  try {
    const {page, name} = req.query;
    // if(name) {
    //   // $regex:name ; name이 포함된
    //   // $options:'i' ; 대소문자 구별없이
    //   const products = await Product.find({name: {$regex:name, $options:'i'}});
    // }else {
    //   const products = await Product.find({});
    // }
    // => 검색조건 모두 합쳐보자
    const cond = name ? {name: {$regex:name, $options:'i'}} : {};
    let query = Product.find(cond)
    const products = await query.exec(); // query를 따로 실행
    res.status(200).json({status: 'success', data: products})
  }catch(error) {
    res.status(400).json({status: 'fail', error: error.message})
  }
};

module.exports = productController;