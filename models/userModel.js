const { getBaseURL } = require('../constants');
const baseURL = getBaseURL();
const { datastore, fromDatastore } = require('../datastore');
const USER = "User";


/**
 * Create a user
 * @param name {string} - The name of the user; required
 * @param email {string} - The email of the user; required
 * @param sub {string} - The value of the sub property in the user's JWT;
 * required
 * @returns key of the new user
 */
function postUser(name, email, sub) {
    var userKey = datastore.key(USER);
    const user = { 
        "name": name, 
        "email": email, 
        "sub": sub
    };
    const userEntity = {
        "key": userKey,
        "data": user
    }
    return datastore.insert(userEntity)
    .then(() => {
        // Add the self url link to the user object
        let selfURL = `${baseURL}/users/${userKey.id}`;
        const newUser = {
            "name": name,
            "email": email,
            "sub": sub,
            "self_url": selfURL
        }
        datastore.save({
            "key": userKey,
            "data": newUser
        })
        .then(() => {
            return userKey;
        });
    });
}

/**
 * Get users collection
 * @returns all users
 */
function getUsers(req) {
    const query = datastore.createQuery(USER);
    return datastore.runQuery(query)
    .then((entities) => {
        return entities[0].map(fromDatastore);
    });
}

/**
 * Get a user by the value of the sub property
 * @param sub {string} - The value of the sub property in the user's JWT;
 * required
 * @returns the user
 */
function getUserBySub(sub) {
    const query = datastore.createQuery(USER)
    return datastore.runQuery(query)
    .then((entities) => {
        return entities[0].map(fromDatastore)
        .filter(user => user.sub == sub);
    });
}


module.exports = {
    postUser: postUser,
    getUsers: getUsers, 
    getUserBySub: getUserBySub
};
