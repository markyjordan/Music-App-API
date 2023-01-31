const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt_decode = require('jwt-decode');
const constants = require('./constants');

/* Google OAuth2.0 Authentication */
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

/* GCP Datastore */
// const userModel = require('./models/userModel');
const { createUser } = require('./controllers/usersController');

/* Server Configuration */
dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

/* Express Configuration */
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

/* Routes */
const playlistsRouter = require('./routes/playlistsRoute');
const tracksRouter = require('./routes/tracksRoute');
const usersRouter = require('./routes/usersRoute');

app.use('/playlists', playlistsRouter);
app.use('/tracks', tracksRouter);
app.use('/users', usersRouter);

app.get('/', (req, res) => {
    res.render('index');
});

/* Authentication/JWT and Save User to Datastore */
app.post('/connect', connectUser, createUser);

/* User Profile Route (protected) */
app.get('/user-profile', checkJWT, (req, res) => {
    let user = req.user;
    // console.log(user);
    res.render('profile', { user });
});

/* Log-out Route */
app.get('/logout', (req, res) => {
    res.clearCookie('session-token');
    res.redirect('/');
});

/* Auth middleware */
function connectUser(req, res, next) {
    let token = req.body.id_token;
    console.log('\nEncoded JWT: \n' + token);  // logs the encoded JWT
    // let decodedJWT = JSON.stringify(jwt_decode(token), null, 2);
    // console.log('\nDecoded JWT: \n' + decodedJWT);
    let user = {};

    // Check if the user is authenticated by calling Google's OAuth2.0 API
    async function verifyJWT() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });

        // Log the decoded JWT to the console
        const payload = JSON.stringify(ticket.getPayload(), null, 2);
        console.log('\nJWT Ticket Payload:  \n' + payload);

        // Log the user to the console
        const payloadObject = ticket.getPayload();
        user.name = payloadObject.name;
        user.email = payloadObject.email;
        user.sub = payloadObject.sub;

        const userid = payloadObject['sub'];
        console.log(`\nUser ID (JWT 'sub' property): ` + userid + '\n');
    }
    verifyJWT()
    .then(() => {
        req.user = user;
        // Store the JWT in a cookie
        // Set the third parameter as an object containing the property
        // 'httpOnly' to true to prevent XSS attacks
        res.cookie('session-token', token);

        // Send a success message to the client
        res.send('success');
        next();
    })
    .catch(console.error);
}

/* Custom auth middleware to use in the 'user-profile' route */
function checkJWT(req, res, next) {
    const token = req.cookies['session-token'];
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
        .then(()=>{
            req.user = user;
            next();
        })
        .catch(err=>{
            req.user = {};
            res.redirect('/')
        })
    } else {
        console.log('\n' + 'Unasuthorized: No user access token found.');
        res.redirect('/');
    }
}

/* Bind to a port and listen for connections on that port */
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
    console.log('Press Ctrl+C to quit.');
});
