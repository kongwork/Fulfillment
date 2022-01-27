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
const storage_img = multer.diskStorage({
  destination:function (req, file, cb) {
    cb(null, "./public/uploadsIMG") //ตำแหน่งเก็บไฟล์
  },
  filename:function (req, file, cb) {
    cb(null, Date.now()+'.jpg') //เปลี่ยนชื่อไฟล์ ้ป้องกันชื่อไฟล์ซ้ำกัน
  },
})

const upload = multer ({ storage: storage })
const upload_img = multer({ storage: storage_img })

/*User.findOne({ username: "kong" }).exec((err, doc) => {
  console.log(doc);
});*/

router.get("/group", (req, res) => {
  const showname = req.session.username;
  if(req.session.login && req.session.typeUser == 'Admin'){
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
  const showname = req.session.username
  if(req.session.login){
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
  const showname = req.session.username
  if(req.session.login){
    res.render("form_AddUser.ejs", { showname: showname })
  }
  else{
    res.redirect('/')
  }
})

router.get("/form_AddGroup", (req, res) => {
  const showname = req.session.username
  if(req.session.login  && req.session.typeUser == 'User'){
    res.render("form_AddGroup.ejs", { showname: showname })
  }
  else{
    res.redirect('/')
  }
})

router.get("/form_AddStock", (req, res) => {
  const showname = req.session.username
  Group.find().exec((err, doc) => {
    User.find({typeUser: 'User'}).exec((err, doc_u) => {
      if (req.session.login) {
        res.render("form_AddStock.ejs", { showname: showname, groups: doc, users: doc_u })
      } else {
        res.redirect("/")
      }
    })
  })
})

router.get("/forgot_password", (req, res) => {
  res.render('forgot_password.ejs')
})

router.get("/change_pass", (req, res) => {
  console.log(req.session.email)
  if(req.session.changepass){
    res.render("change_pass.ejs")
  }
  else {
    res.redirect('/')
  }
});

//---------------------------------------------------------------------------- logout
router.get('/logout',(req,res)=>{
  req.session.destroy((err) => {
    res.redirect("/")
  })
  /*res.clearCookie('username')
  res.clearCookie("password")
  res.clearCookie("login")
  res.redirect("/")*/
})

router.get("/", (req, res) => {
  console.log(req.session)
  //res.render('index.ejs', {kong: 'fdfdfdfdfdf'})
  const passfail = 'Username หรือ Password ผิด'
  if(req.session.login_fail != true) {
    res.render("index.ejs", { success: '' })
  }
  else {
    res.render("index.ejs", { success: passfail })
  }
})

/*router.get("/dashboard", (req, res) => {
  res.render("dashboard.ejs")
})*/

router.get("/user", (req, res) => {
  const showname  = req.session.username
  /*let order = 1
  User.find().exec((err,doc)=>{
    res.render("user", { users: doc, order: order})
  })*/
  if(req.session.login && req.session.typeUser === 'Admin'){
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
  const showname = req.session.username
  if(req.session.login && req.session.typeUser === 'Admin'){
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
  const showname = req.session.username;
  if(req.session.login){
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
  const showname = req.session.username
  if(req.session.login){
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

//------------------------------------------------------------------------------------ Product detail
router.post("/view_detail", (req, res) => {
  const id = req.body.detail
  const showname  = req.session.username
  if (req.session.typeUser == 'Admin') {
    User.find({ typeUser: 'User' }).exec((err, doc_u) => {
      Group.find().exec((err, doct) => {
        if (req.session.login) {
          Stock.findOne({ _id: id }).exec((err, doc) => {
            res.render("product_detail", { stock: doc,groups: doct, showname: showname, users: doc_u })
          })
        }
        else {
          res.redirect("/")
        }
      })
    })
  }
  else {
      User.find({ typeUser: 'User' }).exec((err, doc_u) => {
      Group.find().exec((err, doct) => {
        if (req.session.login) {
          Stock.findOne({ _id: id }).exec((err, doc) => {
            res.render("user_page_product_detail", { stock: doc,groups: doct, showname: showname, users: doc_u })
          })
        }
        else {
          res.redirect("/")
        }
      })
    })
  }
  /*User.find({ typeUser: 'User' }).exec((err, doc_u) => {
    Group.find().exec((err, doct) => {
      if (req.session.login) {
        Stock.findOne({ _id: id }).exec((err, doc) => {
          res.render("product_detail", { stock: doc,groups: doct, showname: showname, users: doc_u })
        })
      }
      else {
        res.redirect("/")
      }
    })
  })*/
})

//------------------------------------------------------------------------------------ เอาข้อมูลที่จะแก้ไขไปแสดงใน form
router.post("/edit", (req, res) => {
  /*const edit_user = req.body.edit_user
  User.findOne({_id:edit_user}).exec((err,doc) => {
    res.render('edit_user',({user:doc}))
  })*/
  const edit_user = req.body.edit_user
  const showname  = req.session.username
  if(req.session.login){
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
  const showname  = req.session.username
  if(req.session.login){
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
  const showname  = req.session.username
  User.find({ typeUser: 'User' }).exec((err, doc_u) => {
    Group.find().exec((err, doct) => {
      if (req.session.login) {
        Stock.findOne({ _id: edit_stock }).exec((err, doc) => {
          res.render("edit_stock", { stock: doc,groups: doct, showname: showname, users: doc_u })
        })
      }
      else {
        res.redirect("/")
      }
    })
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
    let data = {
      password: req.body.pass_confirm,
    };
    User.findOneAndUpdate(email,data,{useFindAndModify:false}).exec(err => {
      /*res.clearCookie("email")
      res.clearCookie("changepass")*/
      req.session.destroy((err) => {
        res.redirect("/")
      })
      //res.redirect("/")
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
    typeUser: req.body.typeUser
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
    if(req.session.typeUser == 'User') {
      res.redirect("/user_page_group")
    }
    else {
      res.redirect("/group")
    }
  })
})

//------------------------------------------------------------------------------------ Update Data Stock
router.post("/update_stock", upload_img.array("fileimg", 3), (req, res) => {
  if(req.session.typeUser == "User"){
    const update_stock = req.body.stock_id
    let date = new Date();
    let data = {
      Group: req.body.Group,
      lastUpdate: date.toLocaleString("th-TH")
    }
    Stock.findByIdAndUpdate(update_stock,data,{useFindAndModify:false}).exec(err => {
      if (req.session.typeUser == 'User') {
        res.redirect("/user_page_stock")
      }
      else {
        res.redirect("/stock")
      }
    })
  }
  else if (req.files.filename == null && req.session.typeUser == "Admin") {
    // ข้อมูลใหม่ที่ส่งมาจาก form edit
    const update_stock = req.body.stock_id
    let date = new Date();
    let data = {
      productName: req.body.productName,
      Group: req.body.Group,
      amount: req.body.amount,
      customer: req.body.customer,
      lastUpdate: date.toLocaleString("th-TH"),
    }
    // อัพเดตข้อมูล Group
    Stock.findByIdAndUpdate(update_stock,data,{useFindAndModify:false}).exec(err => {
      if (req.session.typeUser == 'User') {
        res.redirect("/user_page_stock")
      }
      else {
        res.redirect("/stock")
      }
    })
  }
  else {
    // ข้อมูลใหม่ที่ส่งมาจาก form edit
    const update_stock = req.body.stock_id
    let date = new Date();
    let data = {
      productName: req.body.productName,
      Group: req.body.Group,
      amount: req.body.amount,
      customer: req.body.customer,
      imgs: {
        img01: req.files[0].filename,
        img02: req.files[1].filename,
        img03: req.files[2].filename
      },
      lastUpdate: date.toLocaleString("th-TH"),
    }
    // อัพเดตข้อมูล Group
    Stock.findByIdAndUpdate(update_stock,data,{useFindAndModify:false}).exec(err => {
      if (req.session.typeUser == 'User') {
        res.redirect("/user_page_stock")
      }
      else {
        res.redirect("/stock")
      }
    })
  }
  // ข้อมูลใหม่ที่ส่งมาจาก form edit
  /*const update_stock = req.body.stock_id
  let date = new Date();
  let data = {
    productName: req.body.productName,
    Group: req.body.Group,
    amount: req.body.amount,
    customer: req.body.customer,
    imgs: {
      img01: req.files[0].filename,
      img02: req.files[1].filename,
      img03: req.files[2].filename
    },
    lastUpdate: date.toLocaleString("th-TH"),
  };
  // อัพเดตข้อมูล Group
  Stock.findByIdAndUpdate(update_stock,data,{useFindAndModify:false}).exec(err => {
    if (req.session.typeUser == 'User') {
      res.redirect("/user_page_stock")
    }
    else {
      res.redirect("/stock")
    }
  })*/
})

//------------------------------------------------------------------------------------ เพิ่มข้อมูล User
router.post('/insert',(req,res)=>{
  const username = req.body.username
  User.findOne({ username: username }).exec((err, doc) => {
    if (!doc) {
      let data = new User({
        username: req.body.username,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        companyName: req.body.companyName,
        address: req.body.address,
        password: req.body.password,
        typeUser: req.body.typeUser
      })
      User.saveUser(data, (err) => {
        if (err) console.log(err)
        res.redirect("/user")
      })
    } 
    else {
      res.redirect("/form_AddUser")
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
  const name = req.session.username
  let date = new Date()
  let data = new Group({
    groupname: req.body.groupname,
    createdBy: name,
    lastUpdate: date.toLocaleString("th-TH"),
  })
  Group.saveGroup(data,(err)=>{
    if(err)
    console.log(err)
    res.redirect("/user_page_group");
  })
})

//------------------------------------------------------------------------------------ เพิ่มข้อมูล Stock
router.post('/insert_stock', upload_img.array("fileimg", 3), ( req, res ) => {
  const name = req.session.username
  let date = new Date();
  let data = new Stock({
    productID: Date.now(),
    productName: req.body.productName,
    Group: req.body.groupname,
    amount: req.body.amount,
    createdBy: name,
    customer: req.body.customer,
    imgs: {
      img01: req.files[0].filename,
      img02: req.files[1].filename,
      img03: req.files[2].filename
    },
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
    if (!doc) {
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
      /*res.cookie("email", doc.email, { maxAge: time });
      res.cookie("changepass", true, { maxAge: time });*/
      req.session.email = doc.email
      req.session.changepass = true
      req.session.cookie.maxAge = time
      res.redirect("/");
    }
  })
})

//------------------------------------------------------------------------------------ login
router.post('/login',(req,res)=>{
  const username = req.body.username
  const password = req.body.password
  const er = 'pass'
  User.findOne({ username: username }).exec((err, doc) => {
    if (!doc || password != doc.password) {
      req.session.login_fail = true
      req.session.cookie.maxAge = 1000;
      res.redirect('/')
    }
    else {
      if (username === doc.username && password === doc.password && doc.typeUser === 'User') {
        req.session.username = username
        req.session.password = password
        req.session.typeUser = 'User'
        req.session.login = true;
        //req.session.cookie.maxAge = 30000
        res.redirect("/user_page_group")
      }
      else if (username === doc.username && password === doc.password && doc.typeUser === 'Admin') {
        req.session.username = username
        req.session.password = password
        req.session.typeUser = 'Admin'
        req.session.login = true;
        //req.session.cookie.maxAge = 30000
        res.redirect("/user")
      }
      else {
        res.redirect("/")
      }
    }
  })
})

//------------------------------------------------------------------------------------ Import file xlsx
router.post('/import_file' , upload.single("filexlsx"), (req, res) => {

  const name = req.session.username

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
  const xlsx = require("xlsx");
  let query = { productName: req.body.search }
  let filter = { Group: req.body.filter_group }
  let group_select = req.body.filter_group
  let input_search = '' + req.body.search
  if (group_select === 'ทั้งหมด' && input_search === "") {
    Stock.find().exec((err, doc) => {
      const file_name = Date.now() + ".xlsx"
      let wb = xlsx.utils.book_new()
      if (err) {
        console.log(err)
      }
      else {
        console.log()
        let tem = JSON.stringify(doc)
        tem = JSON.parse(tem)
        let ws = xlsx.utils.json_to_sheet(tem)
        let dow = "./exportfile/" + file_name
        xlsx.utils.book_append_sheet(wb, ws, "sheet1")
        xlsx.writeFile(wb, dow)
        res.redirect('/stock')
      }
    })
  }
  else if (input_search === "" && group_select != 'ทั้งหมด') {
    Stock.find(filter).exec((err, doc) => {
      const file_name = Date.now() + ".xlsx"
      let wb = xlsx.utils.book_new()
      if (err) {
        console.log(err)
      }
      else {
        let tem = JSON.stringify(doc)
        tem = JSON.parse(tem)
        let ws = xlsx.utils.json_to_sheet(tem)
        let dow = "./exportfile/" + file_name
        xlsx.utils.book_append_sheet(wb, ws, "sheet1")
        xlsx.writeFile(wb, dow)
        res.redirect('/stock')
      }
    })
  }
  else if (input_search != "" && group_select != 'ทั้งหมด') {
    Stock.find({ productName: input_search, Group: group_select }).exec((err, doc) => {
      const file_name = Date.now() + ".xlsx"
      let wb = xlsx.utils.book_new()
      if (err) {
        console.log(err)
      }
      else {
        let tem = JSON.stringify(doc)
        tem = JSON.parse(tem)
        let ws = xlsx.utils.json_to_sheet(tem)
        let dow = "./exportfile/" + file_name
        xlsx.utils.book_append_sheet(wb, ws, "sheet1")
        xlsx.writeFile(wb, dow)
        res.redirect('/stock')
      }
    })
  }
  else {
    Stock.find(query).exec((err, doc) => {
      const file_name = Date.now() + ".xlsx"
      let wb = xlsx.utils.book_new()
      if (err) {
        console.log(err)
      }
      else {
        let tem = JSON.stringify(doc)
        tem = JSON.parse(tem)
        let ws = xlsx.utils.json_to_sheet(tem)
        let dow = "./exportfile/" + file_name
        xlsx.utils.book_append_sheet(wb, ws, "sheet1")
        xlsx.writeFile(wb, dow)
        res.redirect('/stock')
        console.log(doc)
      }
    })
  }
})

//------------------------------------------------------------------------------------------------------- ส่วนของหน้า Page User ตั้งแต่บรรทัดนี้ลงไป
router.get("/user_page_group", (req, res) => {
  const showname  = req.session.username
  if (req.session.login && req.session.typeUser === 'User') {
    let order = 1
    Group.find({ createdBy: showname }).exec((err, doc) => {
      res.render("user_page_group", { groups: doc, order: order, showname: showname })
    })
  } 
  else {
    res.render("index")
  }
})

router.get("/user_page_stock", (req, res) => {
  const showname  = req.session.username
  if (req.session.login && req.session.typeUser === 'User') {
    let order = 1
    Group.find({ createdBy: showname }).exec((err, doct) => {
      Stock.find({ customer: showname }).exec((err, doc) => {
        res.render("user_page_stock", { stocks: doc, groups: doct, order: order, showname: showname })
      })
    })
  } 
  else {
    res.render("index")
  }
})

router.post("/user_page_edit_group", (req, res) => {
  const edit_group = req.body.edit_group
  const showname  = req.session.username
  if(req.session.login && req.session.typeUser == 'User'){
    Group.findOne({ _id: edit_group }).exec((err, doc) => {
      res.render("user_page_edit_group", { group: doc, showname: showname })
    })
  }
  else{
    res.redirect('/')
  }
})

router.post("/user_page_edit_stock", (req, res) => {
  const edit_stock = req.body.edit_stock
  const showname  = req.session.username
  User.find({ typeUser: 'User' }).exec((err, doc_u) => {
    Group.find({ createdBy: showname }).exec((err, doct) => {
      if (req.session.login && req.session.typeUser == 'User') {
        Stock.findOne({ _id: edit_stock }).exec((err, doc) => {
          res.render("user_page_edit_stock", { stock: doc,groups: doct, showname: showname, users: doc_u })
        })
      }
      else {
        res.redirect("/")
      }
    })
  })
})

module.exports = router