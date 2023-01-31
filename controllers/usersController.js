const constants = require('../constants');
const userModel = require('../models/userModel');


/**
 * CREATE USER
 * POST /users
 * 
 * Notes:
 * 
 * Returns:
 * 
 */
function createUser(req, res) {
    const user = req.user;

    // Check if the user already exists in the datastore
    userModel.getUserBySub(user.sub)
    .then(userEntity => {
        // Add the new user to the datastore if they don't already exist
        if (userEntity.length == 0) {
            userModel.postUser(user.name, user.email, user.sub)
        }
    })
};

/**
 * GET USERS COLLECTION
 * GET /users
 * 
 * Notes:
 * The responsed will be paginated, with a maximum of 5 users per page, and will
 * include a property that provides a link to the next page.
 * 
 * Returns:
 * 200 - OK; Successfully retrieved all users.
 * 406 - Not Acceptable; The server only produces responses that conform to an
 * 'application/json' value provided in the request 'Accept' header.
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const getUsers = (req, res) => {
    if (req.get('Accept') !== 'application/json') {
        res.status(406).json({ Error: constants.NOT_ACCEPTABLE });
    } else {
        userModel.getUsers()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
        })
    }
};


module.exports = {
    createUser: createUser,
    getUsers: getUsers
};
