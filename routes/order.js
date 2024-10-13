const express = require("express");
const { db } = require("../connection");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");




const router = express.Router()


router.get("/", async (req, res) => {
    try {


        const order = db.collection("order")

        token = req.headers.token;
        req.user = null;

        if (token) {

            const data = jwt.verify(token, process.env.secritkey)
            req.user = data;

        } else {
            return res.status(401).json({ message: "invalid token" })
        }


        if (req.user.isAdmin) {


            data = await order.find({}).toArray()

            res.status(200).json({ "data": data })

        }
        else {
            res.status(400).json("you are not allow ")
        }

    }
    catch (err) {
        console.log("=========>" + err);
        res.status(500).send("err in " + err)
    }
})


router.get("/:id", async (req, res) => {

    const order = db.collection("order")

    token = req.headers.token;
    req.user = null;

    if (token) {

        const data = jwt.verify(token, process.env.secritkey)
        req.user = data;

    } else {
        return res.status(401).json({ message: "invalid token" })
    }


    try {

        if (req.user.isAdmin) {


            data = await order.findOne({ "_id": new ObjectId(req.params.id) })

            res.status(200).json({ "data": data })

        }
        else {
            res.status(400).json("you are not allow ")
        }

    }
    catch (err) {
        console.log("=========>" + err);
        res.status(500).send("err in " + err)
    }
})


router.post("/", async (req, res) => {
    const order = db.collection("order")
    const userorders =db.collection("userorders")

    token = req.headers.token;
    req.user = null;

    if (token) {

        const data = jwt.verify(token, process.env.secritkey)
        req.user = data;

    } else {
        return res.status(401).json({ message: "invalid token" })
    }

    try {

      


            await order.insertOne({
                "RFQ Date": Date.now(),
                "Customer":new ObjectId(req.body.Customer),
                "Status": req.body.status,
                "OG Invoice": req.body.OG_Invoice,
                "Customer PO": req.body.Customer_PO,
                "Payment Date": req.body.Payment_Date,
                "Payment AED": req.body.Payment_AED,
                "Payment Reference": req.body.Payment_Reference,
                "Shipping status": req.body.Shipping_status,
                "DN": req.body.DN,
                "Comments": req.body.Comments,
                "cart": req.body.cart
            })

        test = await userorders.findOne({"Customer":new ObjectId(req.body.Customer)})

        if(test){
         await userorders.updateOne({"Customer":new ObjectId(req.body.Customer)},{$set:{"lastOrder":Date.now()}})
        }
        else{
         await userorders.insertOne({
            "Customer":new ObjectId(req.body.Customer),
           "lastOrder":Date.now(),
           "Status": null,
         })
        }

            res.status(200).json({x:"order insertd",test:test})
     
    }
    catch (err) {
        console.log("=========>" + err);
        res.status(500).send("err in " + err)
    }
})



router.put("/data/:id", async (req, res) => {

    const order = db.collection("order")
    const proudect = db.collection("proudect")

    token = req.headers.token;
    req.user = null;

    if (token) {

        const data = jwt.verify(token, process.env.secritkey)
        req.user = data;

    } else {
        return res.status(401).json({ message: "invalid token" })
    }


    try {

        if (req.user.isAdmin) {

if(req.body.status != 'Approved')
    { 
        await order.updateOne({ "_id": new ObjectId(req.params.id) }, {
            $set: {
                "Status": req.body.status,
                "OG Invoice": req.body.OG_Invoice,
                "Customer PO": req.body.Customer_PO,
                "Payment Date": req.body.Payment_Date,
                "Payment AED": req.body.Payment_AED,
                "Payment Reference": req.body.Payment_Reference,
                "Shipping status": req.body.Shipping_status,
                "DN": req.body.DN,
                "Comments": req.body.Comments,
            }
           
            })

            res.status(200).json("order updated")        

    }

    
    }
    else {
        res.status(400).json("you are not allow ")
    }
}
    catch (err) {
        console.log("=========>" + err);
        res.status(500).send("err in " + err)
    }

})



router.put("/cart/:id",async(req,res)=>{
    
    const order = db.collection("order")

    token = req.headers.token;
    req.user = null;
    if (token) {

        const data = jwt.verify(token, process.env.secritkey)
        req.user = data;

    } else {
        return res.status(401).json({ message: "invalid token" })
    }

    try{

        if (req.user.isAdmin) {
        
        await order.updateOne({"_id":new ObjectId(req.params.id)},{$set:{
            "cart":req.body.cart
        }})
        
        res.status(200).json("cart updated")
        }
    else {
        return res.status(401).json({ message: "invalid token" })
    }

    }
    catch (err) {
        console.log("=========>" + err);
        res.status(500).send("err in " + err)
    }

})


router.post("/user",async(req,res)=>{

    const userorders =db.collection("userorders")

    token = req.headers.token;
    req.user = null;

    if (token) {

        const data = jwt.verify(token, process.env.secritkey)
        req.user = data;

    } else {
        return res.status(401).json({ message: "invalid token" })
    }

try{
    
    if (req.user.isAdmin) {

        x = await userorders.aggregate([
            {
               $lookup:
               {
                  from: "user",
                  localField: "Customer",
                  foreignField: "_id",
                  as: "usersorder"
               },
            },
            { $sort : { lastOrder : -1 } }
   
         ]).toArray()

         res.status(200).json({"data":x})

    }
    else {
        res.status(400).json("you are not allow ")
    }
}
catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
}

})





router.get("/user/:id",async(req,res)=>{


    const order =db.collection("order")

    token = req.headers.token;
    req.user = null;

    if (token) {

        const data = jwt.verify(token, process.env.secritkey)
        req.user = data;

    } else {
        return res.status(401).json({ message: "invalid token" })
    }

try{
    
    if (req.user.isAdmin) {

      data = await order.find({"Customer":new ObjectId(req.params.id)}).toArray()


      res.status(200).json({"data":data})

    }
    else{
        res.status(400).json("you are not allow ")
    }

}
catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
}
})



router.delete("/:id",async(req,res)=>{

    const order = db.collection("order")


    token = req.headers.token||null;
    req.user = null;
  
    if (token) {
  
      const data = jwt.verify(token, process.env.secritkey)
      req.user = data;
  
    } else {
      return res.status(401).json({ message: "invalid token" })
    }
  
    try{
  
      if (req.user.isAdmin) {
  
        await order.deleteOne({"_id":new ObjectId(req.params.id)})
  
        res.status(200).json("order deleted")
      }
      else {
        res.status(400).json("you are not allow ")
      }
  
  
    }
   catch (err) {
      console.log("=========>" + err);
      res.status(500).send("err in " + err)
    }


})



router.post("/user/create", async (req, res) => {
    user = db.collection("user")
    userorders = db.collection("userorders")
  
    try {
  
      test = await user.findOne({ "Email": req.body.Email })
  
      if (test) {
        res.status(200).json("This email is already used")
        return
      }
  
  
    x =  await user.insertOne({
        "contactName": req.body.contactName,
        "lastName": req.body.lastName,
        "companyName":req.body.companyName,
        "Email": req.body.Email,
        "phoneNumber": req.body.phoneNumber,
        "country": req.body.country,
        "isAdmin":false
      })

   
      
      
      
      v= await userorders.findOne({"Customer":new ObjectId(x.insertedId)})

      if(v){
       await userorders.updateOne({"Customer":new ObjectId(x.insertedId)},{$set:{"lastOrder":Date.now()}})
      }
      else{
       await userorders.insertOne({
          "Customer":new ObjectId(x.insertedId),
         "lastOrder":Date.now(),
         "Status": null,
       })
      }
  
      res.status(200).json( {data :x })
  
  
    } catch (err) {
      console.log("=========>" + err);
      res.status(500).send("err in " + err)
    }
  })


  router.post("/update/status/:id",async(req,res)=>{

    userorders = db.collection("userorders")

    x = await userorders.findOne({"_id":new ObjectId(req.params.id)})


    if(!x){
    
        return  res.status(400).json("cant find this user")
    }
    
    await userorders.updateOne({"_id":new ObjectId(req.params.id)},{$set:{"Status":req.body.Status}})

    
  res.status(200).json("Status updated")

  })



  router.delete("/userorders/:id",async(req,res)=>{

    userorders = db.collection("userorders")

   userorders.deleteOne({"_id":new ObjectId(req.params.id)})

   res.status(200).json("user deleted")

  })

module.exports = router;