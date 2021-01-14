require("dotenv").config();
var mongoose=require("mongoose")

var transferSchema=new mongoose.Schema({
    sender:String,
    receiver:String,
    amount: Number
});
module.exports=mongoose.model("Transfer",transferSchema);