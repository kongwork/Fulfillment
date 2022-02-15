const express = require("express")
const router = express.Router()
const Stock = require("../models/stock")
const XLSX = require('xlsx')
const multer = require("multer")

const storage = multer.diskStorage({
    destination:function (req, file, cb) {
        cb(null, "./public/uploads") //ตำแหน่งเก็บไฟล์
    },
    filename:function (req, file, cb) {
        cb(null, Date.now()+'.xlsx') //เปลี่ยนชื่อไฟล์ ้ป้องกันชื่อไฟล์ซ้ำกัน
    },
})

const upload = multer ({ storage: storage })

router.post('/import_file' , upload.single("filexlsx"), (req, res) => {

    const name = req.session.username

    const workbook = XLSX.readFile("./public/uploads/" + req.file.filename);
    const sheetNames = workbook.SheetNames;

    // Get the data of "Sheet1"
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

    worksheet.map((doc) => {
        let date = new Date()
        let data = new Stock({
            productName: doc.productName,
            Group: doc.Group,
            amount: doc.amount,
            createdBy: name,
            lastUpdate: date.toLocaleString("th-TH")
        })
        Stock.saveStock(data, (err) => {
            if (err) console.log(err)
        })
    })
    res.redirect('/stock')
})

module.exports = router