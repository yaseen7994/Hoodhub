const User = require('../Models/userModel')

exports. homebar=async ( session)=> {
    let wishbox = []
    
    const wishlist = await User.findOne({ _id: session }).populate('wishlist.product')
    if (wishlist && wishlist.wishlist && wishlist.wishlist.length > 0) {
      const wishlistLimit = 3;
      wishbox = wishlist.wishlist.slice(0, wishlistLimit).map(item => item.product);
    }
    

    const wishlistLength = wishlist && wishlist.wishlist ? wishlist.wishlist.length : 0;
   
    
    
    let cartbox = []
    const productcart = await User.findOne({ _id: session }).populate('cart.product')
    if (productcart && productcart.cart) {
        cartbox = productcart.cart.slice(0,3)
    }
    const cartlength = productcart && productcart.cart ? productcart.cart.length : 0;

    return {wishbox,wishlistLength,cartbox,cartlength}
} 

 
    


