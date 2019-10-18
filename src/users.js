// import {MongoClient, ObjectID} from 'mongodb'
var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
const middleWare = require('middleWare');

const FR_ROOM_URL = 'mongodb://localhost:27017/fr_rooms'

let db


export async function createUserMongo(data) {
  try{
    var newuser = {
      username: data.name,
      socketid: data.userId,
      since: Date.now()
    };
    
    db = await MongoClient.connect(FR_ROOM_URL);
    const collection = db.collection('users');
    const result = await collection.insertOne(newuser);

    console.log("createUserMongo(): creating user: " + newuser.username);

    return newuser
  }catch(e){
    console.log(e);
  }
}


module.exports.createUserMongo = createUserMongo;
// module.exports.generateUserID = generateUserID;