var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
const middleWare = require('middleWare');

const FR_ROOM_URL = 'mongodb://localhost:27017/fr_test'

/* Mongo update the playlist of the specified room 
 *  @o_id         - room id
 *  @newplaylist  - new complete playlist
 * 
 *  return : playlist
 */
export async function updatePlaylist(o_id, newplaylist)
{
  try{
    const db = await MongoClient.connect(FR_ROOM_URL);
    const collection = db.collection('rooms');
    var o_id = new ObjectId(o_id);
    var query = { _id: o_id };
    var newvals = { $set: { playlist: newplaylist }};
    const result = await collection.updateOne(query, newvals);
    // console.log('updatePlaylist(): updating playlist of room id ' + o_id);
    return newplaylist;
  }catch(e){
    console.log(e);
  }
}

export async function updateUploadCount(o_id, uc)
{
  try{
    const db = await MongoClient.connect(FR_ROOM_URL);
    const collection = db.collection('rooms');
    var o_id = new ObjectId(o_id);
    var query = { _id: o_id };
    var newvals = { $set: { uploadCount: uc }};
    const result = await collection.updateOne(query, newvals);
    // console.log('updateUploadCount(): updating upload count of room id ' + o_id);
    return result
  }catch(e){
    console.log(e);
  }
}

/* Mongo create and store room by id
 *  @o_id - room id
 * 
 *  return : found room
 */
export async function getRoomMongo(o_id)
{
  try{
    const db = await MongoClient.connect(FR_ROOM_URL);
    const collection = db.collection('rooms');
    var o_id = new ObjectId(o_id);
    const result = await collection.findOne({"_id": o_id});
    // console.log("getRoomMongo(): finding room by id: " + result._id);
    return result
  }catch(e){
    console.log(e);
  }
}

/* Mongo create room by user
 *  @adminUser - user creating the room
 * 
 *  return : created room
 */
export async function createRoomMongo(adminUser) {
  try{
    let url = generate5characters();

    var newroom = {
      playlist: [],
      endpoint: url,
      uploadCount: 0,
      admin: adminUser
    };
    const db = await MongoClient.connect(FR_ROOM_URL);
    const collection = db.collection('rooms');
    var o_id = new ObjectId(o_id);
    const result = await collection.insertOne(newroom);
    return newroom
  }catch(e){
    console.log(e);
  }
}

function generate5characters(){
  var random_string = Math.random().toString(32).substring(2, 5) + Math.random().toString(32).substring(2, 5);    
  return random_string
}

module.exports.updateUploadCount = updateUploadCount;
module.exports.createRoomMongo = createRoomMongo;
module.exports.updatePlaylist = updatePlaylist;
module.exports.getRoomMongo = getRoomMongo;