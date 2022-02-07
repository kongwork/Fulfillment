// use mongoose
const mongoose = require("mongoose");

// connect MongoDB
const dbUrl = "mongodb://localhost:27017/mydb";
mongoose
  .connect(dbUrl, {
    useNewUrlparser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => console.log(err));

// design Schema
let orderSchema = mongoose.Schema({
    customerNmae:String,
    address:String,
    productName:String,
    amount: Number
});

// create model
let Order = mongoose.model("orders", orderSchema);

// export model
module.exports = Order;

//for save data
module.exports.saveOrder = function (model, data) {
  model.save(data);
};
