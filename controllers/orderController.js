const User = require('../Models/userModel');
const Product = require('../Models/productModel')
const Category = require('../Models/categoryModel')
const Banner = require('../Models/bannerModel')
const Coupon = require('../Models/couponModel')
const Order = require('../Models/orderModel')
const Cart = require('../Models/categoryModel')
require('dotenv').config()
const Razorpay = require('razorpay')
const uuid = require('uuid')
const crypto = require("crypto");
const { log } = require('console');
const baritems = require('../controllers/bar')

var instance = new Razorpay({
    key_id:process.env.KEY_ID,
    key_secret:process.env.KEY_SECRET
})


const checkout = async(req,res)=>{
    try {
     
        const id = req.session.user_id
        const user = await User.find({_id:id}).populate("cart.product")
        const cart = await User.find({_id:id})

        const {wishbox,wishlistLength,cartbox,cartlength} = await baritems.homebar(id)

        if(cart[0].cart.length>0){
            res.render('checkout',{user,session:id,cart,cartbox,wishbox,wishlistLength,cartlength})
        }else{
            res.redirect('/cart')
        }
    } catch (error) {
        // console.log(error);
        res.render('500')
    }
}



const apply_coupon = async(req,res)=>{
    try {
        const id =  req.session.user_id
        const code = req.body.couponcode
        const cartTotel = req.body.cartTotel
        const coupondata = await Coupon.findOne({code:code})
        const userused = await Coupon.findOne({code:code, used:{$in:[id]}})
        const currentDate = Date.now()
        if(coupondata){
            if(userused){
                res.json({used:true})
            }else{
                if(currentDate<=coupondata.expiry_date){
                    if(coupondata.min_amount <= cartTotel){
                        let discountAmount = cartTotel * (coupondata.discountpercentage/100)
                        if(discountAmount <= coupondata.maxdiscountprice){
                            let discount_value = discountAmount
                            let value = cartTotel - discount_value

                            const coupon_apply = await User.updateOne(
                                {_id:req.session.user_id},
                                {$set:{cartTotel: value,discount:discountAmount}}
                            )
                            const coupon_used = await Coupon.updateOne(
                                {code:code},
                                {$push:{used:id}}
                            )
                            res.json({success:true,value,discount_value,code})
                        }else{
                            let discount_value = coupondata.maxdiscountprice
                            let value = cartTotel - discount_value
                            const coupon_apply = await User.updateOne(
                                {_id:req.session.user_id},
                                {$set:{cartTotel:value, discount: discount_value}}
                            )
                            const coupon_used = await Coupon.updateOne(
                                {code:code},
                                {$push:{used:id}}
                            )
                            res.json({success:true,value,discount_value,code})
                        }
                        
                    }else{
                        res.json({lessamount:true})
                    }
                }else{
                    res.json({expired:true})
                }
            }
        }else {
            res.json({ invalid: true });
          }
    } catch (error) {
      // console.log(error);  
      res.render('500')
    }
  }

  const remove_coupon = async(req,res)=>{
    try {
        const id =  req.session.user_id
        const code = req.body.couponcode
        const coupondata = await Coupon.findOne({code:code, used:{$in:[id]}})
        if(coupondata){
            const value = cartTotel + coupondata.discount;
            const remove_coupon = await User.updateOne(
                {_id:req.session.user_id},
                {$set:{cartTotel: value}, $pull: {coupons: coupondata._id}}
            )
            const coupon_removed = await Coupon.updateOne(
                {code:code},
                {$pull:{used:id}}
            )
            res.json({success:true, removed:true})
        } else {
            res.json({ notfound: true });
        }
    } catch (error) {
      // console.log(error);  
      res.render('500')
    }
  }

  const place_order = async(req,res)=>{
    try {
        const id = req.session.user_id
        const user = await User.findOne({_id:id})
        const productPush = []
        const orderData = req.body

        if(!Array.isArray(orderData.productId)){
            orderData.productId = [orderData.productId]
        }

        if(!Array.isArray(orderData.qty)){
            orderData.qty = [orderData.qty]
        }

        if(!Array.isArray(orderData.price)){
            orderData.price = [orderData.price]
        }

        for(let i =0; i <orderData.productId.length;i++){
            let productssid = orderData.productId[i]
            let quantitys = orderData.qty[i];
            let singleTotels = orderData.singleTotel[i];
            let price = orderData.price[i];
        

        productPush.push({
            productid:productssid,
            qty:quantitys,
            singleTotel:singleTotels,
            singlePrice:price  
        })
    }

        let status 

        if(req.body.payment_method == "COD"){
            status = "Confirmed"
        }else if(req.body.payment_method=="UPI"){
            status = "confirmed"
        }
        else if(req.body.payment_method == "WALLET"){
        if(user.wallet<orderData.totel){
            res.json({wallet:false})
            return
        } 
        status = "Confirmed"
    }

    const index = req.body.address
    const address = {
        name: user.address[index].name,
        number: user.address[index].number ,
        pincode: user.address[index].pincode ,
        state: user.address[index].state ,
        district : user.address[index].district ,
        place : user.address[index].place ,
        street: user.address[index].street ,
        building: user.address[index].building ,
    }

    const totel = req.body.totel 
    const orderId = `Order#${uuid.v4()}`;
    const order = new Order({
        userId:req.session.user_id,
        address:address,
        product:productPush,
        totel:totel,
        paymentType:req.body.payment_method,
        status: status,
        orderId:orderId
    })

    const neworderData = await order.save()

    if(req.body.payment_method == "COD"){
        res.json({status:true})
    }
    else if (req.body.payment_method == "UPI"){
        const order = await Order.findOne().sort({date:-1})

        let options = {
            amount:req.body.totel * 100,
            currency:"INR",
            receipt:""+order._id,
        }
        instance.orders.create(options,function(err,order){
            res.json({viewRazorpay:true,order})
        })
    }else if (req.body.payment_method == "WALLET"){
        const walupdate = user.wallet - orderData.totel
        await User.updateOne({_id:id},{$set:{wallet:walupdate}})
        res.json({status:true})
    }
    
    } catch (error) {
        // console.log(error);
        res.render('500')
    }
  }

const verify_payment = async(req,res)=>{
    try {
        const id = req.session.user_id
        const latestOrder = await Order.findOne().sort({date:-1})
        const updateOrder = await Order.updateOne(
            {orderId:latestOrder.orderId},
            {$set:{status:"Confirmed"}}
        )
        const details = req.body
        let hmac = crypto.createHmac("sha256",process.env.KEY_SECRET)
        hmac.update(
            details["payment[razorpay_order_id]"] +
            "|"+
            details["payment[razorpay_payment_id]"]
        )
        hmac = hmac.digest("hex")
        if(hmac == details["payment[razorpay_signature]"]){
            res.json({status:true})
        }else{
            res.json({failed:true})
        }
    } catch (error) {
        // console.log(error);
        res.render('500')
    }
}




const order_success = async (req, res) => {
    try {
      const user = req.session.user_id;
      const userdata = await User.findOne({ _id: user });
      const removeing = await User.updateOne(
        { _id: user },
        { $set: { cart: [], cartTotel: 0 } }
      );
      const order = await Order.findOne().sort({ date: -1 }).populate({ path: 'product', populate: { path: 'productid', model: 'Product' } })
  
     
      for (let i = 0; i < order.product.length; i++) {
        await Product.updateOne(
          { _id: order.product[i].productid },
          { $inc: { quantity: -order.product[i].qty } }
        );
      }
  
      const category = await Category.find();
      const {wishbox,wishlistLength,cartbox,cartlength} = await baritems.homebar(user)
      res.render("ordersuccess", { user, category, order, userdata,session:user ,cartbox,wishbox,wishlistLength,cartlength});
    } catch (error) {
  
      res.render('500');
      // console.log(error);
  
    }
  };

  const show_orderlist = async (req, res) => {
    try {
      const id = req.session.user_id
      const user = await User.findOne({ _id: id });
      const orders = await Order.find({ userId: user });
      const category = await Category.find();
      const {wishbox,wishlistLength,cartbox,cartlength} = await baritems.homebar(id)
      res.render("list-orders", { user, category, orders,session:id ,cartbox,wishbox,wishlistLength,cartlength});
    } catch (error) {
      res.render('500');
      // console.log(error);
    }
  
  };

  const cancel_order = async (req, res) => {
    try {
      const orderId = req.body.orderId;
      const userid = req.session.user_id;
  
      const cancel = await Order.updateOne(
        { _id: orderId },
        { $set: { status: "Cancelled" } }
      );
      const orderdata = await Order.findOne({ _id: orderId });
      if (orderdata.paymentType == "UPI") {
        const refund = await User.updateOne(
          { _id: userid },
          { $inc: { wallet: orderdata.totel } }
        );
      }
  
      if (cancel) {
        res.json({ success: true });
      }
    } catch (error) {
      res.render('500');
      // console.log(error);
    }
  };

  const load_order = async(req,res)=>{
    try {
      const user = req.session.admin_id
      const order = await Order.find().populate("userId")
      const user_id = await Order.find()
      
      res.render('orderlist',{order,user,user_id})
    } catch (error) {
      // console.log(error);
      res.render('500')
    }
  }



  

  const retrun_order = async (req, res) => {
    try {
      const order_id = req.body.orderId;
      const retrun_order = await Order.updateOne(
        { _id: order_id },
        { $set: { status: "Return Pending" } }
      );
      res.json({ success: true });
    } catch (error) {
   
      console.log(error.message);
      res.render('500')
    }
  };

const view_order_admin = async(req,res)=>{
  try {
    const user = req.session.admin_id
    const order_id = req.query.id

    const order= await Order.find({_id:order_id}).populate(
      "product.productid"
    )

    const user_id = await Order.find({_id:order_id}).populate('userId')
    res.render('view-order',{user,order,user_id})

  } catch (error) {
    // console.log(error);
    res.render('500')
  }
}

const updateStatus = async (req, res) => {
  try {
    const orderId = req.body.order_Id;

    const status = req.body.status;

    const update = await Order.updateOne(
      { _id: orderId },
      { $set: { status: status } }
    );
    res.json({ success: true });
  } catch (error) {
    // console.log(error);
    res.render('500')
  }
};

const confirm_return = async(req,res)=>{
  try {
    const orderId = req.body.order_Id
    const status = req.body.status
    const order = await Order.find({_id:orderId})
    const wallet = await User.updateOne({_id:order[0].userId},{$inc:{wallet:order[0].totel}})
    const update = await Order.updateOne(
      {_id:orderId},
      {$set:{status:status}}
    );
  } catch (error) {
    // console.log(error);
    res.render('500')
  }
}


const view_order_user = async (req, res) => {

  try {
    const user = true;
    const order_id = req.query.id;
    const category = await Category.find();
    const order = await Order.find({ _id: order_id }).populate(
      "product.productid"
    );
    const id = req.session.user_id

    const {wishbox,wishlistLength,cartbox,cartlength} = await baritems.homebar(id)
    
  res.render("view-order", { order, user, category,session:id,cartbox,cartlength,wishlistLength,wishbox });
  } catch (error) {
    // console.log(error);
    res.render('500')
  }
};



module.exports={
    checkout,
    apply_coupon,
    place_order,
    verify_payment,
    order_success,
    show_orderlist,
    view_order_admin,
    view_order_user,
    cancel_order,
    retrun_order,
    updateStatus,
    load_order,
    confirm_return,
    remove_coupon
  
}