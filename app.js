const express = require("express");
const morgan = require("morgan");
const bodyparser = require("body-parser");
const jwt = require("jsonwebtoken");
var cors = require('cors')
const { main } = require("./connection");

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



main(app);