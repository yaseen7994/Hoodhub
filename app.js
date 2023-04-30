const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.MONGO) 

// express------------>
const express = require('express')
const app = express()


// config----------->

const config = require('./config/config')

// session------------>
const session = require('express-session')
const nocache = require('nocache')
app.use(session({
    secret:config.sessionSecret,
    saveUninitialized:true,
    resave:false,
    cookie:{
        maxAge:50000000
    }
}))
app.use(nocache())

// ejs-connect------------>
app.set('view engine','ejs')



// body-parser and json------------>
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

const path = require('path')
app.use(express.static(path.join(__dirname,'public')))

// For User route------------->
const useRoute = require('./routes/userRoute')
app.use('/',useRoute)

// For admin route------------->
const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)




// Server running------------->
app.listen(3000,function(){
    console.log('3000 server running...')
})
