const Product = require('../models/Product')
const productController = {};
const PAGE_SIZE = 5;  // 한페이지당 몇개 보여줄지

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
    const cond = name 
      ? {name: {$regex:name, $options:'i'}, isDeleted: false} 
      : {isDeleted : false};
    let query = Product.find(cond);
    let response = {status:'success'};
    if(page) {
      query.skip((page-1)*PAGE_SIZE).limit(PAGE_SIZE);
      // 전체 페이지
      // = 전체 데이터 개수 / 페이지 사이즈(PAGE_SIZE)
      const totalItemNum = await Product.countDocuments(cond);
      const totalPageNum = Math.ceil(totalItemNum/PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }
    const products = await query.exec(); // query를 따로 실행
    response.data = products;
    res.status(200).json(response);
  }catch(error) {
    res.status(400).json({status: 'fail', error: error.message})
  }
};

productController.getProductById = async(req,res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if(!product) throw new Error('no item found');
    else res.status(200).json({status: 'success', data: product});
  }catch(error) {
    res.status(400).json({status: 'fail', error: error.message});
  }
};

productController.updateProduct = async(req,res) => {
  try {
    const productId = req.params.id;
    const {sku,name,size,image,category,description,price,stock,status} = req.body;
    const product = await Product.findByIdAndUpdate(
      {_id: productId},
      {sku,name,size,image,category,description,price,stock,status},
      {new:true}
    );
    if(!product) throw new Error("item doesn't exist");
    else res.status(200).json({status: 'success', data: product});
  }catch {
    res.status(400).json({status: 'fail', error: error.message});
  }
}

productController.deleteProduct = async(req,res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      {_id: productId},
      {isDeleted: true}
    )
    if(!product) throw new Error("item can't found");
    else res.status(200).json({status:'success'});
  }catch(error) {
    res.status(400).json({status:'fail', error:error.message});
  }
};

productController.checkStockAvailability = async (item) => {
  const product = await Product.findById(item.productId);

  // 재고가 부족하면 false와 메세지 반환
  if (product.stock[item.size] < item.qty) {
    return { isVerify: false, message: `${product.name}의 ${item.size} 재고가 부족합니다.` };
  }
  return { isVerify: true }; // 재고가 충분하면 true 반환
};

// 모든 아이템의 재고가 충분하다면 실행되는 함수 : item 하나하나 재고 차감
productController.reduceStock = async(itemList) => {
  for (const item of itemList) {
    const product = await Product.findById(item.productId);
    const newStock = { ...product.stock };
    newStock[item.size] -= item.qty;
    product.stock = newStock;
    await product.save();
  }
}

productController.checkItemListStock = async(itemList) => {
  const insufficientStockItems = [];  // 재고가 불충분한 item을 저장할 예정
  
  // 재고 확인 로직
  await Promise.all(  // 비동기 처리를 여러개 한번에 빠르게 병렬 처리
    itemList.map(async (item) => {
      // const stockCheck = await productController.checkStock(item);  // true or false
      const stockCheck = await productController.checkStockAvailability(item);

      if(!stockCheck.isVerify) {  // 재고가 없으면 item 저장
        insufficientStockItems.push({item, message: stockCheck.message});
      }else return stockCheck;
    })  
  )

  // 재고가 부족한 아이템이 있으면 모든 재고 차감을 취소
  if (insufficientStockItems.length > 0) {
    return insufficientStockItems;  // 재고가 부족한 항목을 반환하여 실패 처리
  }

  // 모든 아이템의 재고가 충분하다면 재고 차감
  await productController.reduceStock(itemList);
  return [];  // 빈 배열 반환 (모든 재고 차감 성공)
}

module.exports = productController;