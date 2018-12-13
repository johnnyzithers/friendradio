const assert = require('assert');
const User = require('../database/user.js');

describe('Creating records', () => {
    it('saves a user', (done) => {
        // Creating new instance of User
        const user = new User({ name: 'Ferg' });

        // Ferg the object has a bunch of functions attached to it now
        // async - will take time - saves Ferg to db
        user.save()
            .then(() => {
                // Has Ferg been saved successfully?
                assert(!user.isNew);
                done();
            });
    });
});

