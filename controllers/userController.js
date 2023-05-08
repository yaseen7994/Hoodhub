const { Number } = require('twilio/lib/twiml/VoiceResponse');
const User = require('../Models/userModel');
const Product = require('../Models/productModel')
const Category = require('../Models/categoryModel')
const Banner = require('../Models/bannerModel')
const Coupon = require('../Models/couponModel')
const Order = require('../Models/orderModel')
const baritems =require('../controllers/bar')
const nodemailer  = require('nodemailer')
const randomstring = require('randomstring')



require('dotenv').config()
const authToken = process.env.TWILIO_AUTH_TOKEN;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const serviceSid = process.env.TWILIO_SERVICE_SID
const client = require("twilio")(accountSid, authToken);

// Secure pass----------------->
const bcrypt = require('bcrypt')
 
const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        res.render('500')
        
    }
}


const sendVerifyMail = async (name, email, user_id) => {
    try {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.emailUser,
                pass: process.env.emailpass,
            }
        });
      
        const mailOptions = {
            from: "HoodHub12@gmail.com",
            to: email,
            subject: 'Verify Your Email',
            html: '<p>Hello '+name+',</p>' +
            '<p>Thank you for registering an account with HoodHub.store! We\'re thrilled to have you as a member of our community. As a valued customer, we hope you\'ll love our products and services.</p>' +
            '<p>Before we get started, we need to verify your email address. Please click the link below to complete the verification process:</p>' +
            '<p><a href="http://hoodhub.store/verify?id='+user_id+'">Verify your email address</a></p>' +
            '<p>Thanks again for joining HoodHub.store. If you have any questions or concerns, please don\'t hesitate to reach out to us.</p>' +
            '<p>Best regards,</p>' +
            '<p>The HoodHub.store Team</p>'+
            '<a href="http://hoodhub.store">Hoodhub.store</a></p>'
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                // console.log(error);
            } else {
                console.log("Email has been sent:-", info.response);
            }
        })
    } catch (error) {
        res.render('500');   
        // console.log(error);
    }
}

const verifymail = async(req,res)=>{
    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });
        res.render('emailverify')
    } catch (error) {
        res.render('500')
    }
}

const send_verfymail = async (req , res)=>{

    try {
       const name = req.body.name
       const email = req.body.email
       const id = req.body.id
     sendVerifyMail( name , email , id );
     res.json({success:true})

    } catch (error) {

                
        res.render('500');
        console.log(error.message); 

    }
} 

// Loginpage and post----------------->

const loginpage = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        res.render('500')
        // console.log(error);
    }
}

const getLogin = async(req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password
        const userData = await User.findOne({email:email})
        if(userData){
            const passwordmatcth = await bcrypt.compare(password,userData.password)
            if(passwordmatcth){
                if(userData.status===true){
                    if (userData.is_admin === 1) {
                        req.session.admin_id = userData;
                        res.redirect('/admin/dashboard')
                    }else{  
                        req.session.user_id = userData;
                        res.redirect('/')
                    }
                }else{ 
                    res.render('login',{message:'Admin blocked your account'})
                }

            }else{
                res.render('login',{message:'password incorrect'})
            }

        }else{
            res.render('login',{message:'your Email is incorrect'})
        }
    } catch (error) {
        res.render('500');
        // console.log(error);
    }
}

const forgetload = async (req, res) => {
    try {
        res.render('forget')
    } catch (error) {
                
        res.render('500');
        // console.log(error); 

    }
}


const forgetverify = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {
            if (userData.is_verified === 0) {
                res.render('forget', { message: "Please verify your email" })
            } else {
                const randomString = randomstring.generate();
                console.log(randomString);
                await User.updateOne({ email: email }, { $set: { token: randomString } })
                sendRestPassMail(userData.name, userData.email, randomString);
                res.render('forget', { message: "Please check your mail to reset your password" })
            }
        } else {
            res.render('forget', { message: "Your email is not registered" })
        }
    } catch (error) {   
        res.render('500');
        console.log(error.message); 
    }
}
 

const forgetpasswordload = async (req, res) => {
    try {
        const token = req.query.token;
        const tokkenData = await User.find({ token: token })
        if (tokkenData) {
            res.render('forget-password', { user: tokkenData[0]._id });
        } else {
            res.render('404', { message: "token is  invalid" })
        }
    } catch (error) {        
        res.render('500');
        // console.log(error); 
    }
}


const resetPassword = async (req, res) => {
    try {
        if (req.body.pass1 === req.body.pass2) {
            const spass = await securePassword(req.body.pass1)
            const user_id = req.params.id
            console.log(user_id);
            const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: spass, token: '' } })
            if (updatedData) {
                res.redirect('/login')
            }
            else {
                res.render('forget-password', { message: "Something Wrong " });
            }
        } else {
            res.render('forget-password', { message: "both password is not same" });
        }
    } catch (error) { 
        res.render('500');
        console.log(error.message); 

    }
}


// Signup and post----------------->

const Signup = async(req,res)=>{
    try {
        res.render('signup')
    } catch (error) {
        res.render('500')
        // console.log(error);
        
    }
}


const insertUser = async(req,res,next)=>{
    const mobile = req.body.number
    try {
        const email = await User.findOne({email:req.body.email})
        if(!email){
            const number = await User.findOne({number:req.body.number})
            if(!number){
                const verifiedResponse = await client.verify.v2
                    .services(serviceSid)
                    .verifications.create({
                    to: `+91${mobile}`,
                    channel: `sms`,
                    });
                    req.session.userData = req.body;  
                res.render("otp-enter")
            }else{
                res.render('signup',{message:"Number already existed "})
            }
        }else{
            res.render('signup',{message:"Email already existed "})
        }
    } catch (error) {
        if (error.code === 429) {
            res.render('/')
          }
        // console.log(error);
          next(error)
        
    }
}




const verifyOtp = async (req, res) => {
    const otp = req.body.otp;
    try {
      const info = req.session.userData;
      const verifiedResponse = await client.verify.v2.services(serviceSid).verificationChecks.create({
        to: `+91${info.number}`,
        code: otp,
      });
      if (verifiedResponse.status === "approved") {
        const passwordHash = await bcrypt.hash(info.password, 10); // hash the password with bcrypt
        const newUserData = new User({
          name: info.name,
          email: info.email,
          number: info.number,
          password: passwordHash,
          is_admin: 0,
          status: true,
        });
        const userData = await newUserData.save();
       
        if (userData) {
          req.session.user_id = userData._id;
          res.redirect("/"); 
          sendVerifyMail(userData.name,userData.email,userData._id);
        } else {
          const errorMessage = "";
          res.render("otp-enter", { errorMessage:'Entered Otp is Incorrect' });
        }
      }
    } catch (error) {
      res.render("500");
    //   console.log(error);
    }
  };



  const sendRestPassMail = async (name, email, token,) => {
    try {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.emailUser,
                pass: process.env.emailPass
            }
        });
        const mailOptions = {
            from: "HoodHub12@gmail.com",
            to: email,
            subject: 'Reset Your Password',
            html: '<p>Hello ' + name + ',</p>' +
                  '<p>We received a request to reset your password for your HoodHub.store account.</p>' +
                  '<p>Please click the link below to reset your password:</p>' +
                  '<p><a href="http://localhost:3000/forget-password?token=' + token + '">Reset Your Password</a></p>' +
                  '<p>If you did not make this request, please ignore this email and your password will remain unchanged.</p>' +
                  '<p>Thank you for using HoodHub.store!</p>' +
                  '<p>Best regards,</p>' +
                  '<p>The HoodHub Team</p>'
          };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                // console.log(error);
            } else {
                console.log("Email has been sent:-", info.response);
            }
        })
    } catch (error) {
        res.render('500');
        console.log(error.message);
    }
}


const change_password = async (req, res) => {
    try {
        
        const id = req.session.user_id
        const user = req.session.user
        const old = req.body.oldPassword
        const newpassword = req.body.pass
        const repassword = req.body.pas
        if (repassword == newpassword) {
            const passwordMatch = await bcrypt.compare(old, user.password);
            if (passwordMatch) {
                const spass = await securePassword(newpassword);
                const user = await User.updateOne({ _id: id }, { $set: { password: spass } });
                

                res.json({ success: true })
            }else{

                res.json({success:false})
            }
            


        }

    } catch (error) {
                
        res.render('500');
        console.log(error.message); 

    }
}



// Home page----------------->
const loadHome = async(req,res)=>{
    try {
        const product = await Product.find()
        const banner = await Banner.find({})
        const session = req.session.user_id
        const user = await User.findOne({_id:session})
        const {wishbox,wishlistLength,cartbox,cartlength} = await baritems.homebar(session) 

        const menscategory  = await Product.find({category:"643a2f030df3e0d8ee669d33"}).populate('category').limit(5).sort({ _id: -1 });
        const womencategory  = await Product.find({category:"643a37b001cd4cf56db167b4"}).populate('category').limit(5).sort({ _id: -1 });
        const kidscategory  = await Product.find({category:"643e4427c786425eae6d313f"}).populate('category').limit(5).sort({ _id: -1 });

        
      
        res.render('home',{
            product,
            session,
            user,
            banner, 
            menscategory,
            womencategory,
            kidscategory,
            wishbox,wishlistLength,cartbox,cartlength
        
        })
    } catch (error) {
        res.render('500')
        // console.log(error);
    }
}

// address ---------------->
const showAddress = async (req, res) => {
    try {
       
        const session = req.session.user_id
        const user = await User.find({ _id: session })
        const {wishbox,wishlistLength,cartbox,cartlength} = await baritems.homebar(session) 
        res.render('shipping', { user ,session,wishbox,wishlistLength,cartbox,cartlength})

    } catch (error) {
        res.render('500');
        // console.log(error);
    }
}

// aboutus--------------------->

const laodAbout = async(req,res)=>{
    try {
        
        const user = await User.findOne({_id:req.session.user_id})
        const usercount = await User.find().count()
        const catcount = await Category.find().count()
        const productcount = await Product.find().count()
        const session = req.session.user_id
       
        
        const {wishbox,wishlistLength,cartbox,cartlength} = await baritems.homebar(session) 
        

        res.render('aboutus',{session,user,cartbox,usercount,catcount,productcount,cartlength,wishbox,wishlistLength})
    } catch (error) {
        res.render('500')
        // console.log(error);
    }
}


// conatct-us--------------------->
const laodContact = async(req,res)=>{
    try {
        const user = await User.findOne({_id:req.session.user_id})
        const session = req.session.user_id
        
        const {wishbox,wishlistLength,cartbox,cartlength} = await baritems.homebar(session) 

        res.render('contact-us',{session,user,cartbox,wishbox,wishlistLength,cartlength})
    } catch (error) {
        res.render('500')
        // console.log(error);
    }
}


// 404----------------->
const load404 = async(req,res)=>{
    try { 
        res.render('404')
    } catch (error) {
    //    console.log(error); 
       res.render('500')
    }
}

const logout = async(req,res)=>{
  
    try {
        req.session.user_id = null
      res.redirect('/login')
    } catch (error) {
        // console.log(error);
        res.render('500')
    }
}







module.exports={
    loginpage,
    loadHome,
    laodAbout,
    laodContact,
    load404,
    Signup,
    insertUser,
    verifyOtp,
    getLogin,
    logout,
    verifymail,
    forgetload,
    forgetverify,
    forgetpasswordload,
    resetPassword,
    send_verfymail,
    showAddress,
    change_password




}