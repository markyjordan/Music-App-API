const constants = require('../constants');
const trackModel = require('../models/trackModel');

/**
 * CREATE TRACK
 * POST /tracks
 * 
 * Notes:
 * 
 * Returns:
 * 201 - Created; Successfully created a track.
 * 400 - Bad Request; The request object is missing one or more of the required attributes.
 * 406 - Not Acceptable; The server only produces responses that conform to an
 * 'application/json' value provided in the request 'Accept' header.
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const createTrack = (req, res) => {
    let playlists = [];
    const baseURL = constants.getBaseURL();
    if (req.get('Accept') !== 'application/json') {
        res.status(406).json({ Error: constants.NOT_ACCEPTABLE });
    } else if (req.body.album == undefined || req.body.artists == undefined || req.body.duration_s == undefined || req.body.name == undefined) {
        res.status(400).json({ Error: constants.BAD_REQUEST });
    } else {
        trackModel.postTrack(req.body.album, req.body.artists, req.body.duration_s, req.body.name, playlists)
        .then(trackKey => {
            res.status(201).json({ 
                id: trackKey.id, 
                album: req.body.album, 
                artists: req.body.artists, 
                duration_s: req.body.duration_s, 
                name: req.body.name, 
                playlists: playlists,
                self_url: `${baseURL}/tracks/${trackKey.id}`
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
        })
    }
};

/**
 * GET TRACKS COLLECTION
 * GET /tracks
 * 
 * Notes:
 * The responsed will be paginated, with a maximum of 5 tracks per page.
 * 
 * Returns:
 * 200 - OK; Successfully retrieved all tracks.
 * 406 - Not Acceptable; The server only produces responses that conform to an
 * 'application/json' value provided in the request 'Accept' header.
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const getTracks = (req, res) => {
    if (req.get('Accept') !== 'application/json') {
        res.status(406).json({ Error: constants.NOT_ACCEPTABLE });
    } else {
        trackModel.getTracks()
        .then(tracks => {
            res.status(200).json(tracks);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
        })
    }
};

/**
 * GET TRACK BY ID
 * GET /tracks/:track_id
 * 
 * Notes:
 * 
 * 
 * Returns:
 * 200 - OK; Successfully retrieved all tracks.
 * 404 - Not Found; No track with this track_id exists.
 * 406 - Not Acceptable; The server only produces responses that conform to an
 * 'application/json' value provided in the request 'Accept' header.
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const getTrackByID = (req, res) => {
    const track_id = req.params.track_id;
    if (req.get('Accept') !== 'application/json') {
        res.status(406).json({ Error: constants.NOT_ACCEPTABLE });
    } else {
        trackModel.getTrackByID(track_id)
        .then(track => {
            if (track[0] === undefined || track[0] === null){
                res.status(404).json({ Error: constants.NOT_FOUND });
            } else {
                res.status(200).json(track[0]);
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
        })
    }
};

/**
 * PATCH TRACK BY ID
 * PATCH /tracks/:track_id
 * 
 * Notes:
 * 
 * 
 * Returns:
 * 200 - OK; Successfully updated track.
 * 404 - Not Found; No track with this track_id exists.
 * 406 - Not Acceptable; The server only produces responses that conform to an
 * 'application/json' value provided in the request 'Accept' header.
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const patchTrackByID = (req, res) => {
    const track_id = req.params.track_id;
    const baseURL = constants.getBaseURL();
    if (req.get('Accept') !== 'application/json') {
        res.status(406).json({ Error: constants.NOT_ACCEPTABLE });
    } 
    trackModel.getTrackByID(track_id)
    .then(track => {
        if (track[0] === undefined || track[0] === null) {
            res.status(404).json({ Error: constants.NOT_FOUND });
        } else {
            if (req.body.album === undefined) {
                req.body.album = track[0].album;
            } 
            if (req.body.artists === undefined) {
                req.body.artists = track[0].artists;
            }
            if (req.body.duration_s === undefined) {
                req.body.duration_s = track[0].duration_s;
            }
            if (req.body.name === undefined) {
                req.body.name = track[0].name;
            }
            if (req.body.playlists === undefined) {
                req.body.playlists = track[0].playlists;
            }
            trackModel.patchTrackByID(track_id, req.body.album, req.body.artists, req.body.duration_s, req.body.name, track[0].playlists)
            .then(() => {
                res.status(200).json({
                    id: track_id,
                    album: req.body.album,
                    artists: req.body.artists,
                    duration_s: req.body.duration_s,
                    name: req.body.name,
                    playlists: track[0].playlists,
                    self_url: `${baseURL}/tracks/${track_id}`
                })
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
    })
};

/**
 * PATCH ALL TRACKS
 * PATCH /tracks
 * 
 * Notes:
 * This method is not, and should not be, supported by the server.
 * 
 * Returns:
 * 405 - Method Not Allowed; This method is not supported.
 */
const patchTracks = (req, res) => {
    res.set('Allow', 'GET, POST');
    res.status(405).send({ Error: constants.NOT_ALLOWED }).end();
};

/**
 * UPDATE TRACK BY ID
 * PUT /tracks/:track_id
 * 
 * Notes:
 * 
 * 
 * Returns:
 * 200 - OK; Successfully updated track.
 * 400 - Bad Request; The request body is missing at least one of the required
 * attributes.
 * 404 - Not Found; No track with this track_id exists.
 * 406 - Not Acceptable; The server only produces responses that conform to an 
 * 'application/json' value provided in the request 'Accept' header.
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const updateTrackByID = (req, res) => {
    const track_id = req.params.track_id;
    const baseURL = constants.getBaseURL();
    if (req.get('Accept') !== 'application/json') {
        res.status(406).json({ Error: constants.NOT_ACCEPTABLE });
    }
    trackModel.getTrackByID(track_id)
    .then(track => {
        if (track[0] === undefined || track[0] === null) {
            res.status(404).json({ Error: constants.NOT_FOUND });
        } else if (req.body.album === undefined || req.body.artists === undefined || req.body.duration_s === undefined || req.body.name === undefined) {
            res.status(400).json({ Error: constants.BAD_REQUEST });
        } else {
            if (req.body.playlists === undefined) {
                req.body.playlists = track[0].playlists;
            }
            trackModel.updateTrackByID(track_id, req.body.album, req.body.artists, req.body.duration_s, req.body.name, track[0].playlists)
            .then(() => {
                res.status(200).json({
                    id: track_id,
                    album: req.body.album,
                    artists: req.body.artists,
                    duration_s: req.body.duration_s,
                    name: req.body.name,
                    playlists: track[0].playlists,
                    self_url: `${baseURL}/tracks/${track_id}`
                })
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
    })
};

/**
 * UPDATE ALL TRACKS
 * PUT /tracks
 * 
 * Notes:
 * This method is not, and should not be, supported by the server.
 * 
 * Returns:
 * 405 - Method Not Allowed; This method is not supported.
 */
const updateTracks = (req, res) => {
    res.set('Allow', 'GET, POST');
    res.status(405).send({ Error: constants.NOT_ALLOWED }).end();
};

/**
 * DELETE TRACK BY ID
 * DELETE /tracks/:track_id
 * 
 * Notes:
 * 
 * 
 * Returns:
 * 204 - No Content; Successfully deleted track.
 * 404 - Not Found; No track with this track_id exists.
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const deleteTrackByID = (req, res) => {
    const track_id = req.params.track_id;
    trackModel.getTrackByID(track_id)
    .then(track => {
        if (track[0] === undefined || track[0] === null) {
            res.status(404).json({ Error: constants.NOT_FOUND });
        } else {
            trackModel.deleteTrackByID(track_id)
            .then(() => {
                res.status(204).end();
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
    })
};

/**
 * DELETE ALL TRACKS
 * DELETE /tracks
 * 
 * Notes:
 * This method is not, and should not be, supported by the server.
 * 
 * Returns:
 * 405 - Method Not Allowed; This method is not supported.
 */
const deleteTracks = (req, res) => {
    res.set('Allow', 'GET, POST');
    res.status(405).send({ Error: constants.NOT_ALLOWED }).end();
};


module.exports = {
    createTrack: createTrack,
    getTracks: getTracks,
    getTrackByID: getTrackByID,
    patchTrackByID: patchTrackByID,
    patchTracks: patchTracks, 
    updateTrackByID: updateTrackByID,
    updateTracks: updateTracks,
    deleteTrackByID: deleteTrackByID,
    deleteTracks: deleteTracks
};
