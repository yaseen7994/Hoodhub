const User = require('../Models/userModel');
const Product = require('../Models/productModel')
const Category = require('../Models/categoryModel')
const Banner = require('../Models/bannerModel')
const Coupon = require('../Models/couponModel')
const Order = require('../Models/orderModel')


const userprofile = async(req,res)=>{
    try {
        const category = await Category.find({})
        const id = req.session.user_id
        const user = await User.findOne({_id:id})
        res.render('profile',{user,category,session:id})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const add_address = async(req,res)=>{
    try {
        const user = await User.findOne({})
        const session = req.session.user_id
        let cartbox = []
        const productcart = await User.findOne({ _id: session }).populate('cart.product')
        if (productcart && productcart.cart) {
            cartbox = productcart.cart.slice(0,3)
        }
        res.render('addaddress',{session,cartbox,user})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}



const insert_address = async(req,res)=>{
    try {
        const id = req.session.user_id
        console.log(req.body);
        if(req.body.name.trim()!= "" && req.body.number.trim() !="" && 
        req.body.pincode.trim() !="" &&  req.body.state.trim() !="" && 
        req.body.place.trim() !=""   &&  req.body.street.trim() !=""  
        ){
            const address = await User.updateOne({_id:id},
                {$push:{
                    address:{
                        name: req.body.name,
                        number: req.body.number,
                        pincode: req.body.pincode,
                        state: req.body.state,
                        place: req.body.place,
                        street: req.body.street,
                        building: req.body.building,
                        district: req.body.district,
                        
                    }
                }}
                )
        }else{
            res.render('add_address',{message:'Fill your form'})
            console.log("Fill your form");
        }
      
    } catch (error) {
       console.log(error); 
       res.render('500')
    }
}

const edit_address = async(req,res)=>{
    try {
        const indx=req.query.index
        const user = await User.findOne({})
        const useraddress = await User.findOne({_id:req.session.user_id})
       const address = useraddress.address[indx]
      

        const session = req.session.user_id
        let cartbox = []
        const productcart = await User.findOne({ _id: session }).populate('cart.product')
        if (productcart && productcart.cart) {
            cartbox = productcart.cart.slice(0,3)
        }
        res.render('editaddress',{session,cartbox,user,address})
    } catch (error) {
       console.log(error); 
       res.render('500')
    }

}

const updateaddress = async (req, res) => {
    try {
      const id = req.session.user_id;
      const user = await User.find({ _id: id });
      const index = req.query.index;
      const data = req.body;
      if (id === undefined) {
        res.redirect("/login");
      }
      const key = `address.${index}`;
      if (
        (data.address,
          data.name,
          data.number,
          data.pincode,
          data.state,
          data.place,
          data.street,
          data.building,
          data.district)
      ) {
        const editAddress = {
          name: data.name,
          number: data.number,
          pincode: data.pincode,
          pincode: data.pincode,
          state: data.state,
          place: data.place,
          street: data.street,
          building: data.building,
          district: data.district,
        };
        const updatedAddress = await User.updateOne(
          { _id: id },
          { $set: { [key]: editAddress } }
        );
        if (updatedAddress) {
            
          res.redirect("/edit_address?index=" + index);
        } else {
          res.redirect("/checkout");
        }
      } else {
        res.redirect("/edit_address?index=" + index);
      
      }
    } catch (error) {
      console.log(error);
      res.render('500')
    }
  };
  
  
const deleteAddress = async (req, res) => {
    try {
      const session = req.session.user_id;
      const index = req.body.indexcn;
      console.log(index);
      const deletedAddress = await User.updateOne(
        { _id: session },
        { $unset: { [`address.${index}`]: "" } }
      );
      await User.updateOne({ _id: session }, { $pull: { address: null } });
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.render('500')
    }
  };

module.exports = {
    add_address,
    userprofile,
    edit_address,
    insert_address,
    updateaddress,
    deleteAddress
}