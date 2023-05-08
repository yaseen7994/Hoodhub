const User = require('../Models/userModel')
const Category = require('../Models/categoryModel')
const Product = require('../Models/productModel')


const loadAddcategory = async(req,res)=>{
    try {
        const user = await User.findOne({_id:req.session.admin_id})
        res.render('addcategory',{user})
    } catch (error) {
        console.log(error);
        res.render('500')
    }

}

const addcategory = async (req, res) => {

    try {
        const user = req.session.admin_id
        const exist = await Category.find({ category_name: req.body.categoryname });
        if (exist !== "" && req.body.categoryname.trim() !== "" ) {
            const category = new Category({
                category_name: req.body.categoryname,
                description: req.body.description,
                category_image: req.file.filename
            })
            const cataData = await category.save();
            if (cataData) {
                res.redirect('/admin/categorylist');
            } else {
                res.redirect('/admin/addcategory')
            }
        }else {
            res.render('add-category', { message: "This category is already existed", user });
        }
    } catch (error) {
        if (error.code === 11000) {
            res.render('addcategory',{message:'This category is already existed'})
          }
        console.log(error);
        res.render('500')
    }

}



const listCategory = async(req,res)=>{
    try {
        const user = await User.findOne({_id:req.session.admin_id})
        const category = await Category.find()
        res.render('categorylist',{category,user})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const deleteCategory = async(req,res)=>{
    try {
        const id = req.query.id;
        await Product.deleteMany({_id:id})
        await Category.deleteOne({_id:id})
        res.redirect('/admin/categorylist')
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const editCategory = async(req,res)=>{
    try{
        const user = await User.findOne({_id:req.session.admin_id})
        const category = await Category.findOne({_id:req.query.id})
        console.log(category);
        res.render('editcategory',{category:category,user})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const updatecategory = async(req,res)=>{

    try {
        const id = req.query.id
        const exist = await Category.findOne({ category_name: req.body.categoryname});
        console.log(exist);
        if (exist !== "" && req.body.categoryname.trim() !== "" ) {
        const categeryupdate = await Category.findByIdAndUpdate(
            {_id:id},
            {
                $set:{
                    category_name:req.body.categoryname,
                    description: req.body.description,
                    category_image: req.file.filename
                }
            }
        )
        res.redirect('/admin/categorylist') 
    }
    } catch (error) {
        if (error.code === 11000) {
            res.render('addcategory',{message:'This category is already existed'})
          }
        console.log(error);
        res.render('500')
    }
}




module.exports={
    loadAddcategory,
    addcategory,
    listCategory,
    deleteCategory,
    editCategory,
    updatecategory
}