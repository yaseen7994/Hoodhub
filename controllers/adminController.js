const User = require('../Models/userModel')
const Admin = require('../Models/userModel')
const Order = require('../Models/orderModel')

const config = require('../config/config')

const bcrypt = require('bcrypt')




// login------------------------>

const loadLogin = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}


const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const pass = req.body.password;
        const userData = await Admin.findOne({ email: email })
        if (userData) {
            const passwordMatch = await bcrypt.compare(pass, userData.password)
            if (passwordMatch) {
                if (userData.is_admin === 1) {
                    req.session.admin_id = userData;
                    res.redirect('/admin/dashboard')
                }else if(userData.is_admin===0){
                    res.redirect('/')
                }
            } else {
                res.render('login', { message: "password is  incorrect ! " })
            }

        } else {
            res.render('login', { message: "Email and password is incorrect !" })
        }
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}






const Dash = async(req,res)=>{
    try {
        const session = req.session.admin_id
       

        const totalSales = await Order.find({status:"Delivered"})
        let sum = 0 
        for(let i = 0; i<totalSales.length;i++){
            sum = sum+totalSales[i].totel
        }
        const salescount = await Order.find({status:"Delivered"}).count()

        const cod = await Order.find({paymentType:"COD",status:"Delivered"})
        let cod_sum = 0
        for(var i = 0; i<cod.length;i++){
            cod_sum = cod_sum + cod[i].totel
        }

        const upi = await Order.find({paymentType:"UPI" , status:"Delivered"})

        let upi_sum = 0

        for(var i = 0; i<upi.length; i++){
            upi_sum = upi_sum + upi[i].totel
        }

        const wallet = await Order.find({paymentType:"WALLET",status:"Delivered"})

        let wallet_sum = 0

        for(var i = 0;i<wallet.length;i++){
            wallet_sum = wallet_sum + wallet[i].totel
        }

        const methodtotal = cod_sum + upi_sum + wallet_sum

        const upi_percentage = upi_sum / methodtotal * 100
        const wallet_percentage = wallet_sum / methodtotal * 100
        const cod_percentage = cod_sum / methodtotal * 100

        const deliveryCount = await Order.find({status:"Delivered"}).count()
        const confirmedCount = await Order.find({ status: "Confirmed" }).count()
        const cancelledCount = await Order.find({ status: "Cancelled" }).count()
        const returnedCount = await Order.find({ status: "Return" }).count()

        const salesChart = await Order.aggregate([
            {
                $match:{status:"Delivered"}
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    sales: { $sum: '$totel' },
                  },
            },
            {
                $sort:{_id:-1}
            },
            {
                $limit:7
            },
        ])

        const dates = salesChart.map((item)=>{
            return item._id
        })

        const sale = salesChart.map((item)=>{
            return item.sales;
        })

        const salesr = sale.map((x)=>{
            return x;
        })

        const date = dates.reverse()
        const sales = salesr.reverse()

        const user = await Admin.findOne({_id:session})

        res.render('dashboard',{
            user,
            date,
            sales,
            catacount:"",
            deliveryCount,
            cancelledCount,
            returnedCount,
            confirmedCount,
            sum, cod_sum,wallet_sum,upi_sum,
            salescount,
            upi_percentage,
            cod_percentage,
            wallet_percentage
        })
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const salesReportload = async (req , res )=>{
    try {
        const user = await Admin.findOne({ _id: req.session.admin_id })
        const saleData = ""
        res.render('sales-report',{user , saleData})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const salesreport = async(req,res)=>{
    try {
        const session = req.session.admin_id
        const user = await Admin.findOne({_id:session})
        const currentDate = new Date(req.body.from)
        const newDate = new Date(currentDate)
        newDate.setDate(currentDate.getDate()+1)
        console.log(currentDate);
        console.log(newDate);

        if(req.body.from.trim()== '' || req.body.to.trim()==''){
            
    }else{

        const saleData = await Order.find({
            status:"Delivered",
            date:{$gte: new Date(req.body.from),
            $lte:new Date(req.body.to)
        }}).populate({path:"product",populate:{path:"productid",model:'Product'}})
        console.log(saleData)
        res.render('sales-report',{saleData,user})
    }
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}



const adminLogin = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

// logout------------------>
const logout = async(req,res)=>{
    try {
        req.session.admin_id = null
        res.redirect('/admin')
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}



const userlist = async(req,res)=>{
    try {
        const userData = await Admin.find({is_admin:0})
        res.render('userlist',{users:userData})
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}

const blockuser = async(req,res)=>{
    try {
        const userId = req.query.id
        const userData = await Admin.findByIdAndUpdate({_id:userId},{$set:{status:false}})
        res.redirect('/admin/userlist')
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}
 
const unblockuser = async(req,res)=>{
    try {
        const userId = req.query.id
        const userData = await Admin.findByIdAndUpdate({_id:userId},{$set:{status:true}})
        res.redirect('/admin/userlist')
    } catch (error) {
        console.log(error);
        res.render('500')
    }
}



module.exports={
    Dash,
    adminLogin,
    loadLogin,
    verifyLogin,
    logout,
    userlist,
    blockuser,
    unblockuser,
    salesReportload,
    salesreport
}