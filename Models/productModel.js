const mongoose = require('mongoose')


const productschema = new mongoose.Schema({
    productname:{
        type:String,
        required:true
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    price:{
        type:Number,
        required:true
    },
    offer_price:{
        type:Number,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    productImage:{
        type:Array
    },
    unlist:{
        type:Boolean,
        default:true
    },
    review:[{
        name:{
            type:String
        },
        email:{
            type:String
        },
        rating:{
            type:Number
        },
        comment:{
            type:String
        },
        date:{
            type:Date,
            default:Date.now()
        }
    }]
})

const Product = mongoose.model('Product',productschema)
module.exports = Product