var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
const middleWare = require('middleWare');

const FR_ROOM_URL = 'mongodb://localhost:27017/fr_test'

/* Mongo create and store new user
 *  @data.user  - username of new user
 *
 *  return : new user
 */
export async function createUserMongo(data) {
  try{
    var newuser = {
      username: data.user,
      since: Date.now()
    };
    
    const db = await MongoClient.connect(FR_ROOM_URL);
    const collection = db.collection('users');
    const result = await collection.insertOne(newuser);

    console.log("createUserMongo(): creating user: " + newuser.username);

    return newuser
  }catch(e){
    console.log(e);
  }
}


module.exports.createUserMongo = createUserMongo;
