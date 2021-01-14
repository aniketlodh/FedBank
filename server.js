require("dotenv").config();
var express=require("express");
var app= express();
var mongoose=require("mongoose");
var bodyParser=require("body-parser");
var session = require('express-session');
const PORT=process.env.PORT || 3000;
var flash = require('connect-flash');
const mongo=process.env.MONGO;
mongoose.connect("mongodb+srv://"+ mongo +"?retryWrites=true&w=majority",{ useNewUrlParser: true,useUnifiedTopology: true, useFindAndModify: false });
var customers=require("./models/customers");
var Transaction=require("./models/transfers");
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(flash());
app.use(require("express-session")({
    secret:"I am a robot",
    resave:false,
    saveUninitialized:false 
 }));
customers();
Transaction();
app.use(function(req, res, next){
    res.locals.danger = req.flash("danger");
    res.locals.success = req.flash("success");
    next();
});
// customers.insertMany(
//     [
    // {
//         name:"Aniket Lodh",
//         email:"a@gmail.com",
//         balance: 5000
//     },
//     {
//         name:"John Doe",
//         email:"john@gmail.com",
//         balance: 2000
//     },
//     {
//         name:"Virat Chakraborty",
//         email:"v@gmail.com",
//         balance: 4000
//     },
//     {
//         name:"Dhriti Saha",
//         email:"k@gmail.com",
//         balance: 5000
//     },
    // {
    //     name:"Bhavna Chatterjee",
    //     email:"b@gmail.com",
    //     balance: 5000
    // },
        // { 
        //     name:"Dhruv Bannerjee",
        //     email:"dhruv@gmail.com",
        //     balance: 6000
        // },
        // {
        //     name:"Kabir Sarkar",
        //     email:"kabir@gmail.com",
        //     balance: 2000
        // },
        // {
        //     name:"Riya Chatterjee",
        //     email:"riya@gmail.com",
        //     balance: 3500
        // },
        // {
        //     name:"George Bannerjee",
        //     email:"george@gmail.com",
        //     balance: 4000
        // },
        // {
        //     name:"Rabi Chakraborty",
        //     email:"rabi@gmail.com",
        //     balance: 5000
        // }
    // {
//         name:"Bhavna Chatterjee",
//         email:"b@gmail.com",
//         balance: 5000
//     }
//         ],function(err,docs){
//         console.log("success");
//     }
// )
app.get("/",(req,res)=>{
    // customers.find({},(err,custs)=>{
        // if(err){
        //     console.log(err);
//        }else{
    res.render("index");
    //     }
    // })
})
app.get("/customers",(req,res)=>{
    customers.find({},(err,custs)=>{
        if(err){
            console.log(err);
       }else{
           res.render("customers",{custs:custs}); 
       }      
    });
});
app.get("/transactions",(req,res)=>{
    Transaction.find({},(err,transactions)=>{
        if(err){
            console.log("error");
        }else{
            res.render("transactions",{transactions:transactions});
        }
    })
})
app.get("/transact/:id",(req,res)=>{
    customers.findById(req.params.id,function(err,foundcust){
        if(err){
            console.log(err);
        }else{
            customers.find({},function(err,customers){
                if(err){
                    console.log(err);
                }else{
                    res.render("transactionPage",{foundcust:foundcust,customers:customers});    
                }   
            })
        }
    })  
});
app.post("/send",(req,res)=>{
    var senderId=req.body.sender;
    var receiverId=req.body.receiver;
    var amount=Number(req.body.amount);
    customers.findById(senderId,function(err,foundSender){
        if(err){
            console.log("Sender not found");
            res.redirect("/");
        }else{
            customers.findById(receiverId,function(err,foundReceiver){
                if(err){
                    console.log("Receiver not found");
                    res.redirect("/");    
                }else{
                    if(senderId===receiverId){
                        req.flash("danger","Sender and receiver cant be same.");
                        console.log("Sender and receiver cant be same.");
                        res.redirect("/customers");
                    }else if(foundSender.balance<amount){
                        console.log("Insufficient Balance");
                        req.flash("danger","Insufficient Balance.");
                        res.redirect("/customers");
                    }else{
                        var updatedSenderBal=foundSender.balance-amount;
                        var updatedReceiverBal=foundReceiver.balance+amount;
                        customers.findByIdAndUpdate(foundSender._id,{balance:updatedSenderBal},function(err,custo){
                            if(err){
                                res.send(500);
                            }
                        });
                        customers.findByIdAndUpdate(foundReceiver._id,{balance:updatedReceiverBal},function(err,custo){
                            if(err){
                                res.send(500);
                            }
                        });
                        
                        console.log(foundSender.balance);
                        console.log(foundReceiver.balance);
                        Transaction.create({sender:foundSender.name,receiver:foundReceiver.name,amount:amount});
                        console.log("Transaction successful");
                        req.flash("success", "Transaction Successful!");
                        res.redirect("/");
                    }   
                }
            })
        }
    })
})


app.listen(PORT,(req,res)=>{
    console.log("server started");
})
