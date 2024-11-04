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

// item 하나하나마다 재고가 있는지 확인해주는 함수
productController.checkStock = async(item) => {
  // 내가 사려는 재고 정보 들고오기
  const product = await Product.findById(item.productId);

  // 내가 사려는 item qty, 재고 비교
  if(product.stock[item.size] < item.qty) {
    // 재고가 부족하면 메세지와 함께 데이터 반환
    return {isVerify: false, message: `${product.name}의 ${item.size}재고가 부족합니다.`};
  }else {
    // 재고가 충분하면 재고에서 qty만큼 빼주고 저장
    const newStock = {...product.stock};
    newStock[item.size] -= item.qty;
    product.stock = newStock;
    await product.save()
    // 재고가 충분하면 성공 반환
    return {isVerify: true};
  }

}

productController.checkItemListStock = async(itemList) => {
  const insufficientStockItems = [];  // 재고가 불충분한 item을 저장할 예정
  
  // 재고 확인 로직
  await Promise.all(  // 비동기 처리를 여러개 한번에 빠르게 병렬 처리
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStock(item);  // true or false
      if(!stockCheck.isVerify) {  // 재고가 없으면 item 저장
        insufficientStockItems.push({item, message: stockCheck.message});
      }else return stockCheck;
    })  
  )
  return insufficientStockItems
}

module.exports = productController;