// import {MongoClient, ObjectID} from 'mongodb'
var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;

const FR_USER_URL = 'mongodb://localhost:27017/fr_users'
var exports = module.exports = {};

let db
let userIdNum = 0

function generateUserID (){
  return userIdNum++;
}

export const createUserMongo = async (u_id) => {
  console.log(u_id)
   try{
    db = await MongoClient.connect(FR_USER_URL);
    const collection = db.collection('users');
    var newUser = {
      username: [],
      // id: u_id,
      since: Date.now()
      // etc
    };

    console.log("new user " + newUser.id);

    // playlist
    // users

    return newUser;
  }catch(e){
    console.log(e)
  }
}

module.exports.userIdNum = userIdNum;

module.exports.createUserMongo = createUserMongo;
// module.exports.generateUserID = generateUserID;