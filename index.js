const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const router = require('./routes/myRouter')
const login = require('./routes/login')
const order = require("./routes/order")
const edit = require("./routes/edit")
const AddData = require("./routes/add_data")
const app = express()



app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

app.use(cookieParser())
app.use(express.urlencoded({extended:false}))
app.use(session({secret:"mysession",resave:false,saveUninitialized:false}))
app.use(router)
app.use(order)
app.use(login)
app.use(edit)
app.use(AddData)
app.use(express.static(path.join(__dirname,'public')))

app.listen(8080,()=>{
    console.log("start server in port 8080")
})