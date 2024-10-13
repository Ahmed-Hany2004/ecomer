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
      const filetypes = /pdf/; 
      const mimetype = filetypes.test(file.mimetype); 
   
      
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



  const storage2 = multer.memoryStorage();
  const uploadnewpdf = multer({ storage2 });
  
 
  module.exports=  {
    upload,
    uploadpdf,
    uploadnewpdf,
  };