const express = require('express');
const router = express.Router();
const { 
    createUser, 
    getUsers
} = require('../controllers/usersController');


router.route('/').post(createUser).get(getUsers);


module.exports = router;
