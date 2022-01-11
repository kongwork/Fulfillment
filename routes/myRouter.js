const express = require("express")
const router = express.Router()
const User = require('../models/user')
const Group = require("../models/group")
var nodemailer = require("nodemailer");


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
  /*let order = 1
  User.find().exec((err,doc)=>{
    res.render("group", { users: doc, order: order })
  })*/
})

router.get("/stock", (req, res) => {
  const showname = req.cookies.username
  if(req.cookies.login){
    let order = 1
    User.find().exec((err,doc)=>{
      res.render("stock", { users: doc, order: order, showname: showname })
    })
  }
  else{
    res.redirect('/')
  }
  /*let order = 1
  User.find().exec((err,doc)=>{
    res.render("stock", { users: doc, order: order })
  })*/
})

router.get("/form_AddUser", (req, res) => {
  const showname = req.cookies.username
  if(req.cookies.login){
    res.render("form_AddUser.ejs", { showname: showname })
  }
  else{
    res.redirect('/')
  }
  //res.render("form_AddUser.ejs")
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

router.get("/forgot_password", (req, res) => {
  res.render('forgot_password.ejs')
})

router.get("/change_pass", (req, res) => {
  const a = 'a'
  const t = 1000;
  res.cookie('time',a,{maxAge: t})
  res.render("change_pass");
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
  const name = req.cookies.username;
  let date = new Date();
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

router.post('/send_pass',(req,res)=>{
  const email = req.body.email
  User.findOne({email: email}).exec((err, doc)=>{
    console.log(doc.email)
    console.log(err);
    /*if (email != doc.email) {
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
      res.redirect("/");
    }*/
  })
})

//------------------------------------------------------------------------------------ login
router.post('/login',(req,res)=>{
  const username = req.body.username
  const password = req.body.password
  const t = 3000

  User.findOne({ username: username }).exec((err, doc) => {
    if (username === doc.username && password === doc.password) {
      res.cookie("username", doc.username)
      res.cookie("password", doc.password)
      res.cookie("login", true)
      res.redirect("/user")
      /*req.session.username = 'username';
      req.session.password = 'password';
      req.session.login = true;
      req.session.cookie.maxAge = t
      res.redirect('/g')*/
    }
    else {
      res.redirect("/")
    }
  })
})

router.get("/g", (req, res) => {
  res.render("g");
});

module.exports = router