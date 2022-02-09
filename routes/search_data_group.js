const express = require("express")
const router = express.Router()
const Group = require("../models/group")

router.post("/search_group", (req, res) => {
    const showname = req.session.username;
    if(req.session.login){
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

module.exports = router