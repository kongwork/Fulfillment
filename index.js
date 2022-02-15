const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const router = require('./routes/myRouter')
const login_logout = require('./routes/login_logout')
const order = require("./routes/order")
const edit = require("./routes/edit")
const AddData = require("./routes/add_data")
const SearchDataStock = require("./routes/search_data_stock")
const SearchDataGroup = require("./routes/search_data_group")
const SearchDataUser = require("./routes/search_data_user")
const DeleteData = require("./routes/delete")
const ExportFile = require("./routes/export_file_xlsx")
const ImportFile = require("./routes/import_file_xlsx")
const app = express()



app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

app.use(cookieParser())
app.use(express.urlencoded({extended:false}))
app.use(session({secret:"mysession",resave:false,saveUninitialized:false}))
app.use(
    router,
    order,
    login_logout,
    edit,
    AddData,
    SearchDataStock,
    SearchDataGroup,
    SearchDataUser,
    DeleteData,
    ExportFile,
    ImportFile
)
app.use(express.static(path.join(__dirname,'public')))

app.listen(8080,()=>{
    console.log("start server in port 8080")
})