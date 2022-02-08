const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Group = require("../models/group");
const Stock = require("../models/stock");
const Order = require("../models/order");
var nodemailer = require("nodemailer");
const XLSX = require("xlsx");

// อัพโหลดไฟล์
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/uploads"); //ตำแหน่งเก็บไฟล์
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + ".xlsx"); //เปลี่ยนชื่อไฟล์ ้ป้องกันชื่อไฟล์ซ้ำกัน
    },
});
const storage_img = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/uploadsIMG"); //ตำแหน่งเก็บไฟล์
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + ".jpg"); //เปลี่ยนชื่อไฟล์ ้ป้องกันชื่อไฟล์ซ้ำกัน
    },
});

const upload = multer({ storage: storage });
const upload_img = multer({ storage: storage_img }).array("fileimg", 3);

//------------------------------------------------------------------------------------ เพิ่มข้อมูล User
router.post("/insert", (req, res) => {
    const username = req.body.username;
    User.findOne({ username: username }).exec((err, doc) => {
        if (!doc) {
            let data = new User({
                username: req.body.username,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                companyName: req.body.companyName,
                address: req.body.address,
                password: req.body.password,
                typeUser: req.body.typeUser,
            });
            User.saveUser(data, (err) => {
                if (err) console.log(err);
                res.redirect("/user");
            });
        }
        else {
            res.redirect("/form_AddUser");
        }
    });
});

//------------------------------------------------------------------------------------ เพิ่มข้อมูล Group
router.post("/insert_group", (req, res) => {
    const name = req.session.username;
    let date = new Date();
    let data = new Group({
        groupname: req.body.groupname,
        createdBy: name,
        lastUpdate: date.toLocaleString("th-TH"),
    });
    Group.saveGroup(data, (err) => {
        if (err) console.log(err);
        res.redirect("/user_page_group");
    });
});

//------------------------------------------------------------------------------------ เพิ่มข้อมูล Stock
router.post("/insert_stock", (req, res) => {
    upload_img(req, res, function (err) {
        if (err) {
            const time = 1000;
            res.cookie("UpLoadImageFail", true, { maxAge: time });
            res.redirect("/form_AddStock");
        }
        else if (!req.files || req.files.length === 0) {
            const name = req.session.username;
            let date = new Date();
            let data = new Stock({
                productID: Date.now(),
                productName: req.body.productName,
                Group: req.body.groupname,
                amount: req.body.amount,
                price: req.body.price,
                createdBy: name,
                customer: req.body.customer,
                lastUpdate: date.toLocaleString("th-TH"),
            });
            Stock.saveStock(data, (err) => {
                if (err) console.log(err);
                res.redirect("/stock");
            });
        }
        else if (req.files.length === 3) {
            const name = req.session.username;
            let date = new Date();
            let data = new Stock({
                productID: Date.now(),
                productName: req.body.productName,
                Group: req.body.groupname,
                amount: req.body.amount,
                price: req.body.price,
                createdBy: name,
                customer: req.body.customer,
                imgs: {
                    img01: req.files[0].filename,
                    img02: req.files[1].filename,
                    img03: req.files[2].filename,
                },
                lastUpdate: date.toLocaleString("th-TH"),
            });
            Stock.saveStock(data, (err) => {
                if (err) console.log(err);
                res.redirect("/stock");
            });
        }
        else if (req.files.length === 2) {
            const name = req.session.username;
            let date = new Date();
            let data = new Stock({
                productID: Date.now(),
                productName: req.body.productName,
                Group: req.body.groupname,
                amount: req.body.amount,
                price: req.body.price,
                createdBy: name,
                customer: req.body.customer,
                imgs: {
                    img01: req.files[0].filename,
                    img02: req.files[1].filename,
                },
                lastUpdate: date.toLocaleString("th-TH"),
            });
            Stock.saveStock(data, (err) => {
                if (err) console.log(err);
                res.redirect("/stock");
            });
        }
        else {
            const name = req.session.username;
            let date = new Date();
            let data = new Stock({
                productID: Date.now(),
                productName: req.body.productName,
                Group: req.body.groupname,
                amount: req.body.amount,
                price: req.body.price,
                createdBy: name,
                customer: req.body.customer,
                imgs: {
                    img01: req.files[0].filename,
                },
                lastUpdate: date.toLocaleString("th-TH"),
            });
            Stock.saveStock(data, (err) => {
                if (err) console.log(err);
                res.redirect("/stock");
            });
        }
    });
});

module.exports = router;