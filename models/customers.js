require("dotenv").config();
var mongoose=require("mongoose")


var customerSchema= new mongoose.Schema({
    name: String,
    email: String,
    balance:Number
});
module.exports=mongoose.model("Customers",customerSchema);