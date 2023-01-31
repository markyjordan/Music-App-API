const dotenv = require('dotenv');
dotenv.config();


// GCP Credentials
const CLIENT_ID = "482667228483-chgqkssr58gbarip8g9df2bg8b0601jh.apps.googleusercontent.com";

// APP URL
function getBaseURL() {
    if (process.env.NODE_ENV !== 'production') {
        return `http://localhost:${process.env.PORT}`;
    } else {
        return process.env.BASE_URL;
    }
}

// HTTP Status Code Definitions
const badRequest = "The request object is missing one or more of the required attributes.";
const badRequestNoDuplicates = "Duplicate tracks are not allowed.";
const unauthorized = "The request is missing a valid auth token.";
const forbidden = "The user is not authorized to access the requested resource.";
const notFound = "A resource with the requested id could not be found.";
const notAllowed = "The request method is not allowed for the endpoint.";
const notAcceptable = "The server only produces responses that conform to an 'application/json' value provided in the request 'Accept' header."
const internalServerError = "An unexpected server error occurred.";


module.exports = {
    CLIENT_ID: CLIENT_ID,
    getBaseURL,
    BAD_REQUEST: badRequest,
    BAD_REQUEST_NO_DUPLICATES: badRequestNoDuplicates,
    UNAUTHORIZED: unauthorized,
    FORBIDDEN: forbidden,
    NOT_FOUND: notFound,
    NOT_ALLOWED: notAllowed,
    NOT_ACCEPTABLE: notAcceptable,
    INTERNAL_SERVER_ERROR: internalServerError
};
