const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Group = require("../models/group");
const Stock = require("../models/stock");
const Order = require("../models/order");

router.get("/user_page_order", (req, res) => {
    const showname  = req.session.username
    if (req.session.login && req.session.typeUser === 'User') {
        Stock.find({ customer: showname }).exec((err, doc) => {
            res.render("user_page_order", { stocks: doc, showname: showname })
        })
    } 
    else {
        res.redirect("/")
    }
})

router.get("/user_page_cart", (req, res) => {
    const showname = req.session.username
    let num = 1
    if (req.session.login && req.session.typeUser == "User") {
        Order.find({ orderID: req.cookies.orderID }).exec((err, doc) => {
            res.render("user_page_cart", { showname: showname, order: doc, num: num })
        })
    }
    else {
        res.redirect("/")
    }
    console.log(req.cookies.orderID)
})

router.post("/add_order", (req, res) => {
    let order_id = Math.random().toString(36).substring(2)
    res.cookie("order", true)
    if(req.cookies.order) {
        let data = new Order({
            orderID: req.cookies.orderID,
            productID: req.body.productID,
            productName: req.body.productName,
            amount: req.body.amount
        })
        Order.saveOrder(data, (err) => {
            if (err) console.log(err)
            res.redirect("/user_page_stock")
        })
    }
    else {
        res.cookie("orderID", order_id)
        let data = new Order({
            orderID: order_id,
            productID: req.body.productID,
            productName: req.body.productName,
            amount: req.body.amount
        })
        Order.saveOrder(data, (err) => {
            if (err) console.log(err)
            res.redirect("/user_page_stock")
        })
    }
})

router.post("/insert_order", (req, res) => {
  let id = req.body.productName

  Stock.findOne({ _id: id }).exec((err, doc) => {
    let amountData = parseInt(req.body.amount)
    let amountOrder = doc.amount
    let productName = doc.productName
    let se = amountOrder - amountData

    let dataOrder = new Order({
      customerName: req.body.customerName,
      address: req.body.address,
      productName: productName,
      amount: req.body.amount
    })
    Order.saveOrder(dataOrder, (err) => {
      if (err) console.log(err);
      res.redirect("/user_page_order")
    })

    let data = {
      amount: se
    }
    Stock.findByIdAndUpdate(id, data, { useFindAndModify: false }).exec(err)
  })
})

module.exports = router