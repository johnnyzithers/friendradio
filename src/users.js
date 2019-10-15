var exports = module.exports = {};


exports.generateUserID = function (){
  return generateUserID.num++;
}

exports.createUserMongo = function (){
   try{
    // db = await MongoClient.connect(FR_ROOM_URL);
    const collection = db.collection('users');
    var newUser = {
      username: [],
      id: generateUserID,
      since: Date.now()
      // etc
    };

    console.log(newUser);

    // playlist
    // users

    return newUser;
  }catch(e){
    console.log(e)
  }
}