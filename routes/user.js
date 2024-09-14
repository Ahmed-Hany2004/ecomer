const express = require("express");
const { db } = require("../connection");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")

const router = express.Router()

router.get("/", async (req, res) => {

  user = db.collection("user")

  try {
    x = await user.find({"contactName":{$regex:""},"Email":{$regex:""}}).toArray()
    res.status(200).json({ data: x })
  } catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }

})


router.get("/:id", async (req, res) => {

  user = db.collection("user")

  try {
    x = await user.findOne({ "_id": new ObjectId(req.params.id) })

    res.status(200).json({ data: x })
  } catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }

})




router.post("/", async (req, res) => {
  user = db.collection("user")

  try {

    x = await user.findOne({ "Email": req.body.Email })

    if (x) {
      res.status(200).json("This email is already used")
      return
    }

    var salt = await bcrypt.genSaltSync(10);
    req.body.password = await bcrypt.hash(req.body.password, salt)


    await user.insertOne({
      "contactName": req.body.contactName,
      "lastName": req.body.lastName,
      "companyName":req.body.companyName,
      "Email": req.body.Email,
      "phoneNumber": req.body.phoneNumber,
      "country": req.body.country,
      "password": req.body.password,
      "isAdmin":false
    })

    res.status(200).json("user inserted ")


  } catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }
})



router.post("/login", async (req, res) => {


  user = db.collection("user")


  try {
   
    test = await user.findOne({"Email":req.body.Email})


    if(!test){

      return  res.status(200).json("invalid Email or Password")
    }


    const isPasswordmatch = await bcrypt.compare(req.body.password,test.password)

    if(!isPasswordmatch){

      return  res.status(200).json("invalid Email or Password")
    }

    const token = jwt.sign({ id: test._id, isAdmin: test.isAdmin }, process.env.secritkey);

    delete test.isAdmin
    delete test.password
    res.status(200).json({ message: "Sign in Succeed", test, token })


  }
  catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }
})




router.delete("/:id",async(req,res)=>{

  user = db.collection("user")

  token = req.headers.token

try{
  if (token) {
    data = jwt.verify(token, process.env.secritkey)
    req.user = data
  } else {                        
    return res.status(400).json({ message: "invalid token" })
  }

x = await user.findOne({"_id":new ObjectId(req.user.id)})



if(req.params.id == req.user.id || req.user.isAdmin == true){

  await user.deleteOne({"_id":new ObjectId(req.params.id)})

  return res.status(200).json({ message: "user deleted" })

}else{

  return res.status(403).json({ message: "yor are not allaowed" })

}


}
  catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }
})



module.exports = router;