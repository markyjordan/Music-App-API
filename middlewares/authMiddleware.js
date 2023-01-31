const dotenv = require('dotenv');
dotenv.config();
const jwt_decode = require('jwt-decode');

/* Google OAuth2.0 Auth */
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);


function checkAuth(req, res, next) {
    // Get the JWT from the Postman bearer token authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        let user = {};
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: CLIENT_ID,
            });
            const payload = ticket.getPayload();
            user.name = payload.name;
            user.email = payload.email;
            user.sub = payload.sub;
            user.jwt_encoded = token;
            user.jwt_decoded = JSON.stringify(jwt_decode(token), null, 2);
        }
        verify()
        .then(() => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log('\n' + 'Unauthorized: No user access token found.');
            // res.status(401).json({ "Unauthorized": "No user access token
            // found." });
            req.user = {};
            next();
        })
    } else {
        console.log('\n' + 'Unauthorized: No user access token found.');
        // res.status(401).json({"Unauthorized": "No user access token
        // found."});
        req.user = {};
        next();
    }
}


module.exports = {
    checkAuth: checkAuth
};
