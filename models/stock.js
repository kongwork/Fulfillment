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
let stockSchema = mongoose.Schema({
  productName: String,
  Group: String,
  createdBy: String,
  amount: Number,
  lastUpdate: String,
});

// create model
let Stock = mongoose.model("stocks", stockSchema);

// export model
module.exports = Stock;

//for save data
module.exports.saveStock = function (model, data) {
  model.save(data);
};
