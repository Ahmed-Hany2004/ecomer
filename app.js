const express = require("express");
const morgan = require("morgan");
const bodyparser = require("body-parser");
const jwt = require("jsonwebtoken");
var cors = require('cors')
const { main,db } = require("./connection");



const app = express();


app.use(morgan("dev"));
app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json())

app.use(cors())

const userpath = require("./routes/user")
const proudectpath = require("./routes/proudect")
const order = require("./routes/order")




app.use("/user",userpath)
app.use("/proudect",proudectpath)
app.use("/order",order)


// app.get("/",async(req,res)=>{
//  const   user = db.collection("user")
//  const  proudect = db.collection("proudect")
//  const   order = db.collection("order")
//  const  userorders = db.collection("userorders")

//  await user.deleteMany({})
//  await proudect.deleteMany({})
//  await order.deleteMany({})
//  await userorders.deleteMany({})


// res.send("done")
// })


main(app);