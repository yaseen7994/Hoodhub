const mongoose = require('mongoose')

const categorShcema = new mongoose.Schema({

    category_name:{
        type:String,
        unique:true,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category_image:{
        type:String
    }
})

const Category = mongoose.model('Category',categorShcema)
module.exports = Category ; 