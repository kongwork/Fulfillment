const express = require("express")
const router = express.Router()
const User = require('../models/user')
const Group = require("../models/group")
const Stock = require("../models/stock")
const Order = require("../models/order")

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
        if (req.session.typeUser == 'Admin') {
            res.redirect("/group")
        }
        else {
            res.redirect("/user_page_group")
        }
    })
})

// Delete Data Stock
router.get("/delete_stock/:id", (req, res) => {
    Stock.findByIdAndDelete(req.params.id,{useFindAndModify:false}).exec(err=>{
        if(err) console.log(err)
        res.redirect('/stock')
    })
})

// Delete Data Order
router.get("/delete_order/:id/:b", (req, res) => {
    console.log(req.params.b)
    Order.findOne({ _id: req.params.id }).exec((err, doc_o) => {
        Stock.findOne({ productID: doc_o.productID }).exec((err, doc_s) => {
            let set_amount = { amount: parseInt(doc_o.amount) + parseInt(doc_s.amount) }
            Stock.findByIdAndUpdate( doc_s._id, set_amount, {useFindAndModify:false}).exec(err)
            Order.findByIdAndDelete(req.params.id,{useFindAndModify:false}).exec(err=>{
                if(err) console.log(err)
                res.redirect('/user_page_cart')
            })
        })
    })
})

router.post("/MultiDelete", (req, res) => {
  const checkedItemId = req.body.deleteArray;
  const splitArray = checkedItemId.split(",");
  /*if (checkedItemId == null) {
        res.redirect("/stock")
    }
    else {
        Stock.findByIdAndRemove(checkedItemId, function (err) {
            if (!err)
            console.log("Successfully deletd the Id")
            res.redirect("/stock")
        })
    }*/
    splitArray.forEach((item) => {
        Stock.findByIdAndRemove(item, function (err) {
        if (!err) console.log(`Successfully deleted id: ${item}`);
        });
    });
    res.redirect("/stock");
});

module.exports = router