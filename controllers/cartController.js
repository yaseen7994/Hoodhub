const User = require('../Models/userModel')
const Product = require('../Models/productModel')
const Category = require('../Models/categoryModel')
const Order = require('../Models/orderModel')

const show_cart = async (req, res) => {
    try {
        
        const id = req.session.user_id
        const category = await Category.find()
        const user = await User.findOne({ _id: id });
        const totel = user.cartTotel
        const product = await User.findOne({ _id: id }).populate('cart.product')
        const cart = product.cart
        
        res.render('cart', { product, cart, totel, user, category,session:id });

    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const add_cart = async (req, res) => {

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
        console.log(error);
        res.render('500')
    }
}
const delete_cart = async (req, res) => {

    try {
        const userId = req.session.user_id
        const productId = req.body.productId
        const user = await User.findByIdAndUpdate(userId, { $pull: { cart: { product: productId } } }, { new: true });
        console.log(user); // add this line
        const cartTotal = user.cart.reduce((total, item) => total + item.price, 0);
        user.cartTotel = cartTotal;
        res.json({ success: true })
        console.log("okk");
        await user.save();
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}


const Qtychange = async (req, res) => {

    try {
        if (req.session.user_id) {

            const id = req.session.user_id
            const price = req.body.price
            const proid = req.body.productId
            const count = req.body.count

            const product_data = await Product.findOne({ _id: proid })
            // qty increment and decrement 
            const QtyUpadating = await User.updateOne({ _id: id, 'cart.product': proid }, { $inc: { 'cart.$.qty': count } })
            // updating price 
            const currentqty = await User.findOne({ _id: id, 'cart.product': proid }, { _id: 0, 'cart.qty.$': 1 })

           
            const totelPrice = price * currentqty.cart[0].qty
            
            const updatingprice = await User.updateOne({ _id: id, 'cart.product': proid }, { $set: { 'cart.$.price': totelPrice } })

            // grand totel  
            const cart = await User.findOne({ _id: id }).populate('cart.product').exec()
            let sum = 0
            for (let i = 0; i < cart.cart.length; i++) {
                sum = sum + cart.cart[i].price
            }
            const cartTotel = await User.updateOne({ _id: id }, { $set: { cartTotel: sum } })

            res.json({ success: true, totelPrice, sum })

        }

    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

module.exports = {
    show_cart,
    add_cart,
    show_cart,
    delete_cart,
    Qtychange
}