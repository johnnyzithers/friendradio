// import {MongoClient, ObjectID} from 'mongodb'
var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
const middleWare = require('middleWare');


const FR_ROOM_URL = 'mongodb://localhost:27017/fr_rooms'
var exports = module.exports = {};
let db

let roomIdNum = 0


export async function updatePlaylist(o_id, newplaylist)
{
  try{
    db = await MongoClient.connect(FR_ROOM_URL);
    const collection = db.collection('rooms');
    var o_id = new ObjectId(o_id);
    var query = { _id: o_id };
    var newvals = { $set: {playlist: newplaylist}}
    const result = await collection.updateOne(query, newvals);
    console.log("updatePlaylist(): updating playlist of room id: " + o_id);
    return newplaylist;
  }catch(e){
    console.log(e);
  }
}
export async function getRoomMongo(o_id)
{
  try{
    db = await MongoClient.connect(FR_ROOM_URL);
    const collection = db.collection('rooms');
    var o_id = new ObjectId(o_id);
    const result = await collection.findOne({"_id": o_id});
    console.log("getRoomMongo(): finding room by id: " + result._id);
    return result
  }catch(e){
    console.log(e);
  }
}

export async function createRoomMongo(adminUser ) {
  try{
    
    var newroom = {
      playlist: [],
      admin: adminUser
    };
    
    db = await MongoClient.connect(FR_ROOM_URL);
    const collection = db.collection('rooms');
    var o_id = new ObjectId(o_id);
    const result = await collection.insertOne(newroom);
    return newroom
  }catch(e){
    console.log(e);
  }
}

module.exports.createRoomMongo = createRoomMongo;
module.exports.updatePlaylist = updatePlaylist;
// module.exports.generateRoomID = generateRoomID; //FIXME doesnt need export
module.exports.getRoomMongo = getRoomMongo;