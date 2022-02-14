const express = require("express")
const router = express.Router()
const User = require('../models/user')

router.post("/search", (req, res) => {
    const showname = req.session.username
    if(req.session.login && req.session.typeUser === 'Admin'){
        let order = 1
        //let query = { username: { $regex: /^MOSY/i } }
        //let username = { username: req.body.search }
        let query = { username: { $regex: '^' + req.body.search, $options : 'i' } }
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
                res.render("search_user", { 
                    users: doc,
                    order: order,
                    showname: showname
                })
                console.log(doc)
            })
        }
    }
    else {
        res.redirect('/')
    }
})

module.exports = router