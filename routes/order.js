const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Group = require("../models/group");
const Stock = require("../models/stock");
const Order = require("../models/order")
const OrderAddress = require("../models/order_address")

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
            res.render("user_page_cart", { showname: showname, order: doc, num: num, b:0 })
        })
    }
    else {
        res.redirect("/")
    }
})

router.post("/add_order", (req, res) => {
    Order.findOne({ orderID: req.cookies.orderID }).exec((err, doc) => {
        if (!doc) {
            let OrderID = Math.random().toString(36).substring(2)
            res.cookie("orderID", OrderID)
            let data = new Order({
                orderID: OrderID,
                productID: req.body.productID,
                productName: req.body.productName,
                amount: req.body.amount,
                price: req.body.price
            })
            Order.saveOrder(data, (err) => {
                if (err) console.log(err)
                res.redirect("/user_page_stock")
            })
            Stock.findOne({ productID: req.body.productID }).exec((err, doc_s) => {
                let set_amount = parseInt(doc_s.amount) - parseInt(req.body.amount)
                let set_data = {
                    amount: set_amount
                }
                Stock.findByIdAndUpdate( doc_s._id, set_data, {useFindAndModify:false}).exec(err)
            })
        }
        else if (doc) {
            let data = new Order({
                orderID: req.cookies.orderID,
                productID: req.body.productID,
                productName: req.body.productName,
                amount: req.body.amount,
                price: req.body.price
            })
            Order.saveOrder(data, (err) => {
                if (err) console.log(err)
                res.redirect("/user_page_stock")
            })
            Stock.findOne({ productID: req.body.productID }).exec((err, doc_s) => {
                let set_amount = parseInt(doc_s.amount) - parseInt(req.body.amount)
                let set_data = {
                    amount: set_amount
                }
                Stock.findByIdAndUpdate( doc_s._id, set_data, {useFindAndModify:false}).exec(err)
            })
        }
        else {
            let add_amount = parseInt(doc.amount) + parseInt(req.body.amount)
            console.log(doc._id)
            let data = {
                amount: add_amount
            }
            Order.findByIdAndUpdate( doc._id, data, {useFindAndModify:false}).exec(err => {
                res.redirect('/user_page_cart')
            })
            Stock.findOne({ productID: req.body.productID }).exec((err, doc_s) => {
                let set_amount = parseInt(doc_s.amount) - parseInt(req.body.amount)
                let set_data = {
                    amount: set_amount
                }
                Stock.findByIdAndUpdate( doc_s._id, set_data, {useFindAndModify:false}).exec(err)
            })
        }
    })
})

router.post("/delivery", (req, res) => {
    let data = new OrderAddress({
        OrderID: req.cookies.orderID,
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Address: req.body.Address
    })
    OrderAddress.saveOrderAddress(data, (err) => {
        if (err) console.log(err)
        res.clearCookie("orderID")
        res.redirect("/user_page_stock")
    })
})

/*router.post("/insert_order", (req, res) => {
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
})*/

module.exports = router