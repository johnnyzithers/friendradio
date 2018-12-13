const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    name: {
        type: String,
        validate: {
            validator: (name) => name.length > 6,
            message: 'Room name must be longer than 6 characters.'
        },
        required: [true, 'Room name is required.']
    }
    // TODO:
    // users
    // playlist ( ? sub-collection of files uploaded )
});

const User = mongoose.model('room', RoomSchema);

module.exports = Room;

