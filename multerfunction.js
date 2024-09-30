const multer =require("multer")

const storage = multer.diskStorage({
    destination: "upload",
    filename: function (req, file, cb) {
     
      cb(null, file.originalname  )
    }
  })

  const upload = multer
  ({ storage: storage, 
    fileFilter:(req,file,cb)=>{
        if(file.mimetype=="image/png"|| file.mimetype=="image/jpg" || file.mimetype=="image/jpeg"){
            cb(null, true)
        }
        else{
            cb(null, false)
            console.log("tesrt");
            
            
           return("'I don\'t have a clue!'");
            
        }
    }
  })


  const uploadpdf = multer
  ({ storage: storage, 
    fileFilter: (req, file, cb) => {
      const filetypes = /pdf/; // filetypes you will accept
      const mimetype = filetypes.test(file.mimetype); // verify file is == filetypes you will accept
   
      // if mimetype && extname are true, then no error
      if(mimetype ){
          return cb(null, true);
      }
        else{
            cb(null, false)
            console.log("tesrt");
            
            
           return("'I don\'t have a clue!'");
            
        }
    }
  })
  
 
  module.exports=  {
    upload,
    uploadpdf,
  };