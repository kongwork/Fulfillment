// use mongoose
const mongoose = require("mongoose");

// connect MongoDB
const dbUrl = "mongodb://localhost:27017/mydb";
mongoose
  .connect(dbUrl, {
    useNewUrlparser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => console.log(err))

// design Schema
let groupSchema = mongoose.Schema({
  groupname: String
});

// create model
let Group = mongoose.model("groups", groupSchema);

// export model
module.exports = Group;

//for save data
module.exports.saveGroup = function (model, data) {
  model.save(data);
};
