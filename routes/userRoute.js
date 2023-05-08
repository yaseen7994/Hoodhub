// express-------------->
const express = require('express')
const user_router = express()

// auth--------------->
const auth = require('../middileware/userauth')

// set-views---------->
user_router.set('views','./views/users')

// config-space------------->
const config  = require('../config/config')

// control-space------------->
const userController = require('../controllers/userController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const profileController = require('../controllers/profileControll')
const productController = require('../controllers/productController')
const wishlistController = require('../controllers/wishlistController')
const { verify } = require('crypto')


// Start routing ------------------------->

//login  ----------->
user_router.get('/login',auth.isLogout,userController.loginpage)
user_router.post('/login',auth.isLogout,userController.getLogin)
user_router.get('/logout',auth.isLogin, userController.logout);
// signup  ----------->
user_router.get('/signup',auth.isLogout,userController.Signup)
user_router.post('/signup',auth.isLogout,userController.insertUser)
user_router.post('/verifyOtp',auth.isLogout,userController.verifyOtp)
user_router.get('/forget', userController.forgetload);
user_router.post('/forget', userController.forgetverify);
user_router.get('/forget-password', userController.forgetpasswordload);
user_router.post('/forget-password/:id', userController.resetPassword);
user_router.post('/change-password',auth.isLogin, userController.change_password);
user_router.post('/verify_mail',auth.isLogin,userController.send_verfymail)


// home----------------->
user_router.get('/',auth.isLogin,userController.loadHome)
// about us--------------->
user_router.get('/aboutus',userController.laodAbout)

//shop ------------------------->
user_router.get('/shop',productController.loadshop)
user_router.get('/product_view', productController.product_view);
user_router.post('/search', productController.search_product)
user_router.get('/category/:id', productController.loadbycategory)
user_router.get('/sort', productController.sort);
user_router.get('/filterprice');



// contact us--------------->
user_router.get('/contact',userController.laodContact)

// wishlist------------->
user_router.get('/wishlist',auth.isLogin,wishlistController.show_wishlist)
user_router.post('/add_to_wishlist',auth.isLogin,wishlistController.add_wishlist)
user_router.post('/remove_wishlist',auth.isLogin,wishlistController.remove_from_wishlist)
user_router.post('/add_to_cart',auth.isLogin, wishlistController.add_to_cart );

// cart side ----------------->
user_router.get('/cart',auth.isLogin,cartController.show_cart)
user_router.post('/add_cart',auth.isLogin,cartController.add_cart)
user_router.post('/remove_cart',auth.isLogin, cartController.delete_cart);
user_router.post('/changeqty',auth.isLogin, cartController.Qtychange);


// address--------------------------->
user_router.get('/address',auth.isLogin,userController.showAddress)
user_router.get('/add_address',auth.isLogin,profileController.add_address)
user_router.post('/add_address',auth.isLogin,profileController.insert_address)
user_router.get('/edit_address',auth.isLogin,profileController.edit_address)
user_router.post('/edit_address',auth.isLogin,profileController.updateaddress)
user_router.post('/delete_Address',auth.isLogin,profileController.deleteAddress)


// checkout ------------------------>
user_router.get('/checkout',auth.isLogin,orderController.checkout)
// orders payments ----------->
user_router.post('/apply_coupon',auth.isLogin,orderController.apply_coupon)
user_router.post('/remove_coupon',auth.isLogin,orderController.remove_coupon)
user_router.post('/place_order',auth.isLogin,orderController.place_order)
user_router.post('/verify-payment',auth.isLogin,orderController.verify_payment)
user_router.get('/order_success', auth.isLogin, orderController.order_success);

user_router.get('/orders', auth.isLogin, orderController.show_orderlist);
user_router.get('/view-order', auth.isLogin, orderController.view_order_user);
user_router.post('/cancel_order', orderController.cancel_order);
user_router.post('/retrun_order', orderController.retrun_order);


// verify----------->
user_router.get('/verify',userController.verifymail)


// profile------------------->
user_router.get('/profile',auth.isLogin,profileController.userprofile)


user_router.get('/404',userController.load404)


module.exports = user_router

