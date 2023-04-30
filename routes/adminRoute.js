// express-------------->
const express = require('express')
const admin_router = express()

// config and multer --------->
const config = require('../config/config')
const upload  = config.Storage()

// auth----------->

const auth = require('../middileware/adminauth')

// views---------->
admin_router.set('views','./views/admin')

// control-space------------->
const adminController = require('../controllers/adminController')
const productController = require('../controllers/productController')
const categoryController = require('../controllers/categoryController')
const couponController = require('../controllers/couponController')
const banner = require('../controllers/bannerController')
const orderController = require('../controllers/orderController')



// Start routing --------------->

//login----------->
admin_router.get('/',auth.isLogout,adminController.loadLogin)
admin_router.post('/',auth.isLogout,adminController.verifyLogin)
admin_router.get('/logout',auth.isLogin,adminController.logout)

//dashboard----------->
admin_router.get('/dashboard',auth.isLogin,adminController.Dash)

//products----------->
admin_router.get('/products',auth.isLogin)
admin_router.get('/addproduct',auth.isLogin,productController.loadAddproduct)
admin_router.post('/addproduct',auth.isLogin,upload.array('image', 4),productController.addProduct)
admin_router.get('/productlist',auth.isLogin,productController.productlsit)
admin_router.get('/unlistproduct',auth.isLogin,productController.unlistproduct)
admin_router.get('/listproduct',auth.isLogin,productController.listproduct)
admin_router.get('/editproduct',auth.isLogin,productController.editproduct)
admin_router.post('/editproduct',auth.isLogin,upload.array('image', 4),productController.updateproduct)
admin_router.get('/deleteimage',auth.isLogin,productController.deleteimage)


// category route------------->
admin_router.get('/addcategory',auth.isLogin,categoryController.loadAddcategory)
admin_router.post('/addcategory',auth.isLogin,upload.single('catimage'),categoryController.addcategory)
admin_router.get('/categorylist',auth.isLogin,categoryController.listCategory)
admin_router.get('/editcategory',auth.isLogin,categoryController.editCategory)
admin_router.post('/editcategory',auth.isLogin,upload.single('catimage'),categoryController.updatecategory)
admin_router.get('/deletecategory',auth.isLogin,categoryController.deleteCategory)

// coupon route---------------------->
admin_router.get('/addcoupon',auth.isLogin,couponController.loadaddcoupon)
admin_router.post('/addcoupon',auth.isLogin,couponController.addcoupon)
admin_router.get('/couponlist',auth.isLogin,couponController.couponlist)
admin_router.get('/editcoupon',auth.isLogin,couponController.editcoupon)
admin_router.post('/editcoupon',auth.isLogin,couponController.editingcoupon)
admin_router.post('/deletecoupon',auth.isLogin,couponController.delete_coupon)
admin_router.post('/couponactive',auth.isLogin,couponController.coupon_active)

// banner route---------------------->
admin_router.get('/add-banner', auth.isLogin, banner.show_banner)
admin_router.post('/add-banner', auth.isLogin, upload.single('image'), banner.add_banner)
admin_router.get('/list-banner', auth.isLogin, banner.show_banner_list)
admin_router.post('/delete-banner', auth.isLogin,banner.delete_banner);
admin_router.get('/edit-banner',auth.isLogin, banner.editbanerload);
admin_router.post('/edit-banner',auth.isLogin, banner.edit_banner);

// userlist -------------------->
admin_router.get('/userlist',auth.isLogin,adminController.userlist)
admin_router.get('/block-user',auth.isLogin,adminController.blockuser)
admin_router.get('/unblock-user',auth.isLogin,adminController.unblockuser)
admin_router.get('/delete-user',auth.isLogin,adminController.unblockuser)

// orders-------------------------->
admin_router.get('/list-order',auth.isLogin,orderController.load_order)
admin_router.get('/view-order',auth.isLogin,orderController.view_order_admin)
admin_router.post('/update_status',auth.isLogin, orderController.updateStatus)
admin_router.post('/confirm_return',orderController.confirm_return)

// salesreport- -------------->
admin_router.get('/sales-report',auth.isLogin,adminController.salesReportload)
admin_router.post('/sales-report',auth.isLogin,adminController.salesreport)



admin_router.get('*', (req, res) => {
    res.redirect('/admin/dashboard')
})


module.exports = admin_router 

