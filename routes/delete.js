const express = require("express")
const router = express.Router()
const User = require('../models/user')
const Group = require("../models/group")
const Stock = require("../models/stock")

// Delete Data User
router.get("/delete/:id", (req, res) => {
    User.findByIdAndDelete(req.params.id,{useFindAndModify:false}).exec(err=>{
        if(err) console.log(err)
        res.redirect('/user')
    })
})

// Delete Data Group
router.get("/delete_group/:id", (req, res) => {
    Group.findByIdAndDelete(req.params.id,{useFindAndModify:false}).exec(err=>{
        if(err) console.log(err)
        res.redirect('/group')
    })
})

// Delete Data Stock
router.get("/delete_stock/:id", (req, res) => {
    Stock.findByIdAndDelete(req.params.id,{useFindAndModify:false}).exec(err=>{
        if(err) console.log(err)
        res.redirect('/stock')
    })
})

module.exports = router