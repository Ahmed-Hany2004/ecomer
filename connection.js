const {MongoClient,GridFSBucket} =require("mongodb");
require("dotenv").config();

url=process.env.url
const dbname= process.env.db_name
const client = new MongoClient(url);

const db = client.db(dbname);
gridFSBucket = new GridFSBucket(db, {
  bucketName: 'uploads', // You can customize the bucket name
});

async function main(app) {
    // Use connect method to connect to the server
    try{
    await client.connect();
    console.log('Connected successfully to server');
    
    }
    catch{(err)=>console.log(err);}

    // the following code examples can be pasted here...
    app.listen(process.env.port,()=>console.log("server run on port 3000..."));
    return 'done.';
}

module.exports = {
  main,
    db,
    gridFSBucket,
};