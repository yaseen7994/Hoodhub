const Coupon  = require('../Models/couponModel');
const User = require('../Models/userModel');


// Coupon route------------->

const loadaddcoupon = async(req,res)=>{
    try {
        const admin = req.session.admin_id
        res.render('addcoupon',{user:admin})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const addcoupon = async(req,res)=>{
    try {

     const user = req.session.admin_id
     const id = req.session.admin_id
    const name = req.body.name;
    const code = req.body.code;
    const date = new Date(req.body.date)
    const start_Date = new Date(req.body.start_Date )
    const maxdiscountprice = req.body.maxdiscountprice;
    const discount_percentage = req.body.discount_percentage;
    const description = req.body.description;
    const min_amount = req.body.min_amount;
    const currentDate = new Date();
    
    if (!code || code.trim().length < 6) {
        return res.render("addcoupon", { messagecode: "Please enter a valid code" });
      }
      if (!code || !code.startsWith("#") || code.trim().length < 6) {
        return res.render("addcoupon", {
          messagecode: "Please enter a valid code starting with #",
        });
      }
     
      if (start_Date.getTime() <= currentDate.getTime()) {
        return res.render("addcoupon", {
          messagedate: "Start date must be after the current date",
        });
      }
  
      if (start_Date.getTime() >= date.getTime() ) {
        return res.render("addcoupon", {
            messageend: "End date must be after the start date",
        });
      }


    if (min_amount.trim() > 0 && description.trim() !== "" && discount_percentage > 0 && maxdiscountprice > 0 && code.trim() !== "" &&name.trim() !== "") {

        const coupon = new Coupon({
            coupon_name:req.body.name,
            description:req.body.description,
            code:req.body.code,
            start_Date:req.body.start_Date,
            expiry_date:req.body.date,
            discountpercentage:req.body.discount_percentage,
            maxdiscountprice:req.body.maxdiscountprice,
            min_amount:req.body.min_amount
        })

        const coupondata = await coupon.save()
        if(coupondata){
            res.redirect('/admin/couponlist')
        }
      }
    } catch (error) {
       console.log(error); 
       res.render('500')
    }
}

const couponlist = async(req,res)=>{
    try {
        const user = await User.findOne({_id:req.session.admin_id})
        const coupon = await Coupon.find()
        res.render('couponlist',{coupon,user})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const editcoupon = async(req,res)=>{
    try {
        const id = req.query.id
        const coupon = await Coupon.find({_id:id})
        res.render('editcoupon',{coupon})
    } catch (error) {
      res.render('500')
      console.log(error);
    }
}

const editingcoupon = async (req, res) => {

    try {

      const user = req.session.admin_id
      const id = req.session.admin_id
     const name = req.body.name;
     const code = req.body.code;
     const date = new Date(req.body.date)
     const start_Date = new Date(req.body.start_Date )
     const discountprice = req.body.discountprice;
     const discount_percentage = req.body.discount_percentage;
     const description = req.body.description;
     const min_amount = req.body.min_amount;
     const currentDate = new Date();
     
     if (!code || code.trim().length < 6) {
         return res.render("editcoupon", { messagecode: "Please enter a valid code" });
       }
       if (!code || !code.startsWith("#") || code.trim().length < 6) {
         return res.render("editcoupon", {
           messagecode: "Please enter a valid code starting with #",
         });
       }
      
   
       if (start_Date.getTime() < currentDate.getTime()) {
         return res.render("editcoupon", {
           messagedate: "Start date must be after the current date",
         });
       }
   
       if (start_Date.getTime() >= date.getTime() ) {
         return res.render("editcoupon", {
             messageend: "End date must be after the start date",
         });
       }
 

      const upadate = await Coupon.updateOne(
        { _id: id },
        {
          $set: {
            coupon_name: name,
            code: code,
            expiry_date: date,
            start_Date:start_Date,
            discountpercentage: discount_percentage,
            description: description,
            maxdiscountprice:  discountprice,
            min_amount: min_amount
          },
        }
      );
  
      res.redirect("/admin/couponlist");
    } catch (error) {
      console.log(error);
      res.render('500')
    }
  
  };

  const coupon_active = async (req, res) => {
    try {
      const coupon_id = req.body.coupid
      const value = req.body.value
      const coupon = await Coupon.updateOne({ _id: coupon_id }, { $set: { active: value } })
      res.json({ success: true })
    } catch (error) {
  
      console.log(error);
    }
  }

  const delete_coupon = async (req, res) => {
    try {
      const id = req.body.couponid;
      const coupon = await Coupon.deleteOne({ _id: id });
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.render('500')
    }
  };






module.exports={
    loadaddcoupon,
    addcoupon,
    couponlist,
    delete_coupon,
    editcoupon,
    editingcoupon,
    coupon_active
    
}