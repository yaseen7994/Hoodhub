const sessionSecret = "YaseenSecretsession"
const emailUser = "yaseenap148@gmail.com"
const emailpass = "YTqZ@123AS_"

const multer = require('multer')
const path = require('path')

function Storage(){
    const storage = multer.diskStorage({
        destination:function(req,res,cb){
            cb(null,path.join(__dirname,'../public/products_img'))
        }, filename:function(req,file,cb){
            const name = Date.now()+'-'+file.originalname;
            cb(null,name)
        }
    })
    const upload = multer({storage:storage})
    return upload
}



module.exports={
    sessionSecret,
    emailUser,
    emailpass,
    Storage,
    
}