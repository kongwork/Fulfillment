const express = require("express")
const router = express.Router()
const User = require('../models/user')
const Group = require("../models/group")
const Stock = require("../models/stock")
var nodemailer = require("nodemailer")
const XLSX = require('xlsx')

// อัพโหลดไฟล์
const multer = require("multer")
const storage = multer.diskStorage({
  destination:function (req, file, cb) {
    cb(null, "./public/uploads") //ตำแหน่งเก็บไฟล์
  },
  filename:function (req, file, cb) {
    cb(null, Date.now()+'.xlsx') //เปลี่ยนชื่อไฟล์ ้ป้องกันชื่อไฟล์ซ้ำกัน
  },
})

const upload = multer ({ storage: storage })

/*User.findOne({ username: "kong" }).exec((err, doc) => {
  console.log(doc);
});*/

router.get("/group", (req, res) => {
  const showname = req.cookies.username;
  if(req.cookies.login){
    let order = 1
    Group.find().exec((err, doc) => {
      res.render("group", { groups: doc, order: order, showname: showname });
    });
  }
  else{
    res.redirect('/')
  }
})

router.get("/stock", (req, res) => {
  const showname = req.cookies.username
  if(req.cookies.login){
    let order = 1
    Group.find().exec((err, doct) => {
    /*if (req.cookies.login) {
      Stock.findOne({ _id: edit_stock }).exec((err, doc) => {
        res.render("edit_stock", { stock: doc,groups: doct, showname: showname })
      })
    } else {
      res.redirect("/")
    }*/
      Stock.find().exec((err, doc) => {
        res.render("stock", { stocks: doc, groups: doct, order: order, showname: showname })
      })
    })
    /*Stock.find().exec((err,doc)=>{
      res.render("stock", { stocks: doc, order: order, showname: showname })
    })*/
  }
  else{
    res.redirect('/')
  }
})

router.get("/form_AddUser", (req, res) => {
  const showname = req.cookies.username
  if(req.cookies.login){
    res.render("form_AddUser.ejs", { showname: showname })
  }
  else{
    res.redirect('/')
  }
})

router.get("/form_AddGroup", (req, res) => {
  const showname = req.cookies.username
  if(req.cookies.login){
    res.render("form_AddGroup.ejs", { showname: showname })
  }
  else{
    res.redirect('/')
  }
})

router.get("/form_AddStock", (req, res) => {
  const showname = req.cookies.username
  Group.find().exec((err, doc) => {
    if (req.cookies.login) {
      res.render("form_AddStock.ejs", { showname: showname, groups: doc });
    } else {
      res.redirect("/");
    }
  });
})

router.get("/forgot_password", (req, res) => {
  res.render('forgot_password.ejs')
})

router.get("/change_pass", (req, res) => {
  console.log(req.cookies.email)
  if(req.cookies.changepass){
    res.render("change_pass.ejs");
  }
  else {
    res.redirect('/')
  }
});

router.get('/logout',(req,res)=>{
  res.clearCookie('username')
  res.clearCookie("password")
  res.clearCookie("login")
  res.redirect("/")
})

router.get("/", (req, res) => {
  res.render('index.ejs')
})

/*router.get("/dashboard", (req, res) => {
  res.render("dashboard.ejs")
})*/

router.get("/user", (req, res) => {
  /*console.log("รหัส",req.sessionID)
  console.log("ข้อมูล",req.session)*/
  const showname  = req.cookies.username
  /*let order = 1
  User.find().exec((err,doc)=>{
    res.render("user", { users: doc, order: order})
  })*/
  if(req.cookies.login){
    let order = 1
    User.find().exec((err,doc)=>{
      res.render("user", { users: doc, order: order, showname: showname})
    })
  }
  else{
    res.redirect('/')
  }
})

//------------------------------------------------------------------------------------ ลบข้อมูล User
router.get("/delete/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id,{useFindAndModify:false}).exec(err=>{
    if(err) console.log(err)
    res.redirect('/user')
  })
})

//------------------------------------------------------------------------------------ Delete Data Group
router.get("/delete_group/:id", (req, res) => {
  Group.findByIdAndDelete(req.params.id,{useFindAndModify:false}).exec(err=>{
    if(err) console.log(err)
    res.redirect('/group')
  })
})

//------------------------------------------------------------------------------------ Delete Data Stock
router.get("/delete_stock/:id", (req, res) => {
  Stock.findByIdAndDelete(req.params.id,{useFindAndModify:false}).exec(err=>{
    if(err) console.log(err)
    res.redirect('/stock')
  })
})

//------------------------------------------------------------------------------------ Search Data User
router.post("/search", (req, res) => {
  const showname = req.cookies.username
  if(req.cookies.login){
    let order = 1
    //let query = { username: { $regex: /^MOSY/i } }
    //let username = { username: req.body.search }
    let query = { username: req.body.search }
    /*User.find(query).exec((err, doc) => {
    res.render("search_user", { users: doc, order: order })
    console.log(doc)
  })*/

    input_search_null = req.body.search
    if (input_search_null === "") {
      res.redirect("/user")
    }
    else {
      User.find(query).exec((err, doc) => {
        res.render("search_user", { users: doc, order: order, showname: showname })
        console.log(doc)
      })
    }
  }
  else {
    res.redirect('/')
  }
})

//------------------------------------------------------------------------------------ Search Data Group
router.post("/search_group", (req, res) => {
  const showname = req.cookies.username
  if(req.cookies.login){
    let order = 1
    let query = { groupname: req.body.search }

    input_search_null = req.body.search
    if (input_search_null === "") {
      res.redirect("/group")
    }
    else {
      Group.find(query).exec((err, doc) => {
        res.render("search_group", { groups: doc, order: order, showname: showname })
        console.log(doc)
      })
    }
  }
  else {
    res.redirect('/')
  }
})

//------------------------------------------------------------------------------------ Search Data Stock
router.post("/search_stock", (req, res) => {
  const showname = req.cookies.username
  if(req.cookies.login){
    let order = 1
    let query = { productName: req.body.search }
    let filter = { Group: req.body.filter_group }
    let group_select = req.body.filter_group
    let input_search = '' + req.body.search
    if (group_select === 'ทั้งหมด' && input_search === "") {
      res.redirect("/stock")
    }
    else if (input_search === "" && group_select != 'ทั้งหมด') {
      Group.find().exec((err, doct) => {
        Stock.find(filter).exec((err, doc) => {
          res.render("search_stock", { stocks: doc,groups: doct, order: order, showname: showname, a: group_select, b: input_search })
        })
      })
    }
    else if (input_search != "" && group_select != 'ทั้งหมด') {
      Group.find().exec((err, doct) => {
        Stock.find({ productName: input_search, Group: group_select }).exec((err, doc) => {
          res.render("search_stock", { stocks: doc,groups: doct, order: order, showname: showname, a: group_select, b: input_search })
        })
      })
    }
    else {
      Group.find().exec((err, doct) => {
        Stock.find(query).exec((err, doc) => {
          res.render("search_stock", { stocks: doc,groups: doct, order: order, showname: showname, a: group_select, b: input_search })
        })
      })
    }
  }
  else {
    res.redirect('/')
  }
})

//------------------------------------------------------------------------------------ เอาข้อมูลที่จะแก้ไขไปแสดงใน form
router.post("/edit", (req, res) => {
  /*const edit_user = req.body.edit_user
  User.findOne({_id:edit_user}).exec((err,doc) => {
    res.render('edit_user',({user:doc}))
  })*/
  const edit_user = req.body.edit_user
  const showname  = req.cookies.username
  if(req.cookies.login){
    User.findOne({_id:edit_user}).exec((err,doc) => {
      res.render("edit_user", { user: doc, showname: showname })
    })
  }
  else{
    res.redirect('/')
  }
})

//------------------------------------------------------------------------------------ Edit Data Group
router.post("/edit_group", (req, res) => {
  const edit_group = req.body.edit_group
  const showname  = req.cookies.username
  if(req.cookies.login){
    Group.findOne({ _id: edit_group }).exec((err, doc) => {
      res.render("edit_group", { group: doc, showname: showname })
    })
  }
  else{
    res.redirect('/')
  }
})

//------------------------------------------------------------------------------------ Edit Data Stock
router.post("/edit_stock", (req, res) => {
  const edit_stock = req.body.edit_stock
  const showname  = req.cookies.username
  Group.find().exec((err, doct) => {
    if (req.cookies.login) {
      Stock.findOne({ _id: edit_stock }).exec((err, doc) => {
        res.render("edit_stock", { stock: doc,groups: doct, showname: showname })
      })
    } else {
      res.redirect("/")
    }
  })
  /*if(req.cookies.login){
    Stock.findOne({ _id: edit_stock }).exec((err, doc) => {
      res.render("edit_stock", { stock: doc, showname: showname })
    })
  }
  else{
    res.redirect('/')
  }*/
})

//------------------------------------------------------------------------------------ reset pass
router.post("/re_pass", (req, res) => {
  // ข้อมูลที่ส่งมาจาก form edit
  const pass = req.body.pass
  const pass_confirm = req.body.pass_confirm;
  const email = req.cookies.email
  if(pass ===  pass_confirm){
    console.log(pass)
    console.log(pass)
    let data = {
      password: req.body.pass_confirm,
    };
    User.findOneAndUpdate(email,data,{useFindAndModify:false}).exec(err => {
      res.clearCookie("email")
      res.clearCookie("changepass")
      res.redirect("/")
    })
  }
  /*let data = {
    password: req.body.password,
  }
  // อัพเดตข้อมูล User
  User.findByIdAndUpdate(email,data,{useFindAndModify:false}).exec(err => {
    res.redirect("/user")
  })*/
})

//------------------------------------------------------------------------------------ Update Data User
router.post("/update", (req, res) => {
  // ข้อมูลใหม่ที่ส่งมาจาก form edit
  const update_user = req.body.user_id
  let data = {
    username: req.body.username,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    companyName: req.body.companyName,
    address: req.body.address,
    password: req.body.password,
  }
  // อัพเดตข้อมูล User
  User.findByIdAndUpdate(update_user,data,{useFindAndModify:false}).exec(err => {
    res.redirect("/user")
  })
})

//------------------------------------------------------------------------------------ Update Data Group
router.post("/update_group", (req, res) => {
  // ข้อมูลใหม่ที่ส่งมาจาก form edit
  const update_group = req.body.group_id
  let date = new Date();
  let data = {
    groupname: req.body.groupname,
    lastUpdate: date.toLocaleString("th-TH"),
  }
  // อัพเดตข้อมูล Group
  Group.findByIdAndUpdate(update_group,data,{useFindAndModify:false}).exec(err => {
    res.redirect("/group")
  })
})

router.post("/update_stock", (req, res) => {
  // ข้อมูลใหม่ที่ส่งมาจาก form edit
  const update_stock = req.body.stock_id
  let date = new Date();
  let data = {
    productName: req.body.productName,
    Group: req.body.Group,
    amount: req.body.amount,
    lastUpdate: date.toLocaleString("th-TH"),
  }
  // อัพเดตข้อมูล Group
  Stock.findByIdAndUpdate(update_stock,data,{useFindAndModify:false}).exec(err => {
    res.redirect("/stock")
  })
})

//------------------------------------------------------------------------------------ เพิ่มข้อมูล User
router.post('/insert',(req,res)=>{
  const username = req.body.username
  User.findOne({ username: username }).exec((err, doc) => {
    if (username === doc.username) {
      res.redirect('/g')
    } 
    else {
      let data = new User({
        username: req.body.username,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        companyName: req.body.companyName,
        address: req.body.address,
        password: req.body.password,
      })
      User.saveUser(data, (err) => {
        if (err) console.log(err)
        res.redirect("/user")
      })
    }
  })
  /*let data = new User({
    username: req.body.username,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    companyName: req.body.companyName,
    address: req.body.address,
    password: req.body.password
  })
  User.saveUser(data,(err)=>{
    if(err)
    console.log(err)
    res.redirect('/user')
  })*/
})

//------------------------------------------------------------------------------------ เพิ่มข้อมูล Group
router.post('/insert_group',(req,res)=>{
  const name = req.cookies.username
  let date = new Date()
  let data = new Group({
    groupname: req.body.groupname,
    createdBy: name,
    lastUpdate: date.toLocaleString("th-TH"),
  })
  Group.saveGroup(data,(err)=>{
    if(err)
    console.log(err)
    res.redirect('/group')
  })
})

//------------------------------------------------------------------------------------ เพิ่มข้อมูล Stock
router.post('/insert_stock',(req,res)=>{
  const name = req.cookies.username;
  let date = new Date();
  let data = new Stock({
    productName: req.body.productName,
    Group: req.body.groupname,
    amount: req.body.amount,
    createdBy: name,
    lastUpdate: date.toLocaleString("th-TH"),
  });
  Stock.saveStock(data,(err)=>{
    if(err)
    console.log(err)
    res.redirect('/stock')
  })
})

//------------------------------------------------------------------------------------ ส่งเมล
router.post('/send_pass',(req,res)=>{
  const email = req.body.email
  const time = 30000; //60000 = 1 นาที
  User.findOne({email: email}).exec((err, doc)=>{
    if (email != doc.email) {
      res.redirect('/forgot_password')
    }
    else {
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "kongwork26729@gmail.com",
          pass: "Nongsa26729",
        },
      });

      var mailOptions = {
        from: "kongwork26729@gmail.com",
        to: doc.email,
        subject: "Sending Email using Node.js",
        text: "That was easy!",
        html: '<a href="http://localhost:8080/change_pass">Click here to reset your password</a>',
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      //-------------------------------------------------------------------------------------- สร้าง cookie
      res.cookie("email", doc.email, { maxAge: time });
      res.cookie("changepass", true, { maxAge: time });
      res.redirect("/");
    }
  })
})

//------------------------------------------------------------------------------------ login
router.post('/login',(req,res)=>{
  const username = req.body.username
  const password = req.body.password
  User.findOne({ username: username }).exec((err, doc) => {
    if (!doc) {
      res.redirect('/')
    }
    else {
      if (username === doc.username && password === doc.password) {
        res.cookie("username", doc.username)
        res.cookie("password", doc.password)
        res.cookie("login", true)
        res.redirect("/user")
        /*req.session.username = req.body.username
        req.session.password = req.body.password
        req.session.login = true
        req.session.cookie.maxAge = 30000*/
      }
      else {
        res.redirect("/")
      }
    }
  })
})

//------------------------------------------------------------------------------------ Import file xlsx
router.post('/import_file' , upload.single("filexlsx"), (req, res) => {

  const name = req.cookies.username

  const workbook = XLSX.readFile("./public/uploads/" + req.file.filename);
  const sheetNames = workbook.SheetNames;

  // Get the data of "Sheet1"
  const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

  worksheet.map((doc) => {
    let date = new Date()
    let data = new Stock({
      productName: doc.productName,
      Group: doc.Group,
      amount: doc.amount,
      createdBy: name,
      lastUpdate: date.toLocaleString("th-TH")
    })
    Stock.saveStock(data, (err) => {
      if (err) console.log(err)
    })
  });
  res.redirect('/stock')
})

//------------------------------------------------------------------------------------ Export file xlsx
router.post('/export', (req, res) => {
  let query = { productName: req.body.search }
  let filter = { Group: req.body.filter_group }
  let group_select = req.body.filter_group
  let input_search = '' + req.body.search
  if (group_select === 'ทั้งหมด' && input_search === "") {
    Stock.find().exec((err, doc) => {
      const file_name = Date.now() + ".xlsx"
      let wb = XLSX.utils.book_new()
      if (err) {
        console.log(err)
      }
      else {
        let tem = JSON.stringify(doc)
        tem = JSON.parse(tem)
        let ws = XLSX.utils.json_to_sheet(tem)
        let dow = "./exportfile/" + file_name
        XLSX.utils.book_append_sheet(wb, ws, "sheet1")
        XLSX.writeFile(wb, dow)
        res.redirect('/stock')
      }
    })
  }
  else if (input_search === "" && group_select != 'ทั้งหมด') {
    Stock.find(filter).exec((err, doc) => {
      const file_name = Date.now() + ".xlsx"
      let wb = XLSX.utils.book_new()
      if (err) {
        console.log(err)
      }
      else {
        let tem = JSON.stringify(doc)
        tem = JSON.parse(tem)
        let ws = XLSX.utils.json_to_sheet(tem)
        let dow = "./exportfile/" + file_name
        XLSX.utils.book_append_sheet(wb, ws, "sheet1")
        XLSX.writeFile(wb, dow)
        res.redirect('/stock')
      }
    })
  }
  else if (input_search != "" && group_select != 'ทั้งหมด') {
    Stock.find({ productName: input_search, Group: group_select }).exec((err, doc) => {
      const file_name = Date.now() + ".xlsx"
      let wb = XLSX.utils.book_new()
      if (err) {
        console.log(err)
      }
      else {
        let tem = JSON.stringify(doc)
        tem = JSON.parse(tem)
        let ws = XLSX.utils.json_to_sheet(tem)
        let dow = "./exportfile/" + file_name
        XLSX.utils.book_append_sheet(wb, ws, "sheet1")
        XLSX.writeFile(wb, dow)
        res.redirect('/stock')
      }
    })
  }
  else {
    Stock.find(query).exec((err, doc) => {
      const file_name = Date.now() + ".xlsx"
      let wb = XLSX.utils.book_new()
      if (err) {
        console.log(err)
      }
      else {
        let tem = JSON.stringify(doc)
        tem = JSON.parse(tem)
        let ws = XLSX.utils.json_to_sheet(tem)
        let dow = "./exportfile/" + file_name
        XLSX.utils.book_append_sheet(wb, ws, "sheet1")
        XLSX.writeFile(wb, dow)
        res.redirect('/stock')
      }
    })
  }
})

/*router.get("/g", (req, res) => {
  console.log('รหัส ss = ', req.sessionID)
  console.log("ข้อมูลใน ss = ", req.session);
  res.render("g");
});*/

module.exports = router