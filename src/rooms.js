var exports = module.exports = {};


exports.generateRoomID = function (){
  return '_' + Math.random().toString(36).substr(2, 9);
}

exports.createRoomMongo = function(adminUser)
{
  try{
    // db = await MongoClient.connect(FR_ROOM_URL);
    const collection = db.collection('rooms');
    var newRoom = {
      playlist: [],
      id: generateRoomID(),
      admin: adminUser
    };

    console.log(newRoom);

    // playlist
    // users

    return newRoom;
  }catch(e){
    console.log(e)
  }

}
