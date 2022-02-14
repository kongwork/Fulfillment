const express = require("express")
const router = express.Router()
const User = require('../models/user')
const Group = require("../models/group")
const Stock = require("../models/stock")
const Order = require("../models/order")
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
const upload_img = multer({ storage: storage_img }).array('fileimg', 3)

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
        if( req.cookies.UpLoadImageFail ) {
          res.render("form_AddStock.ejs", { showname: showname, groups: doc, users: doc_u, uploadfail: 'Upload image 3 only' })
        }
        else {
          res.render("form_AddStock.ejs", { showname: showname, groups: doc, users: doc_u, uploadfail: '' })
        }
      }
      else {
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

router.get("/", (req, res) => {
  console.log(req.session)
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
          user: "", //<<<<<<<<<<<<<<<<<<<<<<<<<<<<< ใส่เมลที่เอาไว้ส่งจดหมายไปหา User
          pass: "", //<<<<<<<<<<<<<<<<<<<<<<<<<<<<< รหัสผ่านเมล
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

//------------------------------------------------------------------------------------------------------- ส่วนของหน้า Page User ตั้งแต่บรรทัดนี้ลงไป


//------------------------------------------------------------------------------------ เพิ่มข้อมูล order
router.get("/user_page_group", (req, res) => {
  const showname  = req.session.username
  if (req.session.login && req.session.typeUser === 'User') {
    let order = 1
    Group.find({ createdBy: showname }).exec((err, doc) => {
      res.render("user_page_group", { groups: doc, order: order, showname: showname })
    })
  } 
  else {
    res.redirect("/")
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
    res.redirect("/")
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