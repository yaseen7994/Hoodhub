const User = require('../Models/userModel')
const Category = require('../Models/categoryModel')
const Product = require('../Models/productModel')
const baritems = require('../controllers/bar')



const show_wishlist = async(req,res)=>{
try {
    const category = await Category.find({})
    const id = req.session.user_id
    const user = await User.findOne({_id:id})

    const {wishbox,wishlistLength,cartbox,cartlength} = await baritems.homebar(id) 


    const product = await User.findOne({_id:id}).populate('wishlist.product')
   

    const wishlist = product.wishlist
    res.render('wishlist',{product,wishlist,category,user,session:id,cartbox,cartlength,wishlistLength,wishbox})

} catch (error) {
    res.render('500')
    console.log(error);
}
}

const add_wishlist = async(req,res)=>{
    try {
        const id = req.session.user_id
        const proid = req.body.productId

        const data = await User.findOne({_id:id,"wishlist.product":proid})
        if(data){
            res.json({exist:true})
        }else{
            const wishdata = await User.updateOne({_id:id},{$push:{wishlist:{product:proid}}})
            if(wishdata){
                res.json({success:true})
            }
        }
    } catch (error) {
        res.render('500')
        console.log(error);
    }
}

const remove_from_wishlist = async(req,res)=>{
    try {
        const product_id = req.body.productId
        const id = req.session.user_id
        const data = await User.updateOne({_id:id},{$pull:{wishlist:{product:product_id}}})
        res.json({success:true})
    } catch (error) {
        res.render('500')
        console.log(error);
    }
}

const add_to_cart = async (req, res) => {

    try {
        const id = req.session.user_id
            
        const product = req.body.productId
        const price = req.body.price
        const prod = await Product.find({ _id: product })



        let exist = await User.findOne({ _id: id, "cart.product": product });
        if (exist) {
            res.json({ exist: true })
        } else {
            const cartdata = await User.updateOne({ _id: id }, { $push: { cart: { product: product, qty: 1, price: price } } })
            const cart = await User.findOne({ _id: id })
            let sum = 0
            for (let i = 0; i < cart.cart.length; i++) {
                sum = sum + cart.cart[i].price
            }
            const update = await User.updateOne({ _id: id }, { $set: { cartTotel: sum } })
            res.json({ success: true })
        }

    } catch (error) {        
        res.render('500');
        console.log(error.message); 
    }
}

module.exports={
    remove_from_wishlist,
    add_wishlist,
    show_wishlist,
    add_to_cart
}