const express = require("express")
const router = express.Router()
const User = require('../models/user')
const Group = require("../models/group")
const Stock = require("../models/stock")
const Order = require("../models/order")

router.post("/search_stock", (req, res) => {
    const showname = req.session.username
    if(req.session.login){
        let order = 1
        let query = { productName: { $regex: '^' + req.body.search, $options : 'i' } }
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
                    console.log('1')
                })
            })
        }
        else if (input_search != "" && group_select != 'ทั้งหมด') {
            Group.find().exec((err, doct) => {
                Stock.find({ productName: { $regex: '^' + req.body.search, $options : 'i' }, Group: group_select }).exec((err, doc) => {
                    res.render("search_stock", { stocks: doc,groups: doct, order: order, showname: showname, a: group_select, b: input_search })
                    console.log('2')
                })
            })
        }
        else {
            Group.find().exec((err, doct) => {
                Stock.find(query).exec((err, doc) => {
                    res.render("search_stock", { stocks: doc,groups: doct, order: order, showname: showname, a: group_select, b: input_search })
                    console.log('3')
                })
            })
        }
    }
    else {
        res.redirect('/')
    }
})

module.exports = router