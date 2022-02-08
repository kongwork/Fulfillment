const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Group = require("../models/group");
const Stock = require("../models/stock");
const Order = require("../models/order");

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
    else {
        res.redirect('/')
    }
})

router.post("/edit_group", (req, res) => {
    const edit_group = req.body.edit_group
    const showname  = req.session.username
    if(req.session.login){
        Group.findOne({ _id: edit_group }).exec((err, doc) => {
            res.render("edit_group", { group: doc, showname: showname })
        })
    }
    else {
        res.redirect('/')
    }
})

router.post("/edit_stock", (req, res) => {
    const edit_stock = req.body.edit_stock
    const showname  = req.session.username
    User.find({ typeUser: 'User' }).exec((err, doc_u) => {
        Group.find().exec((err, doct) => {
            if (req.session.login) {
                Stock.findOne({ _id: edit_stock }).exec((err, doc) => {
                    /*if( req.cookies.UpLoadImageFail ) {
                        res.render("edit_stock", { stock: doc,groups: doct, showname: showname, users: doc_u, uploadfail: 'Upload image 3 only' })
                    }
                    else {
                        res.render("edit_stock", { stock: doc,groups: doct, showname: showname, users: doc_u, uploadfail: '' })
                    }*/
                    res.render("edit_stock", { stock: doc,groups: doct, showname: showname, users: doc_u, uploadfail: '' })
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
router.post("/update_stock", (req, res) => {
    upload_img(req, res, function (err) {
        if (err) {
            res.cookie("UpLoadImageFail", true)
            const edit_stock = req.body.stock_id
            const showname  = req.session.username
            User.find({ typeUser: 'User' }).exec((err, doc_u) => {
                Group.find().exec((err, doct) => {
                    if (req.session.login) {
                        Stock.findOne({ _id: edit_stock }).exec((err, doc) => {
                            /*if( req.cookies.UpLoadImageFail ) {
                                res.render("edit_stock", { stock: doc,groups: doct, showname: showname, users: doc_u, uploadfail: 'Upload image 3 only' })
                            }
                            else {
                                res.render("edit_stock", { stock: doc,groups: doct, showname: showname, users: doc_u, uploadfail: '' })
                            }*/
                            res.render("edit_stock", { stock: doc,groups: doct, showname: showname, users: doc_u, uploadfail: 'Upload image 3 only' })
                            //res.clearCookie("UpLoadImageFail")
                        })
                    }
                    else {
                        res.redirect("/")
                    }
                })
            })
        }
        else if(req.session.typeUser == "User"){
            console.log('user update')
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
        else if (!req.files || req.files.length === 0 && req.session.typeUser == "Admin") {
            res.clearCookie("UpLoadImageFail")
            console.log("admin update file 0")
            // ข้อมูลใหม่ที่ส่งมาจาก form edit
            const update_stock = req.body.stock_id
            let date = new Date();
            let data = {
                productName: req.body.productName,
                Group: req.body.Group,
                amount: req.body.amount,
                price: req.body.price,
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
        else if (req.files.length === 3) {
            res.clearCookie("UpLoadImageFail")
            console.log("admin update file 3")
            // ข้อมูลใหม่ที่ส่งมาจาก form edit
            const update_stock = req.body.stock_id
            let date = new Date();
            let data = {
                productName: req.body.productName,
                Group: req.body.Group,
                amount: req.body.amount,
                price: req.body.price,
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
        else if (req.files.length === 2) {
            res.clearCookie("UpLoadImageFail")
            console.log("admin update file 2")
            // ข้อมูลใหม่ที่ส่งมาจาก form edit
            const update_stock = req.body.stock_id
            let date = new Date();
            let data = {
                productName: req.body.productName,
                Group: req.body.Group,
                amount: req.body.amount,
                price: req.body.price,
                customer: req.body.customer,
                imgs: {
                    img01: req.files[0].filename,
                    img02: req.files[1].filename
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
        else if (req.files.length === 1) {
            res.clearCookie("UpLoadImageFail")
            console.log("admin update file 1")
            // ข้อมูลใหม่ที่ส่งมาจาก form edit
            const update_stock = req.body.stock_id
            let date = new Date();
            let data = {
                productName: req.body.productName,
                Group: req.body.Group,
                amount: req.body.amount,
                price: req.body.price,
                customer: req.body.customer,
                imgs: {
                    img01: req.files[0].filename
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
    })
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

module.exports = router;