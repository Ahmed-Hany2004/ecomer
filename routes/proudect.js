const express = require("express");
const { db } = require("../connection");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { cloud_uplod, cloud_remove, cloud_Multiple_uplod } = require("../cloud")
const { upload } = require("../multerfunction")
const path = require("path")
const fs = require("fs");
const { date } = require("joi");



const router = express.Router()



router.get("/", async (req, res) => {

  proudect = db.collection("proudect");


  try {
     search = req.query.search || null
     ModelNumber = req.query.ModelNumber|| null
     Condition = req.query.Condition|| null
     Brand = req.query.Brand|| null
     Category = req.query.Category|| null
     materialCategory = req.query.materialCategory|| null
     min = Number(req.query.min)|| 0
     max = Number(req.query.max)|| 10000000000000000000000
     limit = Number(req.query.limit)|| 10
     page = (Number(req.query.page) || 1) - 1;  

     filter = {

     }

     if (search) {
      filter["data.product_name"] = { $regex:search }; 
    }

    if (ModelNumber) {
 
      ModelNumber = ModelNumber.split(',')

      filter["data.model_number"] = { $in: ModelNumber };
    }


  if (Condition) {
 
    Condition = Condition.split(',')

      filter["data.condition"] = { $in: Condition };
    }

    if (Brand) {
 
      Brand = Brand.split(',')
  
        filter["data.brand"]= { $in: Brand };
      }

      if (Category) {
 
        Category = Category.split(',')
    
          filter["data.Category"] = { $in: Category };
        }

        if (materialCategory) {
 
          materialCategory = materialCategory.split(',')
      
            filter["data.material_Category"] = { $in: materialCategory };
          }
           
          if(min && max){

            filter.price = { $gte: min, $lte: max };
          }
           

    full_data = await proudect.find( filter )
    .toArray();

    f = full_data.length

    

    last_page =  Math.ceil(f/limit)

data = full_data.slice(page * limit,(page * limit)+limit)

    res.status(200).json(
      {data :{data},meta:{
        page:page+1,
      limit:limit,
      last_page:last_page
      }
    },
      )
  }
  catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }


})


router.get("/:id", async (req, res) => {

  proudect = db.collection("proudect");

  try {

    data = await proudect.findOne({ "_id": new ObjectId(req.params.id) })

    res.status(200).json({ "data": data })
  }
  catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }

})

router.post("/", async (req, res) => {

  proudect = db.collection("proudect");

  newproudact = req.body


  const token = req.headers.token
  req.user = null;

  if (token) {
    data = jwt.verify(token, process.env.secritkey)
    req.user = data
  } else {
    return res.status(400).json({ messege: "yor are not allaowed " })
  }

  try {

    if (req.user.isAdmin == true) {
      x = await proudect.insertOne({
        "data": newproudact,
        "mainImg": {
          "url": null,
          "publicid": null,
          "originalname": null,
        },
        "imgs": [],
      })

      return res.status(200).json({ "message": "proudect inserted", "data": x })
    }
    else {
      return res.status(403).json({ message: "yor are not allaowed" })
    }
  }
  catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }


})


router.post("/update/mainimg/:id", upload.single("main_img"), async (req, res) => {

  proudect = db.collection("proudect");

  try {
    //token handel 
    token = req.headers.token;
    req.user = null;

    if (token) {

      const data = jwt.verify(token, process.env.secritkey)
      req.user = data;

    } else {
      return res.status(401).json({ message: "invalid token" })
    }


    if (req.user.isAdmin) {


      if (!req.file) {
        return res.status(403).json({ message: "you not send img" })

      }


      test = await proudect.findOne({ "_id": new ObjectId(req.params.id) })

      const pathimge = path.join(__dirname, "../upload/" + req.file.originalname)

      if (test.mainImg.originalname == req.file.originalname) {
        fs.unlinkSync(pathimge)

        return res.status(200).json({ message: "upload img Succeed 1" })
      }

      result = await cloud_uplod(pathimge)

      if (test.mainImg.publicid !== null) {
        cloud_remove(test.mainImg.publicid)

      }


      await proudect.updateOne({ "_id": new ObjectId(req.params.id) }, {
        $set: {
          "mainImg": {
            "url": result.secure_url,
            "publicid": result.public_id,
            "originalname": req.file.originalname,
          }
        }
      })

      fs.unlinkSync(pathimge)
      res.status(200).json({ message: "upload img Succeed", })

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



router.post("/uplod/imgs/:id", upload.array("imgs"), async (req, res) => {

  proudect = db.collection("proudect");

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

      if (!req.files) {
        return res.status(403).json({ message: "you not send img" })

      }

      const uploder = async (path) => await cloud_Multiple_uplod(path, "imges")

      const urls = []

      const files = req.files


      for (const file of files) {

        const { path } = file

        const newpath = await uploder(path)

        urls.push(newpath)

        fs.unlinkSync(path)
      }

      await proudect.updateOne({ "_id": new ObjectId(req.params.id) }, {
        $push: {
          "imgs": { $each: urls }
        }
      })

      res.status(200).json("upload img Succeed")

    }
    else {
      res.status(400).json("you are not allow ")
    }

  } catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }
})


router.put("/pull/imgs/:id", async (req, res) => {

  proudect = db.collection("proudect");

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
      await proudect.updateOne({ "_id": new ObjectId(req.params.id) }, {
        $pull: {
          "imgs": { "publicid": req.body.publicid } // publicid

        }
      })

      res.status(200).json("done")
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


router.put("/update/data/:id", async (req, res) => {

  proudect = db.collection("proudect");

  token = req.headers.token || null;
  req.user = null;

  if (token) {

    const data = jwt.verify(token, process.env.secritkey)
    req.user = data;

  } else {
    return res.status(401).json({ message: "invalid token" })
  }

  try {


    if (req.user.isAdmin) {

      await proudect.updateOne({ "_id": new ObjectId(req.params.id) }, {
        $set:
        {
          "data": req.body
        }
      })

      res.status(200).json("data updated")
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



router.delete("/:id", async (req, res) => {

  proudect = db.collection("proudect");

  token = req.headers.token || null;
  req.user = null;

  if (token) {

    const data = jwt.verify(token, process.env.secritkey)
    req.user = data;

  } else {
    return res.status(401).json({ message: "invalid token" })
  }

  try {

    if (req.user.isAdmin) {

      await proudect.deleteOne({ "_id": new ObjectId(req.params.id) })

      res.status(200).json("proudect deleted")
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



//

router.get("/get/:qere", async (req, res) => {

  try {

    if (req.params.qere == "materialCategory" || req.params.qere == "Category" || req.params.qere == "Brand" || req.params.qere == "Condition" || req.params.qere == "ModelNumber") {

      const qere = db.collection(req.params.qere)

      data = await qere.find({}).toArray()

      res.status(200).json({ "data": data })

    }
    else {
      res.status(400).json("you send wrong qere")
    }

  }
  catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }

})


router.get("/get/:qere/:id", async (req, res) => {

  try {

    if (req.params.qere == "materialCategory" || req.params.qere == "Category" || req.params.qere == "Brand" || req.params.qere == "Condition" || req.params.qere == "ModelNumber") {

      const qere = db.collection(req.params.qere)

      data = await qere.findOne({ "_id": new ObjectId(req.params.id) })

      res.status(200).json({ "data": data })

    }
    else {
      res.status(400).json("you send wrong qere")
    }

  }
  catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }

})


router.post("/post/:qere", async (req, res) => {

  try {

    if (req.params.qere == "materialCategory" || req.params.qere == "Category" || req.params.qere == "Brand" || req.params.qere == "Condition" || req.params.qere == "ModelNumber") {

      const qere = db.collection(req.params.qere)

      data = await qere.insertOne({
        "name": req.body.name
      })

      res.status(200).json("qere insertd")

    }
    else {
      res.status(400).json("you send wrong qere")
    }

  }
  catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }

})



router.put("/put/:qere/:id", async (req, res) => {

  try {

    if (req.params.qere == "materialCategory" || req.params.qere == "Category" || req.params.qere == "Brand" || req.params.qere == "Condition" || req.params.qere == "ModelNumber") {

      const qere = db.collection(req.params.qere)

      await qere.updateOne({ "_id": new ObjectId(req.params.id) }, {
        $set: {
          "name": req.body.name
        }
      })

      res.status(200).json("qere updated")

    }
    else {
      res.status(400).json("you send wrong qere")
    }

  }
  catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }

})



router.delete("/delete/:qere/:id", async (req, res) => {

  try {

    if (req.params.qere == "materialCategory" || req.params.qere == "Category" || req.params.qere == "Brand" || req.params.qere == "Condition" || req.params.qere == "ModelNumber") {

      const qere = db.collection(req.params.qere)

      await qere.deleteOne({ "_id": new ObjectId(req.params.id) })

      res.status(200).json("qere delete")

    }
    else {
      res.status(400).json("you send wrong qere")
    }

  }
  catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }

})

module.exports = router;