// use mongoose
const mongoose = require("mongoose");

// connect MongoDB
const dbUrl = "mongodb://localhost:27017/mydb";
mongoose.connect(dbUrl, {
    useNewUrlparser: true,
    useUnifiedTopology: true,
  }).catch((err) => console.log(err));

// design Schema
let ordercustomerSchema = mongoose.Schema({
  orderID: String,
  productID: String,
  productName: String,
  amount: Number,
});

// create model
let OrderCustomer = mongoose.model("order_customer", ordercustomerSchema)

// export model
module.exports = OrderCustomer

//for save data
module.exports.saveOrderCustomer = function (model, data) {
  model.save(data);
};