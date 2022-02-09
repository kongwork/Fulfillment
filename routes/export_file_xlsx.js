const express = require("express")
const router = express.Router()
const Stock = require("../models/stock")
const xlsx = require("xlsx")

// Export file xlsx
router.post('/export', (req, res) => {
    let query = { productName: req.body.search }
    let filter = { Group: req.body.filter_group }
    let group_select = req.body.filter_group
    let input_search = '' + req.body.search
    if (group_select === 'ทั้งหมด' && input_search === "") {
        Stock.find().exec((err, doc) => {
            const file_name = Date.now() + ".xlsx"
            let wb = xlsx.utils.book_new()
            if (err) {
                console.log(err)
            }
            else {
                let tem = JSON.stringify(doc)
                tem = JSON.parse(tem)
                let ws = xlsx.utils.json_to_sheet(tem)
                let dow = "./exportfile/" + file_name
                xlsx.utils.book_append_sheet(wb, ws, "sheet1")
                xlsx.writeFile(wb, dow)
                res.redirect('/stock')
            }
        })
    }
    else if (input_search === "" && group_select != 'ทั้งหมด') {
        Stock.find(filter).exec((err, doc) => {
            const file_name = Date.now() + ".xlsx"
            let wb = xlsx.utils.book_new()
            if (err) {
                console.log(err)
            }
            else {
                let tem = JSON.stringify(doc)
                tem = JSON.parse(tem)
                let ws = xlsx.utils.json_to_sheet(tem)
                let dow = "./exportfile/" + file_name
                xlsx.utils.book_append_sheet(wb, ws, "sheet1")
                xlsx.writeFile(wb, dow)
                res.redirect('/stock')
            }
        })
    }
    else if (input_search != "" && group_select != 'ทั้งหมด') {
        Stock.find({ productName: input_search, Group: group_select }).exec((err, doc) => {
            const file_name = Date.now() + ".xlsx"
            let wb = xlsx.utils.book_new()
            if (err) {
                console.log(err)
            }
            else {
                let tem = JSON.stringify(doc)
                tem = JSON.parse(tem)
                let ws = xlsx.utils.json_to_sheet(tem)
                let dow = "./exportfile/" + file_name
                xlsx.utils.book_append_sheet(wb, ws, "sheet1")
                xlsx.writeFile(wb, dow)
                res.redirect('/stock')
            }
        })
    }
    else {
        Stock.find(query).exec((err, doc) => {
            const file_name = Date.now() + ".xlsx"
            let wb = xlsx.utils.book_new()
            if (err) {
                console.log(err)
            }
            else {
                let tem = JSON.stringify(doc)
                tem = JSON.parse(tem)
                let ws = xlsx.utils.json_to_sheet(tem)
                let dow = "./exportfile/" + file_name
                xlsx.utils.book_append_sheet(wb, ws, "sheet1")
                xlsx.writeFile(wb, dow)
                res.redirect('/stock')
                console.log(doc)
            }
        })
    }
})

module.exports = router