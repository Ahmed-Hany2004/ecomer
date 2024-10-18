const express = require("express");
const { db } = require("../connection");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const nodemailer = require('nodemailer');

const router = express.Router()



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
  }
});




function sendVerificationEmail(userEmail, userName, verificationCode) {
  const mailOptions = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: 'رمز التحقق من التسجيل',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    }
                    .email-header {
                        text-align: center;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background-color: #241654;
                        color: #ffffff;
                        padding: 10px;
                        border-radius: 8px 8px 0 0;
                    }
                    .email-header img {
                        width: 90px;
                        height: auto;
                        margin-bottom: 10px;
                    }
                    .email-content {
                        padding: 20px;
                        text-align: center;
                    }
                    .email-content p {
                        font-size: 16px;
                        color: #333333;
                        margin-bottom: 20px;
                    }
                    .verification-code {
                        font-size: 24px;
                        font-weight: bold;
                        color: #500bf0;
                        margin-bottom: 20px;
                    }
                    .footer {
                        text-align: center;
                        font-size: 12px;
                        color: #777777;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <img src="https://i.pinimg.com/736x/d4/b5/66/d4b5663e5cd8628dad5e7b927eeb62e0.jpg" alt="Company Logo">
                        <h1>Welcome to <span class="company-name" style="color: #ebebeb;">Oilfield Gate</span>!</h1>
                    </div>
                    <div class="email-content">
                        <p>Dear Mr. <strong class="user-name" style="color: #500bf0;">${userName}</strong>،</p>
                        <p>Your verification code is:</p>
                        <div class="verification-code">${verificationCode}</div>
                    </div>
                    <div class="footer">
                        <p>Thank you for joining us!</p>
                    </div>
                </div>
            </body>
            </html>
        `,
    
      text: ` ${userName}، شكرًا لتسجيلك في موقعنا! رمز التحقق الخاص بك هو: ${verificationCode}مرحبًا`
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.log('Error sending email:', error);
      } else {
          console.log('Email sent:', info.response);
      }
  });
}


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


function generateRandomKey() {
  const min = 1000; // minimum 4-digit number
  const max = 9999; // maximum 4-digit number
  return `${Math.floor(Math.random() * (max - min + 1)) + min}`;
}



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

    const otp = generateRandomKey();
    // const otp =`${Math.floor(Math.random()*9000)}`

    await user.insertOne({
      "contactName": req.body.contactName,
      "lastName": req.body.lastName,
      "companyName":req.body.companyName,
      "Email": req.body.Email,
      "phoneNumber": req.body.phoneNumber,
      "country": req.body.country,
      "password": req.body.password,
      "isAdmin":false,
      "isVerified": false,
      "otp":otp 
    })


    sendVerificationEmail(req.body.Email,req.body.contactName,otp)


    res.status(200).json("user inserted ")


  } catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }
})


router.post("/verify",async(req,res)=>{

  user = db.collection("user")

  try{

 x = await user.findOne({"Email": req.body.Email ,"otp":req.body.otp})
 

 

 if(!x){
  return res.status(400).json({ message: 'The verification code is incorrect or the email does not exist.' });
 }

await user.updateOne({"Email": req.body.Email},
  {
$set:{
  "isVerified":true
},$unset: { "otp": "" }
})

 res.status(200).json("done")
  }
  catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }
})



router.post("/login", async (req, res) => {


  user = db.collection("user")


  try {
   
    test = await user.findOne({"Email":req.body.Email})



    if(!test){

      return  res.status(400).json("invalid Email or Password")
    }

    if(test.isVerified==false){

      return  res.status(400).json({"M":"This email is not activated ",
        "isVerified":false
      })

    }

    const isPasswordmatch = await bcrypt.compare(req.body.password,test.password)

    if(!isPasswordmatch){

      return  res.status(400).json("invalid Email or Password")
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


router.post("/login/admin", async (req, res) => {


  user = db.collection("user")


  try {
   
    test = await user.findOne({"Email":req.body.Email})


    if(!test){

      return  res.status(400).json("invalid Email or Password")
    }


    if(!test.isAdmin){

      return  res.status(400).json("yor are not allaowed")
    }
    const isPasswordmatch = await bcrypt.compare(req.body.password,test.password)

    if(!isPasswordmatch){

      return  res.status(400).json("yor are not allaowed")
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


router.post("/restpassword",async(req,res)=>{

  user = db.collection("user")

  try{

    x = await user.findOne({"Email": req.body.Email })

    if(!x){ 

      return res.status(400).json("cant find this Email") 
    }

    const otp = generateRandomKey();

    req.body.contactName  = x.contactName;

    sendVerificationEmail(req.body.Email,req.body.contactName,otp)

    await user.updateOne({"Email": req.body.Email},{
      $set:{
     "otp":otp
      }
    })

    res.status(200).json("Email send ")

  }

  catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }
})


router.post("/changepassword",async(req,res)=>{

  user = db.collection("user")

  try{

    x = await user.findOne({"Email": req.body.Email,"otp":req.body.otp })

    if(!x){ 

      return res.status(400).json("cant find this Email") 
    }

   
    var salt = await bcrypt.genSaltSync(10);
    req.body.password = await bcrypt.hash(req.body.password, salt)



    await user.updateOne({"Email": req.body.Email},{
      $set:{
     "password":req.body.password
      },$unset: { "otp": "" }
    })

    res.status(200).json("done")

  }

  catch (err) {
    console.log("=========>" + err);
    res.status(500).send("err in " + err)
  }
})


router.post("/resend",async(req,res)=>{

  user = db.collection("user")
  try{

    x = await user.findOne({"Email": req.body.Email,})

    if(!x){ 

      return res.status(400).json("cant find this Email") 
    }


    const otp = generateRandomKey();

    req.body.contactName  = x.contactName;

    sendVerificationEmail(req.body.Email,req.body.contactName,otp)

    await user.updateOne({"Email": req.body.Email},{
      $set:{
     "otp":otp
      }
    })

    res.status(200).json("Email send")


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