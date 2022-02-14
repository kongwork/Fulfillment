const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Group = require("../models/group");
const Stock = require("../models/stock");
const Order = require("../models/order");

// login
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
                //res.cookie("login", true)
                req.session.login = true
                //req.session.cookie.maxAge = 30000
                res.redirect("/user_page_group")
            }
            else if (username === doc.username && password === doc.password && doc.typeUser === 'Admin') {
                req.session.username = username
                req.session.password = password
                req.session.typeUser = 'Admin'
                //res.cookie("login", true)
                req.session.login = true
                //req.session.cookie.maxAge = 30000
                res.redirect("/user")
            }
            else {
                res.redirect("/")
            }
        }
    })
})

// logout
router.get('/logout',(req,res)=>{
    req.session.destroy((err) => {
        res.redirect("/")
    })
    /*res.clearCookie('username')
    res.clearCookie("password")
    res.clearCookie("login")
    res.redirect("/")*/
})

module.exports = router;