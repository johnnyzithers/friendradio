const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        validate: {
            validator: (name) => name.length > 3,
            message: 'Name must be longer than 3 characters.'
        },
        required: [true, 'Name is required.']
    },
    // TODO password: 
});

const User = mongoose.model('user', UserSchema);

module.exports = User;