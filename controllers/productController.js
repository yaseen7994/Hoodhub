const Product = require('../Models/productModel')
const Category = require('../Models/categoryModel')
const User = require('../Models/userModel')
const Coupon = require('../Models/couponModel')
const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: "dlydqtq1k",
    api_key: "452783757644622",
    api_secret: "Jwkhc8ATV-P97soRkXLEZVCEHto"
  });

  const baritems = require('../controllers/bar') 


const loadAddproduct = async(req,res)=>{
    try {
        const category = await Category.find()
        res.render('addproduct',{category})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const addProduct = async(req,res)=>{
    try {
        if(req.body.name.trim()!= "" && req.body.category.trim()!= "" && req.body.price > 0 && req.body.quantity > 0 && req.body.offer_price > 0 && req.body.description.trim()!= ""){
            const image = []
            for(file of req.files){
                const result = await cloudinary.uploader.upload(file.path);
                image.push(result.secure_url);
            }

            const product = new Product({
            productname: req.body.name,
            category: req.body.category,
            price: req.body.price,
            quantity: req.body.quantity,
            description: req.body.description,
            offer_price: req.body.offer_price,
            productImage: image,
            })
            const productData = await product.save()

            if(productData){
                res.redirect('/admin/productlist')
            }else{
                res.redirect('/admin/addproduct')
            }
        }
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const productlsit = async(req,res)=>{
    try {
        const product = await Product.find().populate('category')
        res.render('productlist',{product})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const unlistproduct = async(req,res)=>{
    try {
        const product_id = req.query.id
        console.log(product_id);
        const data = await Product.updateOne(
            { _id: product_id },
            { $set: { unlist: false } }
        );
        res.redirect('/admin/productlist')
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const listproduct = async(req,res)=>{
    try {
        const product_id = req.query.id
        console.log(product_id);
        const data = await Product.updateOne(
            {_id:product_id},
            {$set:{unlist: true}}
        )
        res.redirect('/admin/productlist')
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const editproduct = async(req,res)=>{
    try {
        const category = await Category.find()
        const product = await Product.findOne({_id:req.query.id}).populate('category')
        res.render('editproduct',{product,category})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const updateproduct = async(req,res)=>{
    try {
        
        const id = req.query.id
       
            // const image =[]
            for(file of req.files){
                const result = await cloudinary.uploader.upload(file.path);
              let  image = result.secure_url;
            const productUpdate = await Product.updateOne({_id:req.query.id},{$push:{ productImage:image}});

            }
          
       

       await Product.updateOne(
            {_id:id},
            {
                $set:{
                    productname:req.body.name,
                    category:req.body.category,
                    price:req.body.price,
                    offer_price:req.body.offerprice,
                    description:req.body.description,
                    quantity:req.body.quantity,
            
                }
            }
        )
        res.redirect('/admin/productlist')
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}


const deleteimage = async(req,res)=>{
    try{
    const productId = req.query.productId;
    const index = req.query.index
    const deleteimage = await Product.updateOne(
        {_id:productId},
        {$unset:{[`productImage.${index}`]:""}}
    );

        const deleteImages = await Product.updateOne(
            {_id:productId},
            {$pull:{productImage:null}}
        )

        console.log(deleteimage,deleteImages);
            res.redirect('/admin/editproduct?id='+productId)
    }
    catch (error){
      console.log(error);
      res.render('500')
    }
}

const search_product = async (req , res )=>{
    try {
        let user 
        if(req.session.user_id){
            user = true
        }else{
            user = false
        }
        const input = req.body.s
        const result = new RegExp(input,'i')
        const product = await Product.find({productname:result}).populate('category')
        const coupon = await  Coupon.find({active:true})
        const category = await Category.find()
       
        
        res.render('shop',{category,product,user,category_name:"search" ,coupon,countpro:'',session:req.session.user_id})
    } catch (error) {

        res.render('500');
        console.log(error);
        res.render('500')
    }
}




const loadshop = async (req, res) => {
    try {
        let page = 1 
         if(req.query.page){
            page = req.query.page

         }
         let limit = 10
         let user 
        if(req.session.user_id){
            user =true
        }else{
            user = false
        }
       

        const session = req.session.user_id
        const category_name = "ALL Products"
        const product = await Product.find({unlist:true})
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec()
        const count_product = await Product.find().countDocuments()
        let countpro = Math.ceil(count_product / limit)
        const category = await Category.find({})
        const coupon = await Coupon.find({active:true})

        const {wishbox,wishlistLength,cartbox,cartlength} = await baritems.homebar(session) 

        res.render('shop', {session,user,category,category_name,countpro,coupon,product,cartbox,cartlength,wishbox,wishlistLength})
    } catch (error) {
        console.log(error); 
        res.render('500')

    }
}

const loadbycategory = async (req, res) => {

    try {

        let page = 1
        if (req.query.page) {
            page = req.query.page
        }
        let limit = 3
        let user
        if (req.session.user_id) {
            user = true
        } else {
            user = false
        }
        const session = req.session.user_id
        const cat_id = req.params.id
        const category = await Category.find({})
        const cat_name = await Category.findOne({ _id: cat_id })
        const coupon = await Coupon.find({active : true})
        const category_name = cat_name.category_name
        const product = await Product.find({ category: cat_id, unlist: true }).populate("category")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec()
        const count_product = await Product.find().countDocuments()
        let countpro = Math.ceil(count_product / limit)
        const {wishbox,wishlistLength,cartbox,cartlength} = await baritems.homebar(session) 
        res.render('shop', { product,  category_name,cartbox, user, category, countpro ,coupon,session,wishbox,wishlistLength,cartlength })

    } catch (error) {
       
        console.log(error); 
        res.render('500')

    }
}
const sort = async (req, res) => {
    try {
        let page = 1 
        if(req.query.page){
           page = req.query.page

        }
        let limit = 10
        let user 
       if(req.session.user_id){
           user =true
       }else{
           user = false
       }
       
      const sortValue = req.query.value;
      let product;
      if (sortValue == "az") {
        product = await Product.find({}).sort({ productname: 1 });
      } else if (sortValue == "za") {
        product = await Product.find({}).sort({ productname: -1 });
      } else if (sortValue == "high") {
        product = await Product.find({}).sort({ price: -1 });
      } else if (sortValue == "low") {
        product = await Product.find({}).sort({ price: 1 });
      } else {
        product = await Product.find({});
      }
      res.render("product-list", { product, user });
    } catch (error) {
      res.render("500");
      console.log(error);
    }
  };






const product_view = async (req, res) => {
    try {
        let user;
        if (req.session.user_id) {
            user = true;
        } else {
            user = false;
        }
        const session = req.session.user_id
        const products = await Product.find().limit(5); 
        const category = await Category.find({});
        const product = await Product.find({ _id: req.query.name });
        const {wishbox,wishlistLength,cartbox,cartlength} = await baritems.homebar(session) 
    
        res.render("productdetails", { product, user, category, products,session:req.session.user_id ,wishbox,wishlistLength,cartbox,cartlength});
    } catch (error) {
        console.log(error);
        res.render('500')
    }
};

module.exports={ 
    loadAddproduct,
    addProduct,
    productlsit,
    unlistproduct,
    listproduct,
    editproduct,
    deleteimage,
    updateproduct,
    loadshop,
    product_view,
    search_product,
    loadbycategory,
    sort,
}
