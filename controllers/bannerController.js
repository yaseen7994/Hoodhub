const Banner = require('../Models/bannerModel');
const { updateMany } = require('../Models/userModel');
const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: "dlydqtq1k",
    api_key: "452783757644622",
    api_secret: "Jwkhc8ATV-P97soRkXLEZVCEHto"
  });

const show_banner = async(req,res)=>{
    try {
        res.render('addbanner')
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const add_banner = async (req, res) => {

    try {

        const user = req.session.admin_id
        const title = req.body.title
        const image = req.file.path;
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageURL = uploadResponse.secure_url; 

        const sub_title = req.body.sub_title
        const caption = req.body.caption

        if (image && sub_title.trim() !== "" && title.trim() !== "" ) {

            const banner = new Banner({
                title: title,
                bannerImage: imageURL,
                sub_title: sub_title,
                caption : caption
            })

            const bannerData = await banner.save();
            if (bannerData) {
                res.redirect('/admin/list-banner')
            }
        } else {
            res.render('addbanner', { message: "fill your form", user })
        }
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const show_banner_list = async(req,res)=>{
    try {
        const bannerData = await Banner.find()
        res.render('list-banner',{banner:bannerData})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const delete_banner = async(req,res)=>{
    try {
        const bannerid = req.body.banner
        const data = await Banner.deleteOne({_id:bannerid})
        res.json({ success: true })
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const editbanerload = async(req,res)=>{
    try {
        const id = req.query.id
        const banneredit = await Banner.findOne({_id:id})
        res.render('edit-banner',{banneredit})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const edit_banner = async(req,res)=>{
    try {
        const id = req.body.id
        const caption = req.body.caption
        const title = req.body.title
        const sub_title = req.body.sub_title
        const image = req.file

        const upadate = await Banner.updateOne({_id : id },{
            $set:{
                bannerImage:image,
                caption: caption,
                title : title,
                sub_title : sub_title
            }
        })
        
        const done = await upadate.save()
        if(done){
            res.redirect('/admin/list-banner')
        }

    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

module.exports={
    show_banner,
    add_banner,
    show_banner_list,
    delete_banner,
    edit_banner,
    editbanerload

}